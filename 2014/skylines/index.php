<?php
    include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../server/header.php");?>
    <?php include("../../server/menu.php");?>

	<div id="longer-info">

		<?php
			include("../../server/ParsedownExtended.php");
			$Parsedown = new ParsedownExtended();
			echo $Parsedown->text(file_get_contents ('README.md'));
		?>

</div>

<?php include("../../server/footer.php"); ?>
