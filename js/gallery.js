// Fullscreen functionality
const modal = document.getElementById('fullscreen-modal');
const modalImg = modal ? modal.querySelector('.fullscreen-image') : null;
const soldMarker = modal ? modal.querySelector('.sold-marker-fullscreen') : null;
const closeBtn = modal ? modal.querySelector('.close-modal') : null;
const navLeft = modal ? modal.querySelector('.nav-arrow-left') : null;
const navRight = modal ? modal.querySelector('.nav-arrow-right') : null;
const portraitItems = document.querySelectorAll('.portrait-item');

let currentIndex = 0;

// Exit if modal elements don't exist
if (!modal || !modalImg) {
	console.log('Gallery modal not found on this page');
} else {
	
// Current view state ('main', 'detail', or 'installation')
let currentView = 'main';

// Function to display an image in fullscreen
function showImage(index, view = 'main') {
	const portraitItem = portraitItems[index];
	// Get data from the parent .portrait-item div, not the img
	const fullSrc = portraitItem.getAttribute('data-full');
	const detailSrc = portraitItem.getAttribute('data-detail');
	const installationSrc = portraitItem.getAttribute('data-installation');
	const isSold = portraitItem.hasAttribute('data-sold');
	const infoData = portraitItem.getAttribute('data-info');
	
	// Determine which image to show
	let imageSrc = fullSrc;
	if (view === 'detail' && detailSrc) {
		imageSrc = detailSrc;
	} else if (view === 'installation' && installationSrc) {
		imageSrc = installationSrc;
	} else {
		view = 'main'; // Fallback to main if requested view doesn't exist
	}
	
	currentView = view;
	modalImg.src = imageSrc;
	modal.style.display = 'flex';
	currentIndex = index;
	
	if (soldMarker) {
		if (isSold) {
			soldMarker.style.display = 'block';
		} else {
			soldMarker.style.display = 'none';
		}
	}
	
	// Display artwork info in fullscreen
	if (infoData) {
		const info = JSON.parse(infoData);
		const titleEl = modal.querySelector('.fullscreen-title');
		const detailsEl = modal.querySelector('.fullscreen-details');
		const sizeEl = modal.querySelector('.fullscreen-size');
		
		if (titleEl) titleEl.textContent = info.title || 'Untitled';
		if (detailsEl) {
			const details = [];
			if (info.year) details.push(info.year);
			if (info.medium) details.push(info.medium);
			detailsEl.textContent = details.join(' | ');
		}
		if (sizeEl) sizeEl.textContent = info.dimensions || info.size || '';
	}
	
	// Update view buttons visibility and active state
	updateViewButtons(portraitItem);
}

// Update view buttons based on available views
function updateViewButtons(portraitItem) {
	const detailSrc = portraitItem.getAttribute('data-detail');
	const installationSrc = portraitItem.getAttribute('data-installation');
	const navContainer = modal.querySelector('.fullscreen-nav');
	const mainBtn = modal.querySelector('.view-button[data-view="main"]');
	const detailBtn = modal.querySelector('.view-button[data-view="detail"]');
	const installationBtn = modal.querySelector('.view-button[data-view="installation"]');
	
	// Count available views
	const hasDetail = !!detailSrc;
	const hasInstallation = !!installationSrc;
	const viewCount = 1 + (hasDetail ? 1 : 0) + (hasInstallation ? 1 : 0);
	
	if (!navContainer) return;
	
	// Hide entire nav if only one view available
	if (viewCount === 1) {
		navContainer.style.display = 'none';
		return;
	}
	
	// Show nav and configure buttons
	navContainer.style.display = 'flex';
	
	// Main button (always available)
	if (mainBtn) {
		mainBtn.style.display = 'inline-block';
		mainBtn.classList.toggle('active', currentView === 'main');
	}
	
	// Detail button
	if (detailBtn) {
		if (hasDetail) {
			detailBtn.style.display = 'inline-block';
			detailBtn.classList.toggle('active', currentView === 'detail');
		} else {
			detailBtn.style.display = 'none';
		}
	}
	
	// Installation button
	if (installationBtn) {
		if (hasInstallation) {
			installationBtn.style.display = 'inline-block';
			installationBtn.classList.toggle('active', currentView === 'installation');
		} else {
			installationBtn.style.display = 'none';
		}
	}
}

// Navigate to next image (with looping)
function nextImage() {
	currentIndex = (currentIndex + 1) % portraitItems.length;
	showImage(currentIndex, currentView);
}

// Navigate to previous image (with looping)
function prevImage() {
	currentIndex = (currentIndex - 1 + portraitItems.length) % portraitItems.length;
	showImage(currentIndex, currentView);
}

// Click on portrait item (not just thumb) to open fullscreen
portraitItems.forEach((item, index) => {
	item.addEventListener('click', function() {
		showImage(index, 'main');
	});
});

// View button click handlers
const viewButtons = modal.querySelectorAll('.view-button');
viewButtons.forEach(button => {
	button.addEventListener('click', (e) => {
		e.stopPropagation();
		const view = button.getAttribute('data-view');
		showImage(currentIndex, view);
	});
});

// Close button
if (closeBtn) {
	closeBtn.addEventListener('click', () => {
		modal.style.display = 'none';
	});
}

// Navigation arrows
if (navLeft) {
	navLeft.addEventListener('click', (e) => {
		e.stopPropagation();
		prevImage();
	});
}

if (navRight) {
	navRight.addEventListener('click', (e) => {
		e.stopPropagation();
		nextImage();
	});
}

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

} // End if modal exists
