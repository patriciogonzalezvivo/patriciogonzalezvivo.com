<?php include("../../header.php");?>
<?php include("../../menu.php");?>


	<div id="longer-info">

		<?php
			include("../../ParsedownExtended.php");
			$Parsedown = new ParsedownExtended();
			echo $Parsedown->text(file_get_contents ('01-intro.md'));
		?>

</div>

<?php include("../../footer.php"); ?>
