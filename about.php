<?php include("header.php"); ?>
<?php include("menu.php"); ?>

	<!-- <img src="/images/about.jpg" alt="Patricio Gonzalez Vivo"> -->

	<div id="longer-info">
		<!-- <img src="/images/about_thin.jpg" alt="Patricio Gonzalez Vivo" style="float: right; max-width: 300px; width: 40%; margin: 0 0 1em 1.5em;"> -->
		<?php
			include("ParsedownExtended.php");
			$Parsedown = new ParsedownExtended();
			echo $Parsedown->text(file_get_contents ('README.md'));

			// Add
			echo $Parsedown->text("[Contact](mailto:patriciogonzalezvivo@gmail.com)");

			echo $Parsedown->text(file_get_contents ('exhibitions.md'));
			echo $Parsedown->text(file_get_contents ('talks.md'));
			echo $Parsedown->text(file_get_contents ('press.md'));
			?>
	</div>

<?php include("footer.php"); ?>
