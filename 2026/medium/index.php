<?php
	 include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
	include("../../server/header.php");
	include("../../server/gallery.php");
?>
<?php include("../../server/menu.php");?>

    <?php
        // Each study is a self-contained sandboxed HTML piece with a matching
        // looping .poster.webm preview (splat_strokes_<shader>_<hash>.html).
        $splat_files = glob('splat_strokes_*.html');
        natsort($splat_files);

        // Count shader variants so repeats can be numbered (Light I, Light II, ...)
        $shader_counts = [];
        foreach ($splat_files as $file) {
            if (preg_match('/^splat_strokes_([a-zA-Z]+)_/', basename($file), $m)) {
                $shader_counts[$m[1]] = ($shader_counts[$m[1]] ?? 0) + 1;
            }
        }
        $shader_seen = [];
        $roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];
    ?>
    <div class="paintings-gallery medium-studies-gallery">
        <?php foreach ($splat_files as $file):
            $base = pathinfo($file, PATHINFO_FILENAME);
            $webm = $base . '.poster.webm';
            $poster = $base . '.poster.jpg';

            $title = 'Study';
            if (preg_match('/^splat_strokes_([a-zA-Z]+)_/', basename($file), $m)) {
                $shader = $m[1];
                $shader_seen[$shader] = ($shader_seen[$shader] ?? 0) + 1;
                $title = ucfirst($shader);
                if ($shader_counts[$shader] > 1) {
                    $title .= ' ' . $roman[$shader_seen[$shader]];
                }
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

	<div id="longer-info">

		<?php
		include("../../server/ParsedownExtended.php");
		$Parsedown = new ParsedownExtended();
		echo $Parsedown->text(file_get_contents ('README.md'));
		?>

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
