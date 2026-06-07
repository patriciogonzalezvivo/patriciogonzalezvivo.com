// Fullscreen functionality
const modal = document.getElementById('fullscreen-modal');
const modalImg = modal ? modal.querySelector('.fullscreen-image') : null;
const soldMarker = modal ? modal.querySelector('.sold-marker-fullscreen') : null;
const closeBtn = modal ? modal.querySelector('.close-modal') : null;
const navLeft = modal ? modal.querySelector('.nav-arrow-left') : null;
const navRight = modal ? modal.querySelector('.nav-arrow-right') : null;
const portraitItems = document.querySelectorAll('.painting-item');

let currentIndex = 0;

// Exit if modal elements don't exist
if (!modal || !modalImg) {
	console.log('Gallery modal not found on this page');
} else {

// Current view state ('main', 'detail', or 'installation')
let currentView = 'main';

// Cache repeated modal sub-element queries
const titleEl        = modal.querySelector('.fullscreen-title');
const yearEl         = modal.querySelector('.fullscreen-year');
const mediumEl       = modal.querySelector('.fullscreen-medium');
const dimensionsEl   = modal.querySelector('.fullscreen-dimensions');
const buyPrintBtn    = modal.querySelector('.fullscreen-buy-print');
const buyBtn         = modal.querySelector('.fullscreen-buy');
const navContainer   = modal.querySelector('.fullscreen-nav');
const mainBtn        = modal.querySelector('.view-button[data-view="main"]');
const detailBtn      = modal.querySelector('.view-button[data-view="detail"]');
const installationBtn = modal.querySelector('.view-button[data-view="installation"]');

// Dots
const galleryDotsContainer = modal.querySelector('.gallery-dots');
let galleryDots = [];
if (galleryDotsContainer && portraitItems.length > 0) {
	galleryDots = Array.from(portraitItems).map((_, i) => {
		const dot = document.createElement('button');
		dot.className = 'rail-dot';
		dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
		dot.addEventListener('click', (e) => { e.stopPropagation(); showImage(i, currentView); });
		galleryDotsContainer.appendChild(dot);
		return dot;
	});
}

function updateGalleryDots(index) {
	galleryDots.forEach((d, i) => d.classList.toggle('is-active', i === index));
}

// Function to display an image in fullscreen
function showImage(index, view = 'main') {
	const portraitItem = portraitItems[index];
	// Get data from the parent .painting-item div, not the img
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
	updateGalleryDots(index);

	// Update URL hash to allow direct linking
	const itemId = portraitItem.getAttribute('data-id');
	if (itemId) {
		const hashVal = view !== 'main' ? itemId + ':' + view : itemId;
		history.replaceState(null, '', '#' + hashVal);
	}
	
	if (soldMarker) {
		if (isSold) {
			soldMarker.style.display = 'block';
		} else {
			soldMarker.style.display = 'none';
		}
	}
	
	// Display artwork info in fullscreen
	if (infoData) {
		let info;
		try { info = JSON.parse(infoData); } catch(e) { info = {}; }

		if (titleEl) titleEl.textContent = info.title || 'Untitled';
		if (yearEl) yearEl.textContent = info.year || '';
		if (mediumEl) mediumEl.textContent = info.medium || '';
		if (dimensionsEl) dimensionsEl.textContent = info.dimensions || info.size || '';

		if (buyPrintBtn) {
			if (info.print) {
				buyPrintBtn.href = info.print;
				buyPrintBtn.style.display = 'inline-block';
			} else {
				buyPrintBtn.style.display = 'none';
			}
		}

		if (buyBtn) {
			if (!isSold) {
				const title = info.title || 'Untitled';
				const year = info.year || '';
				const subject = 'Acquisition Inquiry: ' + title + (year ? ', ' + year : '');
				buyBtn.href = 'mailto:patriciogonzalezvivo@gmail.com?subject=' + encodeURIComponent(subject);
				buyBtn.style.display = 'inline-block';
			} else {
				buyBtn.style.display = 'none';
			}
		}
	}
	
	// Update view buttons visibility and active state
	updateViewButtons(portraitItem);
}

// Update view buttons based on available views
function updateViewButtons(portraitItem) {
	const detailSrc = portraitItem.getAttribute('data-detail');
	const installationSrc = portraitItem.getAttribute('data-installation');

	const hasDetail = !!detailSrc;
	const hasInstallation = !!installationSrc;
	const viewCount = 1 + (hasDetail ? 1 : 0) + (hasInstallation ? 1 : 0);

	if (!navContainer) return;

	if (viewCount === 1) {
		navContainer.style.display = 'none';
		return;
	}

	navContainer.style.display = 'flex';

	if (mainBtn) {
		mainBtn.style.display = 'inline-block';
		mainBtn.classList.toggle('active', currentView === 'main');
	}

	if (detailBtn) {
		detailBtn.style.display = hasDetail ? 'inline-block' : 'none';
		if (hasDetail) detailBtn.classList.toggle('active', currentView === 'detail');
	}

	if (installationBtn) {
		installationBtn.style.display = hasInstallation ? 'inline-block' : 'none';
		if (hasInstallation) installationBtn.classList.toggle('active', currentView === 'installation');
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

// Prevent buy/print buttons in gallery view from opening fullscreen
document.querySelectorAll('.painting-item .artwork-btn').forEach(btn => {
	btn.addEventListener('click', (e) => {
		e.stopPropagation();
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

// Helper to clear the URL hash without adding a history entry
function clearHash() {
	history.replaceState(null, '', window.location.pathname + window.location.search);
}

// Close button
if (closeBtn) {
	closeBtn.addEventListener('click', () => {
		modal.style.display = 'none';
		clearHash();
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
		clearHash();
	}
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
	if (modal.style.display === 'flex') {
		switch(e.key) {
			case 'Escape':
				modal.style.display = 'none';
				clearHash();
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

// Open image from URL hash on page load (e.g. #DSF1034 or #DSF1034:detail)
function openFromHash() {
	const hash = window.location.hash.slice(1); // strip '#'
	if (!hash) return;
	const parts = hash.split(':');
	const id = parts[0];
	const view = parts[1] || 'main';
	const idx = [...portraitItems].findIndex(item => item.getAttribute('data-id') === id);
	if (idx !== -1) {
		showImage(idx, view);
	}
}

openFromHash();

} // End if modal exists
