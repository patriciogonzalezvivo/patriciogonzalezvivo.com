<?php
	include("../../project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
	include("../../header.php");
	include("../../gallery_helper.php");
?>
<?php include("../../menu.php");?>


	<!-- GALLERY -->
	<!-- <link rel="stylesheet" href="style.css"> -->
	
	<?php
		// Render the gallery using the helper function
		echo render_gallery([
			'images_dir' => 'images',
			'pattern' => 'IMG_*.jpeg',
			'defaults' => [
				'title' => 'Untitled',
				'year' => '2025',
				'medium' => 'Oil and Acrylic on canvas',
				'dimensions' => '16 x 12 inches',
				'sold' => false,
			],
		]);
	?>

	<div id="longer-info">
		<?php
		include("../../parsedown/Parsedown.php");
		$Parsedown = new Parsedown();
		echo $Parsedown->text(file_get_contents ('README.md'));
		?>
	</div>
<?php include("../../footer.php"); ?>
