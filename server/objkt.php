<?php
/**
 * objkt.com (Tezos) NFT Component
 * -------------------------------
 * Renders a grid of NFT cards for artworks listed on objkt.com. Given a list of
 * objkt URLs, it queries the objkt public GraphQL API (https://data.objkt.com/v3/graphql)
 * for live data — edition size, number of collectors, how many are for sale, and
 * the floor price — and renders a thumbnail plus an "Acquire" / "View on objkt"
 * button for each.
 *
 * This is intentionally SEPARATE from gallery.php (which handles physical
 * paintings and prints). Nothing here touches that component.
 *
 * Supported URL shapes:
 *   https://objkt.com/asset/hicetnunc/<id>          (legacy hic et nunc / HEN OBJKTS)
 *   https://objkt.com/tokens/<KT1...>/<token_id>    (any FA2 collection)
 *   https://objkt.com/asset/<KT1...>/<token_id>     (newer asset path)
 *
 * Basic usage (in a project index.php or any root page):
 *
 *   include("server/objkt.php");                    // root page
 *   // or: include("../../server/objkt.php");       // inside YEAR/project/index.php
 *
 *   echo render_objkt_gallery([
 *       'ref'    => 'tz1NqueFctvNCQrsELm6k4N6XfwAYu5Qp5LN',   // your referral address (optional)
 *       'tokens' => [
 *           'https://objkt.com/asset/hicetnunc/320118',
 *           'https://objkt.com/tokens/KT1CkDFaHiH8UtZhyR2EvoqhihsntjSikvt9/21',
 *           // per-item local thumbnail override (skips IPFS for that card):
 *           ['url' => 'https://objkt.com/asset/hicetnunc/50442', 'thumb' => 'assets/flight003.png'],
 *       ],
 *   ]);
 *
 * Responses are cached to cache/objkt/*.json (default TTL 1 hour) so page loads
 * do not hit the API every time; if the API is unreachable the last cached copy
 * is served instead.
 */

/** HEN / hic et nunc "OBJKTS" FA2 contract (used by the objkt.com/asset/hicetnunc/<id> path). */
const OBJKT_HEN_CONTRACT = 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton';
const OBJKT_GRAPHQL      = 'https://data.objkt.com/v3/graphql';
/** Tezos burn address — holders at this address are burned editions, not collectors. */
const OBJKT_BURN_ADDRESS = 'tz1burnburnburnburnburnburnburjAYjjX';

/**
 * Parse an objkt.com URL into a contract + token id.
 *
 * @param string $url
 * @return array|null ['fa_contract' => 'KT1...', 'token_id' => '123'] or null if unrecognised
 */
function objkt_parse_url($url) {
    $url = trim((string)$url);

    // Legacy hic et nunc: objkt.com/asset/hicetnunc/<id>
    if (preg_match('#objkt\.com/asset/hicetnunc/(\d+)#i', $url, $m)) {
        return ['fa_contract' => OBJKT_HEN_CONTRACT, 'token_id' => $m[1]];
    }

    // FA2: objkt.com/(asset|tokens)/<KT1...>/<token_id>
    if (preg_match('#objkt\.com/(?:asset|tokens)/(KT1[0-9A-Za-z]{33})/(\d+)#', $url, $m)) {
        return ['fa_contract' => $m[1], 'token_id' => $m[2]];
    }

    return null;
}

/**
 * Convert an ipfs:// URI into an HTTP gateway URL. Passes through http(s) URLs.
 *
 * @param string $uri
 * @param string $gateway Gateway base ending in /ipfs/ (e.g. https://ipfs.io/ipfs/)
 * @return string
 */
function objkt_ipfs_to_http($uri, $gateway = 'https://ipfs.io/ipfs/') {
    $uri = (string)$uri;
    if (strncmp($uri, 'ipfs://', 7) === 0) {
        return rtrim($gateway, '/') . '/' . substr($uri, 7);
    }
    return $uri;
}

