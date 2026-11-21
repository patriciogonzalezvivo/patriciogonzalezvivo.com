<?php
/**
 * SEO / structured-data helpers, included by header.php.
 *
 * One place for who the artist is and what the work is about, so every page's
 * <meta>, Open Graph tags and JSON-LD say the same thing. The wording comes from
 * README.md (bio), artist_statement.md and cv.md; edit it HERE, not per page.
 *
 *   seo_graph($ctx)  -> JSON-LD @graph (Person, WebSite, page node, breadcrumbs)
 *   seo_readme_summary()  -> a meta description drawn from a project's README.md
 */

const SEO_SITE_URL  = 'https://patriciogonzalezvivo.com';
const SEO_NAME      = 'Patricio Gonzalez Vivo';
const SEO_NAME_ALT  = 'Patricio González Vivo';

// ≤ 160 characters: what search results show under the title.
const SEO_DESCRIPTION = 'Patricio González Vivo is a new media artist bridging oil paint and code. Research-driven work on memory, awareness and non-linear time.';

const SEO_HOME_TITLE = 'Patricio Gonzalez Vivo - New media artist, oil paint & code';

// Long form (Open Graph, JSON-LD). First two sentences are the bio's own wording (README.md); keep them verbatim.
const SEO_BIO = 'Patricio González Vivo (b. 1982, Buenos Aires) is a multidisciplinary artist whose research-driven practice follows non-linear experiences such as memory, awareness and self-expression. Each project is another iteration of that inquiry, bridging analog and digital languages as ways of knowing. His two main mediums are oil paint and computer code, linked by custom drawing machines (plotters). Time in his work does not run in a line: old starlight, a chosen lineage and animated portraits keep arriving. Author of The Book of Shaders and maker of open-source tools for creative coding.';

const SEO_KEYWORDS = 'Patricio Gonzalez Vivo, new media artist, contemporary artist, oil painting, creative coding, generative art, drawing machines, plotter, shaders, GLSL, The Book of Shaders, astronomy, star maps, non-linear time, memory, lineage, portraits, Argentine artist, Buenos Aires';

// Topics the work is about (Person.knowsAbout). Each one is stated on the site.
const SEO_TOPICS = [
    'Oil painting',
    'Generative art',
    'Creative coding',
    'Shader programming (GLSL)',
    'Pen plotters and drawing machines',
    'Computer vision',
    'Astronomy and star maps',
    'Memory, perception and awareness',
    'Non-linear time and lineage',
    'New media art',
    'Portraiture',
    'Expressive arts therapy',
    'Open source education',
];

// Profiles that are unambiguously him (Person.sameAs). Add Wikidata / LinkedIn /
// Bluesky / Are.na URLs here when you want them associated with this site.
const SEO_SAME_AS = [
    'https://www.instagram.com/patriciogonzalezvivo',
    'https://github.com/patriciogonzalezvivo',
];

// User-agent substrings of crawlers that train models or build datasets. Refused with 403 by header.php
// and, for images and files that never touch PHP, by .htaccess / server/ai_block.nginx.conf (keep the
// three lists, and robots.txt, in sync). AI *search* and answer bots are deliberately not here.
// Never add Googlebot, Bingbot, Applebot or facebookexternalhit: they are search and link previews.
const SEO_BLOCKED_AGENTS = [
    'GPTBot', 'ClaudeBot', 'anthropic-ai', 'CCBot', 'Bytespider', 'Amazonbot', 'meta-externalagent',
    'FacebookBot', 'cohere-ai', 'cohere-training-data-crawler', 'Diffbot', 'ImagesiftBot', 'Omgilibot',
    'Omgili', 'Timpibot', 'YouBot', 'Ai2Bot', 'img2dataset', 'Scrapy', 'GoogleOther',
];

/** True when the request comes from a training / dataset crawler. */
function seo_is_blocked_agent($ua) {
    foreach (SEO_BLOCKED_AGENTS as $a) if (stripos((string) $ua, $a) !== false) return true;
    return false;
}

const SEO_PORTRAIT = '/images/about_thin.jpg';

