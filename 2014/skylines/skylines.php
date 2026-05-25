<?php include("../../server/header.php");?>
<?php include("../../server/menu.php");?>


	<div id="longer-info">

		<?php
			include("../../server/ParsedownExtended.php");

			$Parsedown = new ParsedownExtended();
			if (isset($_GET['v']) && $_GET['v'] === '01') {
				$readme_path = '01/README.md';
				echo $Parsedown->text(file_get_contents($readme_path));
			} else {
				define('GITHUB_REPO', 'Skylines'.$_GET['v']);
				define('GITHUB_REPO_URL','github.com/patriciogonzalezvivo/'.GITHUB_REPO);
				echo $Parsedown->text(file_get_contents('https://raw.'.GITHUB_REPO_URL.'/master/README.md'));
				echo '<p><a href="http://'.GITHUB_REPO_URL.'">Check the Git Repository</a></p>';
			}
		?>

	</div>

<?php include("../../server/footer.php"); ?>