/**
 * POST a GraphQL query to the objkt API. Returns the decoded `data.token` array,
 * or null on any transport/GraphQL error.
 *
 * @param string $query
 * @return array|null
 */
function objkt_graphql($query) {
    $payload = json_encode(['query' => $query]);

    $resp = null;
    if (function_exists('curl_init')) {
        $ch = curl_init(OBJKT_GRAPHQL);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT        => 12,
        ]);
        $resp = curl_exec($ch);
        $failed = ($resp === false) || curl_errno($ch);
        // curl_close() is a deprecated no-op since PHP 8.0; the handle is freed on scope exit.
        if ($failed) return null;
    } else {
        $ctx = stream_context_create(['http' => [
            'method'        => 'POST',
            'header'        => "Content-Type: application/json\r\n",
            'content'       => $payload,
            'timeout'       => 12,
            'ignore_errors' => true,
        ]]);
        $resp = @file_get_contents(OBJKT_GRAPHQL, false, $ctx);
        if ($resp === false) return null;
    }

    $data = json_decode($resp, true);
    if (!is_array($data) || isset($data['errors']) || !isset($data['data']['token'])) {
        return null;
    }
    return $data['data']['token'];
}

/**
 * Fetch live data for a batch of tokens in a single request, with file caching.
 *
 * @param array  $refs      List of ['fa_contract' => ..., 'token_id' => ...]
 * @param int    $ttl       Cache lifetime in seconds
 * @param string $cache_dir Cache directory (defaults to <repo>/cache/objkt)
 * @return array Map of "contract:token_id" => token data
 */
function objkt_fetch_tokens(array $refs, $ttl = 3600, $cache_dir = null) {
    if (empty($refs)) return [];
    if ($cache_dir === null) $cache_dir = __DIR__ . '/../cache/objkt';

    // De-duplicate and sort for a stable cache key.
    $keys = [];
    foreach ($refs as $r) {
        $keys[$r['fa_contract'] . ':' . $r['token_id']] = $r;
    }
    ksort($keys);
    $cache_file = rtrim($cache_dir, '/') . '/' . md5(implode('|', array_keys($keys))) . '.json';

    // Serve fresh cache if available.
    if (is_file($cache_file) && (time() - filemtime($cache_file) < $ttl)) {
        $cached = json_decode((string)@file_get_contents($cache_file), true);
        if (is_array($cached)) return $cached;
    }

    // Build the batched _or query.
    $or = [];
    foreach ($keys as $r) {
        // Values are validated by objkt_parse_url (contract ^KT1...$, token_id ^\d+$).
        $or[] = sprintf('{fa_contract: {_eq: "%s"}, token_id: {_eq: "%s"}}', $r['fa_contract'], $r['token_id']);
    }
    $query = 'query { token(where: {_or: [' . implode(',', $or) . ']}) { '
           . 'fa_contract token_id name supply mime artifact_uri thumbnail_uri display_uri lowest_ask '
           . 'listings_active { amount currency_id } '
           . 'holders(where: {quantity: {_gt: 0}}) { holder_address quantity } '
           . '} }';

    $tokens = objkt_graphql($query);

    // On failure (e.g. outbound requests blocked on the host), fall back to
    // stale cache, then to the bundled seed data committed in git.
    if ($tokens === null) {
        if (is_file($cache_file)) {
            $stale = json_decode((string)@file_get_contents($cache_file), true);
            if (is_array($stale)) return $stale;
        }
        return objkt_fallback_tokens($keys);
    }

    // Index by contract:token_id.
    $out = [];
    foreach ($tokens as $t) {
        $out[$t['fa_contract'] . ':' . $t['token_id']] = $t;
    }

    // Backfill any tokens the live API didn't return (e.g. delisted/indexer lag)
    // with bundled seed data so thumbnails still render.
    $missing = array_diff_key($keys, $out);
    if (!empty($missing)) {
        $out += objkt_fallback_tokens($missing);
    }

    // Write cache (best-effort).
    if (!is_dir($cache_dir)) @mkdir($cache_dir, 0775, true);
    if (is_dir($cache_dir) && is_writable($cache_dir)) {
        @file_put_contents($cache_file, json_encode($out), LOCK_EX);
    }

    return $out;
}