// Credit that travels with every work and image (schema.org creditText / copyrightNotice).
// Answer engines and image search read these to attribute; the rights reservation is stated in llms.txt.
const SEO_CREDIT = 'Patricio Gonzalez Vivo, patriciogonzalezvivo.com';
function seo_copyright($year = null) {
    return '© ' . ($year ?: date('Y')) . ' ' . SEO_NAME . '. All rights reserved. Not licensed for AI training, dataset building, or for generating work in his name or style.';
}

/** An image that names its author: crawlers that lift the picture lift the credit with it. */
function seo_image_node($url, $year = null) {
    return [
        '@type' => 'ImageObject',
        'contentUrl' => $url,
        'url' => $url,
        'creator' => seo_person_ref(),
        'creditText' => SEO_CREDIT,
        'copyrightNotice' => seo_copyright($year),
    ];
}

/** Markdown/HTML -> plain text (links keep their label, images and blocks are dropped). */
function seo_plain_text($md) {
    $md = preg_replace('/^:::.*?^:::\s*$/ms', '', $md);           // :::wrapfig ... ::: blocks
    $md = preg_replace('/<[^>]*>/', ' ', $md);                     // html tags
    $md = preg_replace('/!\[[^\]]*\]\([^)]*\)/', '', $md);         // images
    $md = preg_replace('/\[([^\]]+)\]\([^)]*\)/', '$1', $md);      // [label](url) -> label
    $md = preg_replace('/^\s{0,3}#{1,6}\s.*$/m', '', $md);         // headings
    $md = preg_replace('/^\s*[-*_]{3,}\s*$/m', '', $md);           // hr
    $md = preg_replace('/[*_`>]+/', '', $md);                      // emphasis, code, quotes
    return trim(preg_replace('/[ \t]+/', ' ', $md));
}

/** House style for any text that reaches <meta> or JSON-LD: no em/en dashes, whatever the source file says. */
function seo_clean($text) {
    $text = preg_replace('/\s*[—–]\s*/u', ', ', (string) $text);
    return trim(preg_replace('/,\s*,/', ',', $text));
}

/** Longest run of whole sentences from $text that fits in $max ('' if even the first does not). */
function seo_sentences($text, $max) {
    $out = '';
    foreach (preg_split('/(?<=[.!?])\s+/u', trim($text)) as $s) {
        $next = $out === '' ? $s : $out . ' ' . $s;
        if (mb_strlen($next) > $max) break;
        $out = $next;
    }
    return $out;
}

/** Cut at a word boundary, add an ellipsis only if something was dropped. */
function seo_truncate($text, $max = 155) {
    $text = trim(preg_replace('/\s+/', ' ', $text));
    if (mb_strlen($text) <= $max) return $text;
    $cut = mb_substr($text, 0, $max - 1);
    $space = mb_strrpos($cut, ' ');
    if ($space !== false && $space > $max * 0.6) $cut = mb_substr($cut, 0, $space);
    return rtrim($cut, " ,;:.-—") . '…';
}

/** First real paragraph of <dir>/README.md as a meta description ('' if none). */
function seo_readme_summary($dir = '.', $max = 155) {
    $file = rtrim($dir, '/') . '/README.md';
    if (!is_file($file)) return '';
    $text = seo_plain_text((string) file_get_contents($file));
    foreach (preg_split('/\n\s*\n/', $text) as $para) {
        $para = trim(preg_replace('/\s+/', ' ', $para));
        if (mb_strlen($para) >= 50) return seo_truncate($para, $max);
    }
    return '';
}

/** A one-line meta description for a project page: its DESCRIPTION.txt, padded with the README when that is terse. */
function seo_project_description($description, $dir = '.', $max = 155) {
    $description = seo_clean($description);
    if (mb_strlen($description) >= 90) return seo_truncate($description, $max);
    $readme = seo_clean(seo_readme_summary($dir, 600));
    if ($description === '') return seo_truncate($readme, $max);
    if ($readme === '') return $description;
    // Pad with whole README sentences only: never a clause cut mid-thought.
    $sep = preg_match('/[.!?…]$/u', $description) ? ' ' : '. ';
    $room = $max - mb_strlen($description . $sep);
    $extra = seo_sentences($readme, $room);
    return $extra === '' ? $description : $description . $sep . $extra;
}

