<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

	<!-- GALLERY -->
	<link rel="stylesheet" href="style.css">
	
	<div class="portraits-gallery">
		<?php
			// List of sold images (add filenames here as they are sold)
			$sold_images = array(
				'IMG_7185.jpeg',
				'IMG_7375.jpeg',
				'IMG_7444.jpeg',
			);
			
			// Artwork metadata (title, year, medium, size)
			// Add or modify entries for each artwork
			$artwork_info = array(
			);
			
			// Default values for artworks without metadata
			$default_info = array(
				'title' => 'Untitled',
				'year' => '2024',
				'medium' => 'Oil over canvas',
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
	
	<script>
		// Fullscreen functionality
		const modal = document.getElementById('fullscreen-modal');
		const modalImg = modal.querySelector('.fullscreen-image');
		const soldMarker = modal.querySelector('.sold-marker-fullscreen');
		const closeBtn = modal.querySelector('.close-modal');
		const navLeft = modal.querySelector('.nav-arrow-left');
		const navRight = modal.querySelector('.nav-arrow-right');
		const portraitItems = document.querySelectorAll('.portrait-item');
		const thumbs = document.querySelectorAll('.portrait-thumb');
		
		let currentIndex = 0;
		
		// Function to display an image in fullscreen
		function showImage(index) {
			const portraitItem = portraitItems[index];
			const thumb = portraitItem.querySelector('.portrait-thumb');
			const fullSrc = thumb.getAttribute('data-full');
			const isSold = portraitItem.hasAttribute('data-sold');
			const infoData = portraitItem.getAttribute('data-info');
			
			modalImg.src = fullSrc;
			modal.style.display = 'flex';
			currentIndex = index;
			
			if (isSold) {
				soldMarker.style.display = 'block';
			} else {
				soldMarker.style.display = 'none';
			}
			
			// Display artwork info in fullscreen
			if (infoData) {
				const info = JSON.parse(infoData);
				modal.querySelector('.fullscreen-title').textContent = info.title;
				modal.querySelector('.fullscreen-details').textContent = info.year + ' | ' + info.medium;
				modal.querySelector('.fullscreen-size').textContent = info.size;
			}
		}
		
		// Navigate to next image (with looping)
		function nextImage() {
			currentIndex = (currentIndex + 1) % portraitItems.length;
			showImage(currentIndex);
		}
		
		// Navigate to previous image (with looping)
		function prevImage() {
			currentIndex = (currentIndex - 1 + portraitItems.length) % portraitItems.length;
			showImage(currentIndex);
		}
		
		// Click on thumbnail to open fullscreen
		thumbs.forEach((thumb, index) => {
			thumb.addEventListener('click', function() {
				showImage(index);
			});
		});
		
		// Close button
		closeBtn.addEventListener('click', () => {
			modal.style.display = 'none';
		});
		
		// Navigation arrows
		navLeft.addEventListener('click', (e) => {
			e.stopPropagation();
			prevImage();
		});
		
		navRight.addEventListener('click', (e) => {
			e.stopPropagation();
			nextImage();
		});
		
		// Click outside image to close
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.style.display = 'none';
			}
		});
		
		// Keyboard navigation
		document.addEventListener('keydown', (e) => {
			if (modal.style.display === 'flex') {
				switch(e.key) {
					case 'Escape':
						modal.style.display = 'none';
						break;
					case 'ArrowRight':
					case 'Right': // For older browsers
						nextImage();
						break;
					case 'ArrowLeft':
					case 'Left': // For older browsers
						prevImage();
						break;
				}
			}
		});
	</script>
	
<?php include("../../footer.php"); ?>
