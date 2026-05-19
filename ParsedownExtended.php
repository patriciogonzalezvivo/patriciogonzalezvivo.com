<?php
/**
 * ParsedownExtended
 *
 * Extends Parsedown with support for :::wrapfig fenced blocks — floating
 * images with an optional caption and hyperlink, placed left or right of
 * the surrounding text (like CSS floats / LaTeX wrapfigure).
 *
 * Usage in Markdown source:
 *
 *   :::wrapfig right
 *   src: 2026/santos/images/detail.jpg
 *   title: Santos
 *   year: 2025–2026
 *   medium: Oil on canvas
 *   caption: Installation detail.
 *   link: /2026/santos/
 *   width: 40%
 *   :::
 *
 * Keys
 * ----
 *   src      – image path (required; relative to the web root or absolute).
 *   title    – artwork title, styled with .item-title (optional).
 *   year     – artwork year, styled with .item-year (optional).
 *   medium   – artwork medium, styled with .item-medium (optional).
 *   caption  – plain-text caption shown below artwork info (optional).
 *   link     – URL to wrap the image in an <a> tag (optional).
 *   width    – CSS width of the float (default: 40%).
 *              Accepts CSS values ("40%", "320px") or a LaTeX-style
 *              fraction ("0.40") which is auto-converted to a percentage.
 *
 * HTML output
 * -----------
 *   <figure class="wrapfig wrapfig--right" style="width:40%">
 *     <a href="/2026/santos/"><img src="..." alt="Santos"></a>
 *     <figcaption>
 *       <div class="item-info">
 *         <span class="item-title">Santos</span>
 *         <span class="item-year">2025–2026</span>
 *         <span class="item-medium">Oil on canvas</span>
 *       </div>
 *       <span class="wrapfig-caption">Installation detail.</span>
 *     </figcaption>
 *   </figure>
 *
 * Include this file instead of (or in addition to) parsedown/Parsedown.php,
 * then use:
 *
 *   $pd = new ParsedownExtended();
 *   echo $pd->text($markdown);
 *
 * @requires parsedown/Parsedown.php
 */

require_once __DIR__ . '/parsedown/Parsedown.php';

class ParsedownExtended extends Parsedown
{
    public function __construct()
    {
        // Register ':' as a block-level trigger so :::wrapfig lines are
        // detected.  Parsedown already uses ':' for tables, so WrapFig is
        // appended and tried after Table (which will return null for :::).
        $this->BlockTypes[':'][] = 'WrapFig';
    }

    // ------------------------------------------------------------------ //
    //  Block detection                                                     //
    // ------------------------------------------------------------------ //

    protected function blockWrapFig($Line)
    {
        if (!preg_match('/^:::wrapfig\s+(right|left|r|l)\s*$/i', $Line['text'], $matches)) {
            return;
        }

        return [
            'char'   => ':',
            'side'   => strtolower($matches[1][0]),  // 'r' or 'l'
            'params' => [],
            'markup' => '',  // filled in blockWrapFigComplete
        ];
    }

    // ------------------------------------------------------------------ //
    //  Line accumulator                                                    //
    // ------------------------------------------------------------------ //

    protected function blockWrapFigContinue($Line, $Block)
    {
        // Signal Parsedown to close the block on the next non-empty line
        // after the closing :::.
        if (isset($Block['complete'])) {
            return;
        }

        // Closing fence.
        if (preg_match('/^:::\s*$/', $Line['text'])) {
            $Block['complete'] = true;
            return $Block;
        }

        // key: value pairs.
        if (preg_match('/^(\w+)\s*:\s*(.+)$/', $Line['text'], $matches)) {
            $Block['params'][strtolower($matches[1])] = trim($matches[2]);
        }

        return $Block;
    }

    // ------------------------------------------------------------------ //
    //  HTML builder                                                        //
    // ------------------------------------------------------------------ //

    protected function blockWrapFigComplete($Block)
    {
        $params  = $Block['params'];
        $side    = isset($Block['side']) ? $Block['side'] : 'r';

        $src     = isset($params['src'])     ? trim($params['src'])     : '';
        $caption = isset($params['caption']) ? trim($params['caption']) : '';
        $title   = isset($params['title'])   ? trim($params['title'])   : '';
        $year    = isset($params['year'])    ? trim($params['year'])    : '';
        $medium  = isset($params['medium'])  ? trim($params['medium'])  : '';
        $link    = isset($params['link'])    ? trim($params['link'])    : '';
        $width   = isset($params['width'])   ? trim($params['width'])   : '40%';

        if ($src === '') {
            $Block['markup'] = '';
            return $Block;
        }

        // Normalise width: a bare decimal like "0.40" becomes "40%".
        if (is_numeric($width)) {
            $width = ((int) round((float) $width * 100)) . '%';
        }

        $side_class = ($side === 'r') ? 'right' : 'left';
        $esc        = 'htmlspecialchars';  // shorthand

        $img  = '<img src="'  . $esc($src, ENT_QUOTES, 'UTF-8') . '"';
        $img .= ' alt="'      . $esc($title ?: $caption, ENT_QUOTES, 'UTF-8') . '">';
        $inner = $link
            ? '<a href="' . $esc($link, ENT_QUOTES, 'UTF-8') . '">' . $img . '</a>'
            : $img;

        $html  = '<figure class="wrapfig wrapfig--' . $side_class . '"';
        $html .= ' style="width:' . $esc($width, ENT_QUOTES, 'UTF-8') . '">';
        $html .= "\n  " . $inner;

        $has_artwork_meta = ($title !== '' || $year !== '' || $medium !== '');
        if ($has_artwork_meta || $caption !== '') {
            $html .= "\n  <figcaption>";
            if ($has_artwork_meta) {
                $html .= '<div class="item-info">';
                if ($title !== '') {
                    $html .= '<span class="item-title">' . $esc($title, ENT_QUOTES, 'UTF-8') . '</span>';
                }
                if ($year !== '') {
                    $html .= '<span class="item-year">' . $esc($year, ENT_QUOTES, 'UTF-8') . '</span>';
                }
                if ($medium !== '') {
                    $html .= '<span class="item-medium">' . $esc($medium, ENT_QUOTES, 'UTF-8') . '</span>';
                }
                $html .= '</div>';
            }
            if ($caption !== '') {
                $html .= '<span class="wrapfig-caption">' . $esc($caption, ENT_QUOTES, 'UTF-8') . '</span>';
            }
            $html .= '</figcaption>';
        }
        $html .= "\n</figure>";

        $Block['markup'] = $html;
        return $Block;
    }
}
