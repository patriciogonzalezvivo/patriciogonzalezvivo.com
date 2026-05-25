<?php include("../../server/header.php");?>
<?php include("../../server/menu.php");?>


	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../server/ParsedownExtended.php");
			$Parsedown = new ParsedownExtended();
			echo $Parsedown->text(file_get_contents ('README.md'));
		?>

	</section>

<?php include("../../server/footer.php"); ?>
