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
