<?php include("../../header.php");?>
<?php include("../../menu.php");?>


	<div id="longer-info">

		<?php
			include("../../parsedown/Parsedown.php");
			define('GITHUB_REPO', 'flatLand');
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents( 'https://raw.github.com/patriciogonzalezvivo/'.GITHUB_REPO.'/master/README.md'));
		?>
	</div>

<?php include("../../footer.php"); ?>
