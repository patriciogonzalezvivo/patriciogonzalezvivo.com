//	Lunch Item Animation in Cascade
//
var menuCounter = 0;
var items = document.getElementsByClassName("item");

//	Activate Next Item
//
function activateNext(){
	var items = document.getElementsByClassName("item");
	if (menuCounter < items.length ){
		items[menuCounter].classList.add("is-active");
		menuCounter++;
	}
}

//	Initialize a single slideSet element
//
function initSlideSet(slideSet) {
	var images = slideSet.getElementsByTagName("img");
	if (images.length === 0) return;

	var counter = 0;
	var firstImage = images[0];

	function slideNext() {
		var previus = (counter === 0) ? images.length - 1 : counter - 1;
		images[previus].classList.remove("photoFront");

		images[counter].classList.add("photoFront");

		var height = images[counter].offsetHeight;
		if (height > 0) {
			slideSet.style.height = height + "px";
		}

		counter++;
		if (counter >= images.length) {
			counter = 0;
		}
	}

	function start() {
		// Show the last image initially
		images[images.length - 1].classList.add("photoFront");

		var height = firstImage.offsetHeight;
		if (height > 0) {
			slideSet.style.height = height + "px";
		}

		setInterval(slideNext, 3000);
	}

	if (firstImage.complete && firstImage.naturalHeight > 0) {
		start();
	} else {
		firstImage.addEventListener('load', start);
	}
}

//	Initialize all slideSets on the page
//
// Support both id="slideSet" (legacy single) and id starting with "slideSet-" (multiple)
var allSlideSets = Array.from(document.querySelectorAll('[id="slideSet"], [id^="slideSet-"]'));

allSlideSets.forEach(function(slideSet) {
	initSlideSet(slideSet);
});

// Initialize menu item animation if items exist
if ( items.length > 0 ){
   	setInterval( activateNext ,200);
}