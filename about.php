<?php include("header.php"); ?>
<?php include("menu.php"); ?>

	<div id="longer-info">

	<?php
			include("parsedown/Parsedown.php");
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents ('README.md'));
			echo $Parsedown->text(file_get_contents ('talks.md'));
			echo $Parsedown->text(file_get_contents ('exhibitions.md'));
			echo $Parsedown->text(file_get_contents ('press.md'));
			?>
	</div>

<?php include("footer.php"); ?>
