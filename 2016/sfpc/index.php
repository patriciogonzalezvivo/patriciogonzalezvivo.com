<?php include("../../server/header.php");?>
<?php include("../../server/menu.php");?>


	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../server/ParsedownExtended.php");
			$Parsedown = new ParsedownExtended();
			echo $Parsedown->text(file_get_contents('https://patriciogonzalezvivo.github.io/sfpc_ll16/README.md'));
			echo '<p><a href="http://'.GITHUB_REPO_URL.'">Check the Git Repository</a></p>'
		?>

	</section>

<?php include("../../server/footer.php"); ?>
