<?php include("header.php"); ?>
<?php include("menu.php"); ?>
<?php include("sidebar.php"); ?>

	<!-- CONTENT -->
	<section class="content">

		<?php
			include("parsedown/Parsedown.php");
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents ('README.md'));
			echo $Parsedown->text(file_get_contents ('press/README.md'));
			echo $Parsedown->text(file_get_contents ('exhibitions/README.md'));
		?>

	</section>

<?php include("footer.php"); ?>
