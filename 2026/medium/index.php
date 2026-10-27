<?php
	 include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
	include("../../server/header.php");
	include("../../server/gallery.php");
?>
<?php include("../../server/menu.php");?>

    <article class="item medium-hero">
        <div class="item-image" style="width:min(384px, 100%);">
            <iframe id="hero-frame" src="thumb/index.html" title="me_005" allowfullscreen
                    style="display:block; width:100%; aspect-ratio:3/4; border:0; background:#fff; pointer-events:none;"></iframe>
        </div>
        <div class="item-info">
            <span class="item-title"><?php echo htmlspecialchars($meta['title'] ?? ''); ?></span>
            <span class="item-year"><?php echo htmlspecialchars($meta['year'] ?? ''); ?></span>
            <span class="item-medium"><?php echo htmlspecialchars($meta['medium'] ?? ''); ?></span>
            <?php if (!empty($meta['dimensions'])): ?>
                <span class="item-dimensions"><?php echo htmlspecialchars($meta['dimensions']); ?></span>
            <?php endif; ?>
            <!-- <p class="item-description"><?php echo htmlspecialchars($meta['description'] ?? ''); ?></p> -->
        </div>
    </article>
    <script>
        // The embedded piece captures wheel/touch events, which traps page scroll.
        // Keep it inert until the user clicks it; release again when the pointer leaves.
        (function () {
            var hero = document.querySelector('.medium-hero .item-image');
            var frame = document.getElementById('hero-frame');
            hero.addEventListener('click', function () { frame.style.pointerEvents = 'auto'; });
            hero.addEventListener('mouseleave', function () { frame.style.pointerEvents = 'none'; });
            document.addEventListener('touchstart', function (e) {
                if (!hero.contains(e.target)) frame.style.pointerEvents = 'none';
            }, { passive: true });
        })();
    </script>

	<div id="longer-info">
		<?php
		include("../../server/ParsedownExtended.php");
		$Parsedown = new ParsedownExtended();
		echo $Parsedown->text(file_get_contents ('README.md'));
		?>
    </div>

    <?php
        // Each study is a self-contained sandboxed folder with its own index.html and
        // a looping *.poster.webm preview (singleview__<asset>[_fit]__splat_strokes_<shader>/).
        // Index them by asset so each one sits next to the painting it inspired
        // (paintings/<asset>[_fit].jpg); the "_fit" suffix is ignored when matching.
        $studies = [];
        foreach (glob('singleview__*', GLOB_ONLYDIR) as $dir) {
            if (preg_match('/^singleview__(.+?)(?:_fit)?__splat_strokes_([a-zA-Z0-9_]+)$/', $dir, $m)) {
                $studies[$m[1]] = ['dir' => $dir, 'asset' => $m[1], 'shader' => $m[2]];
            }
        }
        $paintings = get_gallery_artworks('paintings', '*.{jpg,JPG,jpeg,png}', [
            'title' => 'Untitled',
            'year' => '2025',
            'medium' => 'Oil and Acrylic on canvas',
            'dimensions' => '16 x 12 inches',
            'sold' => false,
        ]);
    ?>
    <div class="paintings-gallery medium-pairs-gallery">
        <?php foreach ($paintings as $artwork):
            $key = preg_replace('/_fit$/', '', $artwork['basename']);
            $study = $studies[$key] ?? null;
        ?>
        <div class="medium-pair">
            <?php echo render_gallery_item($artwork); ?>
            <?php if ($study):
                $dir = $study['dir'];
                $webm = glob($dir . '/*.poster.webm');
                $poster = glob($dir . '/*.poster.jpg');
                if (file_exists($dir . '/index.html') && $webm):
                    $poster = $poster ? $poster[0] : '';
            ?>
            <?php
                // The modal shows the still render in images/ that matches this sandbox.
                $still = glob('images/' . $dir . '_t*_2480x3508.jpg');
                // Title / year / medium come from <sandbox>/info.txt (same key: value format as paintings).
                $study_meta = load_artwork_metadata($dir . '/info.txt', [
                    'title' => ucfirst($study['shader']) . ' (' . $study['asset'] . ')',
                    'year' => '2026',
                    'medium' => 'Digital sandbox',
                ]);
                $study_title = $study_meta['title'];
                $info = json_encode(['title' => $study_title, 'year' => $study_meta['year'], 'medium' => $study_meta['medium']]);
            ?>
            <div class="painting-item medium-study" data-id="<?php echo htmlspecialchars($dir); ?>"
                 data-full="<?php echo htmlspecialchars($still ? $still[0] : $poster); ?>"
                 data-info='<?php echo htmlspecialchars($info, ENT_QUOTES, 'UTF-8'); ?>'>
                <div class="painting-thumb-wrapper">
                    <video class="painting-thumb" autoplay loop muted playsinline preload="metadata" poster="<?php echo htmlspecialchars($poster); ?>">
                        <source src="<?php echo htmlspecialchars($webm[0]); ?>" type="video/webm">
                    </video>
                </div>
                <div class="artwork-info">
                    <div class="artwork-title"><?php echo htmlspecialchars($study_title); ?></div>
                    <div class="artwork-details"><?php echo htmlspecialchars($study_meta['year'] . ' | ' . $study_meta['medium']); ?></div>
                    <div class="artwork-buttons">
                        <a class="artwork-btn" href="<?php echo htmlspecialchars($dir . '/index.html'); ?>">Open Sandbox</a>
                    </div>
                </div>
            </div>
            <?php endif; endif; ?>
        </div>
        <?php endforeach; ?>
    </div>
    <?php echo render_gallery_modal(); ?>

    <div id="longer-info">
		<h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2025/hybrids'],
                    ['path' => '2022/time'],
                    ['path' => '2021/memory'],
                    ['path' => '2021/fen'],
                    ['path' => '2014/skylines']
                ];

                echo render_projects_list($projects, '../../');
            ?>
	</div>
	
<?php include("../../server/footer.php"); ?>
