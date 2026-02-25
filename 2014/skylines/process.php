<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

	<div id="longer-info">

		<?php
			include("../../parsedown/Parsedown.php");
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents ('02-process.md'));
		?>

	</div>

<?php include("../../footer.php"); ?>
