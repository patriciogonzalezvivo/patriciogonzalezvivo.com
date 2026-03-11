<?php include("header.php"); ?>
<?php include("menu.php"); ?>

	<img src="/images/about.jpg" alt="Patricio Gonzalez Vivo">

	<div id="longer-info">
		<?php
			include("parsedown/Parsedown.php");
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents ('README.md'));

			// Add
			echo $Parsedown->text("[Collect](https://objkt.com/users/tz1NqueFctvNCQrsELm6k4N6XfwAYu5Qp5LN) | [Contact](mailto:patriciogonzalezvivo@gmail.com)");

			echo $Parsedown->text(file_get_contents ('talks.md'));
			echo $Parsedown->text(file_get_contents ('exhibitions.md'));
			echo $Parsedown->text(file_get_contents ('press.md'));
			?>
	</div>

<?php include("footer.php"); ?>