/** Last resort for a project with no DESCRIPTION.txt and no README text: only facts the site already holds. */
function seo_work_fallback_description($title, $medium, $year) {
    $line = trim($title);
    if ($year && !preg_match('/\(' . preg_quote($year, '/') . '\)\s*$/', $line)) $line .= ' (' . $year . ')';
    if ($medium) $line .= ': ' . trim($medium);
    return $line . '. A work by ' . SEO_NAME . '.';
}

/** 'lineofsight' / 'efectomariposa_org' -> 'Lineofsight' / 'Efectomariposa Org' (last-resort title). */
function seo_pretty_folder($folder) {
    return ucwords(trim(preg_replace('/[_\-]+/', ' ', $folder)));
}

/** Request path normalised for canonical URLs: no query, `index.php` dropped, directories end in '/'. */
function seo_request_path($request_uri) {
    $path = strtok((string) $request_uri, '?');
    if ($path === false || $path === '') return '/';
    $path = preg_replace('#/index\.php$#', '/', $path);
    if (substr($path, -1) !== '/' && !pathinfo($path, PATHINFO_EXTENSION)) $path .= '/';
    return $path;
}

/** ['year' => '2026', 'folder' => 'medium'] when the path is /YYYY/project/, else null. */
function seo_project_path($path) {
    if (preg_match('#^/(\d{4})/([^/]+)/$#', $path, $m)) return ['year' => $m[1], 'folder' => $m[2]];
    return null;
}

/** schema.org type for a project from its MEDIUM.txt: physical media are VisualArtwork, everything else CreativeWork. */
function seo_work_type($medium) {
    $m = strtolower((string) $medium);
    if (preg_match('/\b(oil|acrylic|canvas|paint|painting|ink|graphite|charcoal|pastel|gouache|watercolou?r|drawing|plot(ter|ted)?|pen|print|paper|collage)\b/', $m)) {
        $form = null;
        if (preg_match('/\b(oil|acrylic|paint|painting|gouache|watercolou?r)\b/', $m)) $form = 'Painting';
        elseif (preg_match('/\b(ink|graphite|charcoal|pastel|drawing|plot(ter|ted)?|pen)\b/', $m)) $form = 'Drawing';
        return ['VisualArtwork', $form];
    }
    return ['CreativeWork', null];
}

function seo_person_ref() {
    return ['@type' => 'Person', '@id' => SEO_SITE_URL . '/#person', 'name' => SEO_NAME, 'url' => SEO_SITE_URL . '/'];
}

/** The full Person node (home and about only: other pages reference it by @id). */
function seo_person_node() {
    return [
        '@type' => 'Person',
        '@id' => SEO_SITE_URL . '/#person',
        'name' => SEO_NAME,
        'alternateName' => [SEO_NAME_ALT],
        'url' => SEO_SITE_URL . '/',
        'image' => SEO_SITE_URL . SEO_PORTRAIT,
        'jobTitle' => 'Artist',
        'description' => SEO_BIO,
        'birthDate' => '1982',
        'birthPlace' => ['@type' => 'Place', 'name' => 'Buenos Aires, Argentina'],
        'knowsAbout' => SEO_TOPICS,
        'alumniOf' => [
            ['@type' => 'CollegeOrUniversity', 'name' => 'Parsons School of Design, The New School'],
            ['@type' => 'CollegeOrUniversity', 'name' => 'Universidad Nacional de las Artes'],
            ['@type' => 'CollegeOrUniversity', 'name' => 'Universidad del Salvador'],
        ],
        'sameAs' => SEO_SAME_AS,
    ];
}

function seo_website_node() {
    return [
        '@type' => 'WebSite',
        '@id' => SEO_SITE_URL . '/#website',
        'url' => SEO_SITE_URL . '/',
        'name' => SEO_NAME,
        'description' => SEO_DESCRIPTION,
        'inLanguage' => 'en',
        'publisher' => ['@id' => SEO_SITE_URL . '/#person'],
    ];
}