/**
 * Derive display stats from a token record.
 *
 * @param array $t
 * @return array ['supply', 'owners', 'held', 'available', 'floor']
 *   owners    = distinct collectors (excludes marketplace escrow KT1 addresses + burn)
 *   held      = editions in collectors' hands
 *   available = editions currently listed for sale
 *   floor     = lowest ask in mutez (or null)
 */
function objkt_token_stats($t) {
    $supply = isset($t['supply']) ? (int)$t['supply'] : 0;

    $owners = 0;
    $held   = 0;
    if (!empty($t['holders']) && is_array($t['holders'])) {
        foreach ($t['holders'] as $h) {
            $addr = isset($h['holder_address']) ? $h['holder_address'] : '';
            if ($addr === OBJKT_BURN_ADDRESS) continue;      // burned edition
            if (strncmp($addr, 'KT', 2) === 0) continue;     // marketplace / contract escrow
            $owners++;
            $held += (int)$h['quantity'];
        }
    }

    $available = 0;
    if (!empty($t['listings_active']) && is_array($t['listings_active'])) {
        foreach ($t['listings_active'] as $l) {
            $available += (int)$l['amount'];
        }
    }

    $floor = (isset($t['lowest_ask']) && $t['lowest_ask'] !== null) ? (int)$t['lowest_ask'] : null;

    return [
        'supply'    => $supply,
        'owners'    => $owners,
        'held'      => $held,
        'available' => $available,
        'floor'     => $floor,
    ];
}

/**
 * Format a mutez price for display (Tezos). Trims trailing zeros.
 *
 * @param int|null $mutez
 * @param int      $currency_id objkt currency id (1 = tez)
 * @return string|null e.g. "80 ꜩ", or null when price is null
 */
function objkt_format_price($mutez, $currency_id = 1) {
    if ($mutez === null) return null;
    $tez = $mutez / 1000000;
    $s = rtrim(rtrim(number_format($tez, 2, '.', ','), '0'), '.');
    if ($s === '') $s = '0';
    return ($currency_id === 1 || $currency_id === null) ? ($s . ' ꜩ') : $s;
}

/** Generic placeholder thumbnail some legacy hic et nunc tokens return; not real artwork. */
const OBJKT_PLACEHOLDER_THUMB = 'QmNrhZHUaEqxhyLfqoq1mtHSipkWHeT31LNHb1QEbDHgnc';
/** objkt's media CDN — pre-rendered, resized thumbnails keyed by IPFS CID. */
const OBJKT_CDN_BASE = 'https://assets.objkt.media/file/assets-003/';

/**
 * Build an objkt CDN thumbnail URL from an ipfs:// URI.
 * This is the same source objkt.com's own grids use.
 *
 * @param string $ipfs_uri ipfs://<cid>[/path]
 * @param string $size     thumb288 | thumb400 (CDN-supported sizes)
 * @return string CDN URL, or '' if the URI is not an ipfs:// URI
 */
function objkt_cdn_thumb($ipfs_uri, $size = 'thumb400') {
    if (!is_string($ipfs_uri) || strncmp($ipfs_uri, 'ipfs://', 7) !== 0) return '';
    $cid = substr($ipfs_uri, 7);
    $slash = strpos($cid, '/');
    if ($slash !== false) $cid = substr($cid, 0, $slash);
    if ($cid === '') return '';
    return OBJKT_CDN_BASE . $cid . '/' . $size;
}

