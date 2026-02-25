<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

	<div id="longer-info">

		<?php
			include("../../parsedown/Parsedown.php");
			define('GITHUB_REPO', 'Skylines'.$_GET['v']);
			$Parsedown = new Parsedown();
			define('GITHUB_REPO_URL','github.com/patriciogonzalezvivo/'.GITHUB_REPO);
			echo $Parsedown->text(file_get_contents('https://raw.'.GITHUB_REPO_URL.'/master/README.md'));

			echo '<p><a href="http://'.GITHUB_REPO_URL.'">Check the Git Repository</a></p>'
		?>

	</div>

<?php include("../../footer.php"); ?>
