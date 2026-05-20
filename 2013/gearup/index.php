<?php include("../../header.php");?>
<?php include("../../menu.php");?>


	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../ParsedownExtended.php");
			$Parsedown = new ParsedownExtended();
			echo $Parsedown->text(file_get_contents ('about.md'));
		?>
		
	</section>

<?php include("../../footer.php"); ?>
