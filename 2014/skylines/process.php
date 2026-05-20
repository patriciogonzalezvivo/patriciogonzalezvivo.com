<?php include("../../header.php");?>
<?php include("../../menu.php");?>


	<div id="longer-info">

		<?php
			include("../../ParsedownExtended.php");
			$Parsedown = new ParsedownExtended();
			echo $Parsedown->text(file_get_contents ('02-process.md'));
		?>

	</div>

<?php include("../../footer.php"); ?>
