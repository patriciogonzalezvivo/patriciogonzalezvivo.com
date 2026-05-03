<?php
include("project_meta.php");
include_once("slideSet.php");

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
    [
        'path'         => '2026/astros',
        'type'         => 'big_thumbnail',
        'width' => 320,
        'height'=> 540,
        // 'type'         => 'wasm',
        // 'width' => 516,
        // 'height'=> 810,
    ],
    [
        'path'         => '2026/santos',
        'type'         => 'gallery',
        'images_dir'   => '2026/santos/images/thumbnails',
        'pattern'      => 'DSF*.{jpg,jpeg,png,gif}',
    ],
    
    [
        'path'         => '2026/weaver2',
        'type'         => 'big_thumbnail',
        'width' => 320,
        'height'=> 540,
        // 'type'         => 'wasm',
        // 'width' => 516,
        // 'height'=> 810,
    ],
    // [
    //     'path'         => '2025/hybrids',
    //     'type'         => 'gallery',
    //     'images_dir'   => '2025/hybrids/images',
    //     'pattern'      => '_DSF*.{jpg,jpeg,png,gif}',
    // ],

];

set_random_og_image($projects);

include("header.php");
include("menu.php");
?>

    <div style="display: flex; flex-wrap: wrap; gap: 2em; justify-content: center; align-items: flex-start; padding: 2em 0;">

    <?php foreach ($projects as $project):
        $meta  = get_project_meta($project['path']);
        $type  = $project['type'] ?? 'thumbnail';
        $link  = isset($project['url']) ? $project['url'] : $project['path'] . '/';
        $slug  = str_replace('/', '-', $project['path']);
    ?>
        <article class="item is-active">
            <div class="item-image" style="filter: drop-shadow(10px 10px 10px #777);">

                <?php if ($type === 'wasm'):
                    $iw = $project['width']  ?? 516;
                    $ih = $project['height'] ?? 810;
                ?>
                    <iframe
                        src="<?php echo htmlspecialchars($link); ?>?embed=1"
                        width="<?php echo $iw; ?>"
                        height="<?php echo $ih; ?>"
                        style="border: none; display: block;"
                        title="<?php echo htmlspecialchars($meta['title']); ?>"
                    ></iframe>

                <?php elseif ($type === 'gallery'): ?>
                    <a href="<?php echo htmlspecialchars($link); ?>">
                    <?php echo render_slideset([
                        'id'        => 'slideSet-' . $slug,
                        'class'     => 'slideSet photo',
                        'images_dir'=> $project['images_dir'],
                        'pattern'   => $project['pattern'] ?? '*.{jpg,jpeg,png,gif}',
                        'div_style' => 'width: 400px;',
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
                        $bt_src = null;
                        $bt_base = rtrim($project['path'], '/');
                        foreach (['thumbnail.jpg', 'thumbnail.jpeg', 'thumbnail.png'] as $_tf) {
                            if (file_exists($bt_base . '/' . $_tf)) {
                                $bt_src = $bt_base . '/' . $_tf;
                                break;
                            }
                        }
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
        <a href="works.php" class="archive-btn">More Projects</a>
    </div>

<?php include("footer.php"); ?>
