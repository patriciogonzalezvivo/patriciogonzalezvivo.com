//	Lunch Item Animation in Cascade
//
var menuCounter = 0;
var slideCounter = 0;
var items = document.getElementsByClassName("item");
var images = [];

//	Avtivate Next Item
//
function activateNext(){
	var items = document.getElementsByClassName("item");
	if (menuCounter < items.length ){
		items[menuCounter].classList.add("is-active");
		menuCounter++;
	}
}

//	Transition to next slide
//
function slideNext(){
	// Hide previous
	var previus = (slideCounter == 0) ? images.length-1 : slideCounter-1;
	images[previus].classList.remove("photoFront");

	// Show current
	images[slideCounter].classList.add("photoFront");

	var height = images[slideCounter].offsetHeight;
	if (height > 0) {
		document.getElementById("slideSet").style.height = height + "px";
	}
	
	// Advance counter and loop back to 0 if needed
	slideCounter++;
	if (slideCounter >= images.length) {
		slideCounter = 0;
	}
}

//	MENU or PROJECT
//
// Initialize slideSet first if it exists
var slideSet = document.getElementById("slideSet");

if ( slideSet != null ){
	images = slideSet.getElementsByTagName("img");
	
	// Wait for first image to load before initializing
	if (images.length > 0) {
		var firstImage = images[0];
		
		function initSlideshow() {
			// Show the last image initially
			images[images.length-1].classList.add("photoFront");
			
			// Set height based on first image
			var height = firstImage.offsetHeight;
			if (height > 0) {
				document.getElementById("slideSet").style.height = height + "px";
			}
			
			// Start slideshow
			setInterval( slideNext ,3000);
		}
		
		// If image already loaded, init immediately
		if (firstImage.complete && firstImage.naturalHeight > 0) {
			initSlideshow();
		} else {
			// Otherwise wait for load event
			firstImage.addEventListener('load', initSlideshow);
		}
	}
}

// Initialize menu item animation if items exist
if ( items.length > 0 ){
   	setInterval( activateNext ,200);
}