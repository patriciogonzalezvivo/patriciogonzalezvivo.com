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

			// function get_raw_url($path) {
			// 	return 'https://raw.github.com/'.GITHUB_USER.'/'.GITHUB_REPO.'/'.GITHUB_BRANCH.'/'.$path;
			// }
			//
			// function cache_file($url, $path) {
			// 	if (file_exists($path)) {
			// 		unlink($path);
			// 	}
			// 	file_put_contents($path, file_get_contents($url));
			// }
			// cache_file(get_raw_url('README.md'), __DIR__ . '/about.md');

			$Parsedown = new Parsedown();
			// echo $Parsedown->text(file_get_contents( __DIR__. '/about.md' ));
			echo $Parsedown->text(file_get_contents( 'https://raw.github.com/'.GITHUB_USER.'/'.GITHUB_REPO.'/'.GITHUB_BRANCH.'/README.md'));
		?>

	</section>

<?php include("../../footer.php"); ?>
