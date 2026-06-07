<?php
include("server/project_meta.php");
include_once("server/slideSet.php");

/********************
    Each project entry supports:
      'path'         - local folder path (loads metadata from TITLE.txt etc.)
      'type'         - 'wasm' | 'gallery' | 'thumbnail' | 'big_thumbnail' (default: thumbnail)
      'url'          - override link URL
      'images_dir'   - (gallery) directory of images relative to web root
      'pattern'      - (gallery) glob pattern for images
      'width' - (wasm) iframe width in px, default 516
      'height'- (wasm) iframe height in px, default 810

    thumbnail type:
      Uses thumbnail.* (or thumb.*) found in 'path' folder and links to the project.
    big_thumbnail type:
      Uses thumbnail.jpg (or .jpeg/.png) from 'path' folder as a hyperlink.
      'width'  - (big_thumbnail) image width in px (optional)
      'height' - (big_thumbnail) image height in px (optional)
********************/

$projects = [
    // [
    //     'path'         => '2026/astros',
    //     'type'         => 'big_thumbnail',
    // ],
    [
        'path'         => '2026/santos',
        'type'         => 'gallery',
        'images_dir'   => '2026/santos/images/thumbnails',
        'pattern'      => 'DSF*.{jpg,jpeg,png,gif}',
    ],

    [
        'path'         => '2026/weaver2',
        'type'         => 'wasm',
    ],

    // [
    //     'path'         => '2025/hybrids',
    //     'type'         => 'gallery',
    //     'images_dir'   => '2025/hybrids/images',
    //     'pattern'      => '_DSF*.{jpg,jpeg,png,gif}',
    // ],

    // [
    //     'path'         => '2023/blink',
    //     'type'         => 'wasm',
    // ],

    // [
    //     'path'         => '2021/fen',
    //     'type'         => 'wasm',
    // ],

    // [
    //     'path'         => '2021/memory',
    //     'type'         => 'wasm',
    // ],

    // [
    //     'path'         => '2018/estrellas',
    //     'type'         => 'wasm',
    // ],
    [
        'path'         => '2017/luna',
        'type'         => 'wasm',
    ],

    [
        'path'         => '2017/pixelspirit',
        'type'         => 'big_thumbnail',
    ],

    [
        'path'         => '2017/guayupia',
        'type'         => 'big_thumbnail',
    ],

    [
        'path'         => '2014/skylines',
        'type'         => 'big_thumbnail',
    ],

    [
        'path'         => '2011/efectomariposa',
        'type'         => 'big_thumbnail',
    ],
];

set_random_og_image($projects);

include("server/header.php");
include("server/menu.php");
?>

    <div class="featured-rail">

    <?php foreach ($projects as $project):
        $meta  = get_project_meta($project['path']);
        $type  = $project['type'] ?? 'thumbnail';
        $link  = isset($project['url']) ? $project['url'] : $project['path'] . '/';
        $slug  = str_replace('/', '-', $project['path']);
    ?>
        <article class="item is-active">
            <div class="item-image">

                <?php if ($type === 'wasm'):
                    $iw = $project['width']  ?? 516;
                    $ih = $project['height'] ?? 810;
                    $_wasm_poster = find_thumbnail($project['path'], ['thumbnail', 'thumb'], THUMBNAIL_EXTS_STATIC);
                    $_wasm_poster_src = $_wasm_poster ? $project['path'] . '/' . $_wasm_poster : null;
                ?>
                    <div class="wasm-wrapper">
                        <iframe
                            data-src="<?php echo htmlspecialchars($link); ?>?embed=1"
                            width="<?php echo $iw; ?>"
                            height="<?php echo $ih; ?>"
                            style="border: none; display: block;"
                            title="<?php echo htmlspecialchars($meta['title']); ?>"
                        ></iframe>
                        <?php if ($_wasm_poster_src): ?>
                        <img class="wasm-poster"
                             src="<?php echo htmlspecialchars($_wasm_poster_src); ?>"
                             alt="<?php echo htmlspecialchars($meta['title']); ?>"
                             loading="lazy" />
                        <?php endif; ?>
                    </div>

                <?php elseif ($type === 'gallery'): ?>
                    <a href="<?php echo htmlspecialchars($link); ?>">
                    <?php echo render_slideset([
                        'id'        => 'slideSet-' . $slug,
                        'class'     => 'slideSet photo',
                        'images_dir'=> $project['images_dir'],
                        'pattern'   => $project['pattern'] ?? '*.{jpg,jpeg,png,gif}',
                    ]); ?>
                    </a>

                <?php elseif ($type === 'thumbnail'): /* explicit thumbnail type */ ?>
                    <a href="<?php echo htmlspecialchars($link); ?>">
                    <?php if ($meta['thumb']): ?>
                        <?php if (str_ends_with($meta['thumb'], '.webm')): ?>
                            <video class="photoTh" autoplay loop muted playsinline loading="lazy">
                                <source src="<?php echo htmlspecialchars($meta['path'] . '/' . $meta['thumb']); ?>" type="video/webm">
                            </video>
                        <?php else: ?>
                            <img class="photoTh" loading="lazy"
                                src="<?php echo htmlspecialchars($meta['path'] . '/' . $meta['thumb']); ?>"
                                alt="<?php echo htmlspecialchars($meta['title']); ?>"/>
                        <?php endif; ?>
                    <?php endif; ?>
                    </a>

                <?php elseif ($type === 'big_thumbnail'): ?>
                    <?php
                        $bt_base = rtrim($project['path'], '/');
                        $_bt_name = find_thumbnail($bt_base, ['thumbnail'], THUMBNAIL_EXTS_STATIC);
                        $bt_src = $_bt_name ? $bt_base . '/' . $_bt_name : null;
                        $bt_w = $project['width']  ?? null;
                        $bt_h = $project['height'] ?? null;
                        $bt_style = '';
                        if ($bt_w) $bt_style .= 'width:' . (int)$bt_w . 'px;';
                        if ($bt_h) $bt_style .= 'height:' . (int)$bt_h . 'px;';
                        if ($bt_style) $bt_style .= 'object-fit:cover;';
                    ?>
                    <?php if ($bt_src): ?>
                    <a href="<?php echo htmlspecialchars($link); ?>">
                        <img class="photoTh" loading="lazy"
                            src="<?php echo htmlspecialchars($bt_src); ?>"
                            alt="<?php echo htmlspecialchars($meta['title']); ?>"
                            <?php if ($bt_style): ?>style="<?php echo $bt_style; ?>"<?php endif; ?>/>
                    </a>
                    <?php endif; ?>

                <?php else: /* unknown type – no visual output */ ?>

                <?php endif; ?>

            </div>
            <div class="item-info">
                <a href="<?php echo htmlspecialchars($link); ?>">
                    <span class="item-title"><?php echo htmlspecialchars($meta['title']); ?></span>
                </a>
                <span class="item-year"><?php echo htmlspecialchars($meta['year']); ?></span>
                <?php if ($meta['medium']): ?>
                    <span class="item-medium"><?php echo htmlspecialchars($meta['medium']); ?></span>
                <?php endif; ?>
                <?php if ($meta['dimensions']): ?>
                    <span class="item-dimensions"><?php echo htmlspecialchars($meta['dimensions']); ?></span>
                <?php endif; ?>
            </div>
        </article>

    <?php endforeach; ?>

    </div><!-- end flex row -->

    <div style="text-align: center; margin: 2em 0;">
        <a href="works.php" class="archive-btn">All Projects</a>
    </div>

