<?php
include("project_meta.php");
include_once("slideSet.php");

// Each project entry supports:
//   'path'         - local folder path (loads metadata from TITLE.txt etc.)
//   'type'         - 'wasm' | 'gallery' | 'thumbnail' (default: thumbnail)
//   'url'          - override link URL
//   'images_dir'   - (gallery) directory of images relative to web root
//   'pattern'      - (gallery) glob pattern for images
//   'iframe_width' - (wasm) iframe width in px, default 516
//   'iframe_height'- (wasm) iframe height in px, default 810
$projects = [
    [
        'path'         => '2026/santos',
        'type'         => 'gallery',
        'images_dir'   => '2026/santos/images/thumbnails',
        'pattern'      => 'DSF*.{jpg,jpeg,png,gif}',
    ],
    [
        'path'         => '2026/astros',
        'type'         => 'wasm',
        'iframe_width' => 516,
        'iframe_height'=> 810,
    ],
    [
        'path'         => '2025/hybrids',
        'type'         => 'gallery',
        'images_dir'   => '2025/hybrids/images',
        'pattern'      => '_DSF*.{jpg,jpeg,png,gif}',
    ],
    [
        'path'         => '2026/weaver2',
        'type'         => 'wasm',
        'iframe_width' => 516,
        'iframe_height'=> 810,
    ],
];

// Pick a random featured project's default thumbnail for og:image
$random_project = $projects[array_rand($projects)];
$random_meta = get_project_meta($random_project['path']);
$_static_exts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$_thumb = $random_meta['thumb'] ?? null;
if ($_thumb && in_array(strtolower(pathinfo($_thumb, PATHINFO_EXTENSION)), $_static_exts)) {
    $og_image = $random_project['path'] . '/' . $_thumb;
} elseif (file_exists($random_project['path'] . '/thumbnail.jpg')) {
    $og_image = $random_project['path'] . '/thumbnail.jpg';
}

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
                    $iw = $project['iframe_width']  ?? 516;
                    $ih = $project['iframe_height'] ?? 810;
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

                <?php else: /* thumbnail fallback */ ?>
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
        <a href="works.php" class="archive-btn">Continue looking the Archive</a>
    </div>

<?php include("footer.php"); ?>
