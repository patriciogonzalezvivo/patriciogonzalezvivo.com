<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

<?php
echo '
	<script type="text/javascript" src="https://patriciogonzalezvivo.com/glslCanvas/build/GlslCanvas.min.js"></script>
	<link type="text/css" rel="stylesheet" href="https://patriciogonzalezvivo.com/glslGallery/build/glslGallery.css">
    <script type="text/javascript" src="https://patriciogonzalezvivo.com/glslGallery/build/glslGallery.js"></script>';
?>

	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../parsedown/Parsedown.php");
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents ('README.md'));
		?>

	</section>

<?php include("../../footer.php"); ?>