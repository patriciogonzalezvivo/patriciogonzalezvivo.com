<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../parsedown/Parsedown.php");

			define('GITHUB_USER', 'patriciogonzalezvivo');
			define('GITHUB_REPO', 'vPlotter');
			define('GITHUB_BRANCH', 'master');

			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents( 'https://raw.github.com/'.GITHUB_USER.'/'.GITHUB_REPO.'/'.GITHUB_BRANCH.'/README.md'));
		?>

	</section>

<?php include("../../footer.php"); ?>