/**
 * Resolve the best thumbnail for a token.
 *
 * Priority: local override > objkt CDN thumbnail of the artifact (fast, resized,
 * static — or animated webp for animated works — exactly what objkt.com's grids
 * show) > display_uri via IPFS gateway > thumbnail_uri via IPFS gateway (unless
 * it is the known placeholder).
 *
 * @param array $token
 * @param array $opts ['gateway', 'thumb', 'cdn_size']
 * @return array ['type' => 'img'|'none', 'src' => string]
 */
function objkt_thumb_media($token, $opts) {
    $gateway  = $opts['gateway'];
    $cdn_size = isset($opts['cdn_size']) ? $opts['cdn_size'] : 'thumb400';

    // 1. Explicit local override.
    if (!empty($opts['thumb'])) {
        return ['type' => 'img', 'src' => $opts['thumb']];
    }
    // 2. objkt's own CDN thumbnail of the artifact (what the objkt.com grids use).
    if (!empty($token['artifact_uri'])) {
        $cdn = objkt_cdn_thumb($token['artifact_uri'], $cdn_size);
        if ($cdn !== '') return ['type' => 'img', 'src' => $cdn];
    }
    // 3. Fallbacks via a public IPFS gateway.
    if (!empty($token['display_uri'])) {
        return ['type' => 'img', 'src' => objkt_ipfs_to_http($token['display_uri'], $gateway)];
    }
    if (!empty($token['thumbnail_uri'])
        && strpos($token['thumbnail_uri'], OBJKT_PLACEHOLDER_THUMB) === false) {
        return ['type' => 'img', 'src' => objkt_ipfs_to_http($token['thumbnail_uri'], $gateway)];
    }
    return ['type' => 'none', 'src' => ''];
}

/**
 * Render a single NFT card.
 *
 * @param array $token Token data from objkt_fetch_tokens (may be a stub with only contract/token_id on API failure)
 * @param array $opts  ['ref', 'gateway', 'thumb']
 * @return string HTML
 */
function render_objkt_item($token, $opts) {
    $contract = $token['fa_contract'];
    $token_id = $token['token_id'];
    $has_data = isset($token['supply']) || isset($token['name']);

    $name  = (isset($token['name']) && $token['name'] !== '') ? $token['name'] : ('Token #' . $token_id);
    $stats = objkt_token_stats($token);

    // Thumbnail media (image, the NFT's own video artifact, or nothing).
    $media = objkt_thumb_media($token, $opts);

    // Canonical objkt URL (+ optional referral).
    $objkt_url = 'https://objkt.com/tokens/' . $contract . '/' . rawurlencode($token_id);
    if (!empty($opts['ref'])) {
        $objkt_url .= '?ref=' . rawurlencode($opts['ref']);
    }

    $e         = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
    $floor_str = objkt_format_price($stats['floor']);
    $available = $stats['available'];

    $html  = '<div class="nft-item">';

    // Thumbnail
    $html .= '<a class="nft-thumb-link" href="' . $e($objkt_url) . '" target="_blank" rel="noopener noreferrer">';
    if ($media['type'] === 'video') {
        // no-referrer: objkt's CDN hotlink-blocks (403) any Referer other than objkt.com/localhost.
        $html .= '<video class="nft-thumb" src="' . $e($media['src']) . '" '
               . 'autoplay muted loop playsinline preload="metadata" referrerpolicy="no-referrer" '
               . 'aria-label="' . $e($name) . '"></video>';
    } elseif ($media['type'] === 'img') {
        // no-referrer: objkt's CDN hotlink-blocks (403) any Referer other than objkt.com/localhost.
        $html .= '<img class="nft-thumb" src="' . $e($media['src']) . '" alt="' . $e($name) . '" loading="lazy" referrerpolicy="no-referrer">';
    } else {
        $html .= '<div class="nft-thumb nft-thumb-missing" aria-hidden="true"></div>';
    }
    $html .= '</a>';

    // Info
    $html .= '<div class="nft-info">';
    $html .= '<div class="nft-title">' . $e($name) . '</div>';

    if ($has_data) {
        $html .= '<div class="nft-stats">';
        $html .= '<span class="nft-stat">Edition of ' . (int)$stats['supply'] . '</span>';
        $html .= '<span class="nft-stat">' . (int)$stats['owners'] . ' ' . ($stats['owners'] === 1 ? 'collector' : 'collectors') . '</span>';
        $html .= '</div>';

        $html .= '<div class="nft-buttons">';
        if ($available > 0) {
            $label = $floor_str ? ('Acquire · ' . $floor_str) : 'Acquire';
            $html .= '<a class="nft-btn nft-btn-buy" href="' . $e($objkt_url) . '" target="_blank" rel="noopener noreferrer">' . $e($label) . '</a>';
            $html .= '<span class="nft-avail">' . (int)$available . ' available</span>';
        } else {
            $html .= '<a class="nft-btn nft-btn-view" href="' . $e($objkt_url) . '" target="_blank" rel="noopener noreferrer">View on objkt</a>';
            $html .= '<span class="nft-avail nft-sold">Fully collected</span>';
        }
        $html .= '</div>';
    } else {
        // API unreachable and no cache — still offer the link.
        $html .= '<div class="nft-buttons">';
        $html .= '<a class="nft-btn nft-btn-view" href="' . $e($objkt_url) . '" target="_blank" rel="noopener noreferrer">View on objkt</a>';
        $html .= '</div>';
    }

    $html .= '</div>'; // .nft-info
    $html .= '</div>'; // .nft-item
    return $html;
}

