<?php
	 include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
	include("../../server/header.php");
	include("../../server/gallery.php");
?>
<?php include("../../server/menu.php");?>

    <div class="medium-hero" style="position:relative; max-width:768px; margin:0 auto; padding:0 16px;">
        <iframe id="hero-frame" src="singleview__me_005__splat_strokes_fill/index.html" title="me_005" allowfullscreen
                style="display:block; width:100%; aspect-ratio:3/4; border:0; background:#000; pointer-events:none;"></iframe>
    </div>
    <script>
        // The embedded piece captures wheel/touch events, which traps page scroll.
        // Keep it inert until the user clicks it; release again when the pointer leaves.
        (function () {
            var hero = document.querySelector('.medium-hero');
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

    <?php
        // Each study is a self-contained sandboxed HTML piece with a matching
        // looping .poster.webm preview (splat_strokes_<shader>_<hash>.html).
        $splat_files = glob('splat_strokes_*.html');
        natsort($splat_files);
    ?>
    <div class="paintings-gallery medium-studies-gallery">
        <?php foreach ($splat_files as $file):
            $base = pathinfo($file, PATHINFO_FILENAME);
            $webm = $base . '.poster.webm';
            $poster = $base . '.poster.jpg';

            // splat_strokes_<shader>_<asset>[_reverse_fit] -> "Shader (asset)"
            $title = 'Study';
            if (preg_match('/^splat_strokes_([a-zA-Z0-9]+)_(.+?)(?:_reverse_fit)?$/', $base, $m)) {
                $title = ucfirst($m[1]) . ' (' . $m[2] . ')';
            }
        ?>
        <a class="painting-item" href="<?php echo htmlspecialchars($file); ?>">
            <div class="painting-thumb-wrapper">
                <video class="painting-thumb" autoplay loop muted playsinline preload="metadata" poster="<?php echo htmlspecialchars($poster); ?>">
                    <source src="<?php echo htmlspecialchars($webm); ?>" type="video/webm">
                </video>
            </div>
            <div class="artwork-info">
                <div class="artwork-title"><?php echo htmlspecialchars($title); ?></div>
            </div>
        </a>
        <?php endforeach; ?>
    </div>

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