<script>
(function () {
    var rail = document.querySelector('.featured-rail');
    if (!rail) return;

    var items = Array.from(rail.querySelectorAll(':scope > .item'));
    if (items.length === 0) return;

    var current = 0;
    var locked  = false;

    function goTo(index) {
        index = Math.max(0, Math.min(index, items.length - 1));
        current = index;
        var scrollPad = parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
        var target = rail.scrollLeft
                   + items[index].getBoundingClientRect().left
                   - rail.getBoundingClientRect().left
                   - scrollPad;
        rail.scrollTo({ left: target, behavior: 'smooth' });
        updateUI();
    }

    function updateUI() {
        dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
        prevBtn.disabled = (current === 0);
        nextBtn.disabled = (current === items.length - 1);
    }

    /* wheel: snap one item per tick */
    rail.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
            e.preventDefault();
            if (!locked) {
                locked = true;
                goTo(current + (e.deltaY > 0 ? 1 : -1));
                setTimeout(function () { locked = false; }, 550);
            }
        }
    }, { passive: false });

    /* track current item during touch/trackpad free-scroll;
       guard prevents IntersectionObserver from firing wrong index
       before images have loaded and items have their proper widths */
    var observerReady = false;
    setTimeout(function () { observerReady = true; }, 600);

    var observer = new IntersectionObserver(function (entries) {
        if (!observerReady) return;
        entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                current = items.indexOf(entry.target);
                updateUI();
            }
        });
    }, { root: rail, threshold: 0.5 });
    items.forEach(function (item) { observer.observe(item); });

    /* wrap rail so arrows/dots can be positioned relative to it */
    var wrapper = document.createElement('div');
    wrapper.className = 'rail-wrapper';
    rail.parentNode.insertBefore(wrapper, rail);
    wrapper.appendChild(rail);

    /* arrows */
    function makeArrow(dir) {
        var btn = document.createElement('button');
        btn.className = 'rail-arrow rail-arrow--' + dir;
        btn.innerHTML = dir === 'prev' ? '&#8249;' : '&#8250;';
        btn.setAttribute('aria-label', dir === 'prev' ? 'Previous project' : 'Next project');
        btn.addEventListener('click', function () { goTo(current + (dir === 'prev' ? -1 : 1)); });
        wrapper.appendChild(btn);
        return btn;
    }
    var prevBtn = makeArrow('prev');
    var nextBtn = makeArrow('next');

    /* dots */
    var dotsEl = document.createElement('div');
    dotsEl.className = 'rail-dots';
    wrapper.appendChild(dotsEl);

    var dots = items.map(function (_, i) {
        var d = document.createElement('button');
        d.className = 'rail-dot';
        d.setAttribute('aria-label', 'Go to project ' + (i + 1));
        d.addEventListener('click', function () { goTo(i); });
        dotsEl.appendChild(d);
        return d;
    });

    updateUI();

    /* lazy-load wasm iframes: swap data-src → src on first hover, fade poster on load */
    items.forEach(function (item) {
        item.addEventListener('mouseenter', function () {
            var iframe = item.querySelector('iframe[data-src]');
            if (!iframe) return;
            var poster = item.querySelector('.wasm-poster');
            iframe.src = iframe.getAttribute('data-src');
            iframe.removeAttribute('data-src');
            if (poster) {
                iframe.addEventListener('load', function () {
                    poster.classList.add('is-loaded');
                }, { once: true });
            }
        });
    });
})();
</script>

<?php include("server/footer.php"); ?>
