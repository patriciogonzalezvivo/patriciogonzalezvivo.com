<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

<?php
echo '
	<script type="text/javascript" src="http://patriciogonzalezvivo.com/glslCanvas/build/GlslCanvas.min.js"></script>
	<link type="text/css" rel="stylesheet" href="https://cdn.rawgit.com/patriciogonzalezvivo/glslGallery/gh-pages/build/glslGallery.css">
    <script type="text/javascript" src="https://cdn.rawgit.com/patriciogonzalezvivo/glslGallery/gh-pages/build/glslGallery.js"></script>';
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