/**
 * Render a complete NFT gallery from a list of objkt URLs.
 *
 * @param array $options
 *   - tokens:    array of URL strings, or ['url' => ..., 'thumb' => 'local/override.png']
 *   - ref:       your Tezos referral address, appended as ?ref= to acquire links (optional)
 *   - gateway:   IPFS gateway base (default https://ipfs.io/ipfs/)
 *   - cache_ttl: seconds (default 3600)
 *   - cache_dir: override cache directory (default <repo>/cache/objkt)
 *   - title:     optional heading above the grid
 * @return string HTML
 */
function render_objkt_gallery($options = []) {
    $opts = array_merge([
        'tokens'    => [],
        'ref'       => '',
        'gateway'   => 'https://ipfs.io/ipfs/',
        'cdn_size'  => 'thumb400',   // objkt CDN size: thumb288 | thumb400
        'cache_ttl' => 3600,
        'cache_dir' => null,
        'title'     => '',
    ], $options);

    // Normalise entries and collect refs for the batch query.
    $entries = [];
    $refs    = [];
    foreach ($opts['tokens'] as $entry) {
        if (is_string($entry)) $entry = ['url' => $entry];
        if (empty($entry['url'])) continue;
        $parsed = objkt_parse_url($entry['url']);
        if (!$parsed) continue;
        $entry['parsed'] = $parsed;
        $entries[]       = $entry;
        $refs[]          = $parsed;
    }

    $data = objkt_fetch_tokens($refs, $opts['cache_ttl'], $opts['cache_dir']);

    $html = objkt_styles();
    if ($opts['title'] !== '') {
        $html .= '<h3 class="nft-gallery-title">' . htmlspecialchars($opts['title'], ENT_QUOTES, 'UTF-8') . '</h3>';
    }
    $html .= '<div class="nft-gallery">';
    foreach ($entries as $entry) {
        $key   = $entry['parsed']['fa_contract'] . ':' . $entry['parsed']['token_id'];
        $token = isset($data[$key]) ? $data[$key] : [
            'fa_contract' => $entry['parsed']['fa_contract'],
            'token_id'    => $entry['parsed']['token_id'],
        ];
        $html .= render_objkt_item($token, [
            'ref'      => $opts['ref'],
            'gateway'  => $opts['gateway'],
            'cdn_size' => $opts['cdn_size'],
            'thumb'    => isset($entry['thumb']) ? $entry['thumb'] : '',
        ]);
    }
    $html .= '</div>';
    return $html;
}

