<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../parsedown/Parsedown.php");
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents('https://gist.githubusercontent.com/patriciogonzalezvivo/229c5cd4001c2ed45ec6/raw/0935b042c718ed460b545f251d69331da79c7c38/postgisOSM-LAS.md'));
		?>

	</section>

<?php include("../../footer.php"); ?>
