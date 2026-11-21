<?php
	// ProfilePage: the structured data names him, his bio and his work (see server/seo.php)
	$seo_kind = 'profile';
	$page_title = 'About Patricio Gonzalez Vivo';
	$page_description = 'Patricio González Vivo (b. 1982, Buenos Aires) is a new media artist bridging oil paint and code. MFA Parsons. Author of The Book of Shaders.';
	include("server/header.php");
?>
<?php include("server/menu.php"); ?>

	<!-- <img src="/images/about.jpg" alt="Patricio Gonzalez Vivo"> -->

	<div id="longer-info">
		<!-- <img src="/images/about_thin.jpg" alt="Patricio Gonzalez Vivo" style="float: right; max-width: 300px; width: 40%; margin: 0 0 1em 1.5em;"> -->
		<?php
			include("server/ParsedownExtended.php");
			$Parsedown = new ParsedownExtended();
			echo $Parsedown->text(file_get_contents ('README.md'));

			// Add
			echo $Parsedown->text("[Contact](mailto:patriciogonzalezvivo@gmail.com)");
			echo $Parsedown->text(file_get_contents ('exhibitions.md'));
			// echo $Parsedown->text(file_get_contents ('talks.md'));
			// echo $Parsedown->text(file_get_contents ('press.md'));
			?>
	</div>

<?php include("server/footer.php"); ?>
