<?php include("../../server/header.php");?>
<?php include("../../server/menu.php");?>


	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../server/ParsedownExtended.php");
			$Parsedown = new ParsedownExtended();
			define('GITHUB_REPO', 'Mesh2OSMSlicer');
			define('GITHUB_REPO_URL','github.com/tangrams/'.GITHUB_REPO);
			$Parsedown = new ParsedownExtended();
			echo $Parsedown->text(file_get_contents('https://raw.'.GITHUB_REPO_URL.'/master/README.md'));
			echo '<p><a href="http://'.GITHUB_REPO_URL.'">Check the Git Repository</a></p>'
		?>

	</section>

<?php include("../../server/footer.php"); ?>
