<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../parsedown/Parsedown.php");
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents('https://gist.githubusercontent.com/patriciogonzalezvivo/77da993b14a48753efda/raw/f3034e9b8f32b06b5d2f6f124fc25ee6f22179b3/PythonSetup.md'));
		?>

	</section>

<?php include("../../footer.php"); ?>
