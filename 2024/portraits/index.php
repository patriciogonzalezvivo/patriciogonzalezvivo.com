<?php
	$page_title = "Portraits - Patricio Gonzalez Vivo";
	$page_description = "Oil portrait studies by Patricio Gonzalez Vivo, 2024-2025";
	include("../../header.php");
	include("../../gallery_helper.php");
?>
<?php include("../../menu.php");?>


	<!-- GALLERY -->
	<link rel="stylesheet" href="style.css">
	
	<?php
		// Render the gallery using the helper function
		echo render_gallery([
			'images_dir' => 'images',
			'pattern' => 'IMG_*.jpeg',
			'defaults' => [
				'title' => 'Untitled',
				'year' => '2024',
				'medium' => 'Oil over cardboard',
				'dimensions' => '16 x 12 inches',
				'sold' => false,
			],
		]);
	?>
	
<?php include("../../footer.php"); ?>