function seo_book_node() {
    return [
        '@type' => 'Book',
        '@id' => SEO_SITE_URL . '/#book-of-shaders',
        'name' => 'The Book of Shaders',
        'url' => 'https://thebookofshaders.com/',
        'about' => 'Fragment shader programming in GLSL',
        'author' => [['@id' => SEO_SITE_URL . '/#person'], ['@type' => 'Person', 'name' => 'Jen Lowe']],
    ];
}

function seo_breadcrumbs($crumbs) {
    $items = [];
    foreach (array_values($crumbs) as $i => $c) {
        $items[] = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $c[0], 'item' => $c[1]];
    }
    return ['@type' => 'BreadcrumbList', 'itemListElement' => $items];
}

/**
 * Build the JSON-LD for one page.
 *
 * $ctx keys: kind ('home' | 'profile' | 'collection' | 'work' | 'page'), url, name,
 *   description, image (absolute), year, medium, crumbs ([[name, url], ...])
 */
function seo_graph($ctx) {
    $kind = $ctx['kind'] ?? 'page';
    $url = $ctx['url'];
    $graph = [];

    if ($kind === 'home' || $kind === 'profile') {
        $graph[] = seo_website_node();
        $graph[] = seo_person_node();
        $graph[] = seo_book_node();
    }

    $page = [
        '@id' => $url . '#webpage',
        'url' => $url,
        'name' => $ctx['name'],
        'description' => $ctx['description'],
        'inLanguage' => 'en',
        'isPartOf' => ['@id' => SEO_SITE_URL . '/#website'],
    ];
    $img_year = (!empty($ctx['year']) && preg_match('/^\d{4}$/', (string) $ctx['year'])) ? (string) $ctx['year'] : null;
    if (!empty($ctx['image'])) $page['primaryImageOfPage'] = seo_image_node($ctx['image'], $img_year);

    if ($kind === 'profile') {
        $page['@type'] = 'ProfilePage';
        $page['mainEntity'] = ['@id' => SEO_SITE_URL . '/#person'];
    } elseif ($kind === 'collection') {
        $page['@type'] = 'CollectionPage';
        $page['author'] = seo_person_ref();
    } elseif ($kind === 'work') {
        $page['@type'] = 'WebPage';
        $page['mainEntity'] = ['@id' => $url . '#work'];
        [$type, $form] = seo_work_type($ctx['medium'] ?? '');
        $work = [
            '@type' => $type,
            '@id' => $url . '#work',
            'name' => $ctx['name'],
            'url' => $url,
            'description' => $ctx['description'],
            'creator' => seo_person_ref(),
            'author' => seo_person_ref(),
            'copyrightHolder' => seo_person_ref(),
            'creditText' => SEO_CREDIT,
            'copyrightNotice' => seo_copyright($img_year),
            'isPartOf' => ['@id' => SEO_SITE_URL . '/#website'],
        ];
        if (!empty($ctx['year']) && preg_match('/^\d{4}$/', (string) $ctx['year'])) {
            $work['dateCreated'] = (string) $ctx['year'];
            $work['copyrightYear'] = (int) $ctx['year'];
        }
        if (!empty($ctx['image'])) $work['image'] = seo_image_node($ctx['image'], $img_year);
        if (!empty($ctx['medium'])) {
            if ($type === 'VisualArtwork') {
                $work['artMedium'] = $ctx['medium'];
                if ($form) $work['artform'] = $form;
            } else {
                $work['genre'] = $ctx['medium'];
            }
        }
        $graph[] = $work;
    } else {
        $page['@type'] = 'WebPage';
    }
    $graph[] = $page;

    if (!empty($ctx['crumbs']) && count($ctx['crumbs']) > 1) $graph[] = seo_breadcrumbs($ctx['crumbs']);

    return ['@context' => 'https://schema.org', '@graph' => $graph];
}

/** <script type="application/ld+json"> block. JSON_HEX_* keep project text from closing the tag. */
function seo_jsonld_tag($graph) {
    $json = json_encode($graph, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_PRETTY_PRINT);
    return "\n\t\t<script type=\"application/ld+json\">\n" . $json . "\n\t\t</script>";
}
