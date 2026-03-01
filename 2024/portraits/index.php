<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

	<!-- GALLERY -->
	<link rel="stylesheet" href="style.css">
	
	<div class="portraits-gallery">
		<?php
			// List of sold images (add filenames here as they are sold)
			$sold_images = array(
				'IMG_4793.jpeg',
				// 'IMG_4774.jpeg',
				// 'IMG_4775.jpeg',
			);
			
			// Artwork metadata (title, year, medium, size)
			// Add or modify entries for each artwork
			$artwork_info = array(
				'IMG_4826.jpeg' => array(
					'title' => 'Untitled',
					'year' => '2025',
					'medium' => 'Oil over cardboard',
					'size' => '16 x 12 inches'
				),
			);
			
			// Default values for artworks without metadata
			$default_info = array(
				'title' => 'Untitled',
				'year' => '2024',
				'medium' => 'Oil over cardboard',
				'size' => '16 x 12 inches'
			);
			
			// Get all JPEG images in the directory
			$images = glob('IMG_*.jpeg');
			sort($images);
			
			foreach($images as $image) {
				$is_sold = in_array($image, $sold_images);
				$sold_class = $is_sold ? ' sold' : '';
				$sold_attr = $is_sold ? ' data-sold="true"' : '';
				
				// Get artwork info or use defaults
				$info = isset($artwork_info[$image]) ? $artwork_info[$image] : $default_info;
				
				// Encode metadata for data attributes
				$info_json = htmlspecialchars(json_encode($info), ENT_QUOTES, 'UTF-8');
				
				echo '<div class="portrait-item' . $sold_class . '"' . $sold_attr . ' data-info=\'' . $info_json . '\'>';
				echo '<img src="thumbnails/' . $image . '" alt="' . htmlspecialchars($info['title']) . '" data-full="' . $image . '" class="portrait-thumb">';
				if ($is_sold) {
					echo '<div class="sold-marker"></div>';
				}
				echo '<div class="artwork-info">';
				echo '<div class="artwork-title">' . htmlspecialchars($info['title']) . '</div>';
				echo '<div class="artwork-details">';
				echo htmlspecialchars($info['year']) . ' | ' . htmlspecialchars($info['medium']);
				echo '</div>';
				echo '<div class="artwork-size">' . htmlspecialchars($info['size']) . '</div>';
				echo '</div>';
				echo '</div>';
			}
		?>
	</div>
	
	<!-- Fullscreen Modal -->
	<div id="fullscreen-modal" class="fullscreen-modal">
		<span class="close-modal">&times;</span>
		<button class="nav-arrow nav-arrow-left" aria-label="Previous image">&#8249;</button>
		<button class="nav-arrow nav-arrow-right" aria-label="Next image">&#8250;</button>
		<img class="fullscreen-image" src="" alt="Portrait">
		<div class="sold-marker-fullscreen"></div>
		<div class="fullscreen-info">
			<div class="fullscreen-title"></div>
			<div class="fullscreen-details"></div>
			<div class="fullscreen-size"></div>
		</div>
	</div>
	
	<script src="main.js"></script>
	
<?php include("../../footer.php"); ?>