/**
 * Render a project README, swapping its static "editions" list for the live
 * objkt gallery. README.md is NOT modified on disk — the block is only removed
 * from the rendered web output, so the file stays intact for the PDF portfolio.
 *
 * @param string $readme_path     Path to README.md
 * @param object $Parsedown       A Parsedown / ParsedownExtended instance
 * @param array  $gallery_options Options forwarded to render_objkt_gallery()
 * @param array  $opts
 *   - strip_pattern: regex (with delimiters) matching the static block to remove.
 *       Default matches a "## Editions ..." section up to the next "## " heading
 *       or end of file. Pass a custom pattern for READMEs that list editions
 *       without an "## Editions" heading.
 *   - heading: text rendered as an <h2> above the gallery ('' to omit). Default 'Editions'.
 * @return string HTML
 */
function render_readme_with_objkt($readme_path, $Parsedown, $gallery_options, $opts = []) {
    $opts = array_merge([
        'strip_pattern' => '/^##[ \t]*Editions\b.*?(?=^##[ \t]|\z)/ims',
        'heading'       => 'Editions',
    ], $opts);

    $md = @file_get_contents($readme_path);
    if ($md === false) $md = '';

    $marker = 'OBJKTGALLERYPLACEHOLDER';
    $count  = 0;
    $md = preg_replace($opts['strip_pattern'], "\n\n" . $marker . "\n\n", $md, 1, $count);

    $html = $Parsedown->text($md);

    $gallery = '';
    if ($opts['heading'] !== '') {
        $gallery .= '<h2>' . htmlspecialchars($opts['heading'], ENT_QUOTES, 'UTF-8') . '</h2>';
    }
    $gallery .= render_objkt_gallery($gallery_options);

    if ($count > 0) {
        // Parsedown wraps the lone marker line in <p>...</p>.
        $replaced = str_replace('<p>' . $marker . '</p>', $gallery, $html, $n);
        $html = ($n > 0) ? $replaced : str_replace($marker, $gallery, $html);
    } else {
        // Static block not found — append the gallery at the end.
        $html .= $gallery;
    }

    return $html;
}

/**
 * Component styles. Emitted only once per request.
 *
 * @return string
 */
function objkt_styles() {
    static $emitted = false;
    if ($emitted) return '';
    $emitted = true;

    return <<<CSS
<style>
.nft-gallery { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:24px; margin:24px 0; }
.nft-item { display:flex; flex-direction:column; }
.nft-thumb-link { display:block; aspect-ratio:1/1; background:#f4f4f4; overflow:hidden; }
.nft-thumb { width:100%; height:100%; object-fit:cover; display:block; transition:transform .3s ease; }
.nft-thumb-link:hover .nft-thumb { transform:scale(1.03); }
.nft-thumb-missing { width:100%; height:100%; background:repeating-linear-gradient(45deg,#eee,#eee 10px,#e6e6e6 10px,#e6e6e6 20px); }
.nft-info { padding:10px 2px 0; }
.nft-title { font-weight:600; font-size:.95rem; line-height:1.25; margin-bottom:5px; }
.nft-stats { display:flex; flex-wrap:wrap; gap:4px 12px; font-size:.76rem; color:#777; margin-bottom:11px; }
.nft-buttons { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.nft-btn { display:inline-block; padding:6px 15px; font-size:.8rem; line-height:1.2; text-decoration:none; border:1px solid currentColor; border-radius:2px; white-space:nowrap; }
.nft-btn-buy { color:#d0021b; }
.nft-btn-buy:hover { background:#d0021b; color:#fff; }
.nft-btn-view { color:#333; }
.nft-btn-view:hover { background:#333; color:#fff; }
.nft-avail { font-size:.72rem; color:#999; }
.nft-avail.nft-sold { color:#bbb; }
.nft-gallery-title { margin:1.5rem 0 .5rem; }
</style>
CSS;
}
