<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../parsedown/Parsedown.php");

			define('GITHUB_REPO', 'ofxVectorTile');
			define('GITHUB_REPO_URL','github.com/tangrams/'.GITHUB_REPO);
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents('https://raw.'.GITHUB_REPO_URL.'/master/README.md'));
			echo '<p><a href="http://'.GITHUB_REPO_URL.'">Check the Git Repository</a></p>'
		?>

		<iframe src="//player.vimeo.com/video/107162646" width="575" height="323" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

		<iframe src="//player.vimeo.com/video/107190391" width="575" height="323" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

	</section>

<?php include("../../footer.php"); ?>
