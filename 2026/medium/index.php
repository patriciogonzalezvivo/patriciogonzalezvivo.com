<?php
	 include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
	include("../../server/header.php");
	include("../../server/gallery.php");
?>
<?php include("../../server/menu.php");?>
    <article class="item">
        <div class="item-image">
            <iframe src="splat_strokes_paint_b9e4b33399ba7602a648f0dbc8f1abc1.html" width="512" height="717" loading="lazy"></iframe>
        </div>
        <div class="item-info">
            <span class="item-title"><?php echo htmlspecialchars($meta['title'] ?? ''); ?></span>
            <span class="item-year"><?php echo htmlspecialchars($meta['year'] ?? ''); ?></span>
            <span class="item-medium"><?php echo htmlspecialchars($meta['medium'] ?? ''); ?></span>
            <span class="item-dimensions"><?php echo htmlspecialchars($meta['dimensions'] ?? ''); ?></span>
            <p class="item-description"><?php echo htmlspecialchars($meta['description'] ?? ''); ?></p>
        </div>
    </article>

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
