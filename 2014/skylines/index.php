<?php include("../../header.php");?>
<?php include("../../menu.php");?>


	<div id="longer-info">

		<?php
			include("../../parsedown/Parsedown.php");
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents ('01-intro.md'));
		?>

</div>

<?php include("../../footer.php"); ?>
