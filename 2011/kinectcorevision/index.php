<?php include("../../header.php");?>
<?php include("../../menu.php");?>


	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../parsedown/Parsedown.php");
			define('GITHUB_REPO', 'KinectCoreVision');
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents( 'https://raw.github.com/patriciogonzalezvivo/'.GITHUB_REPO.'/master/README.md'));
		?>

	</section>

<?php include("../../footer.php"); ?>
