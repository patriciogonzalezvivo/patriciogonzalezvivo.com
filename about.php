<?php include("header.php"); ?>
<?php include("menu.php"); ?>

<!-- CONTENT -->
<section class="content">
	
	<?php
			include("parsedown/Parsedown.php");
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents ('README.md'));
			echo $Parsedown->text(file_get_contents ('talks.md'));
			echo $Parsedown->text(file_get_contents ('exhibitions.md'));
			echo $Parsedown->text(file_get_contents ('press.md'));
			?>

</section>

<?php include("footer.php"); ?>
