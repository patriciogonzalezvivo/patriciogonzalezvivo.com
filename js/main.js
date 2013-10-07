//	Lunch Item Animation in Cascade
//
var counter=0;
var items=document.getElementsByClassName("item");
var images=document.getElementById("myslides").getElementsByClassName("roundPhoto");

//	Avtivate Next Item
//
function activateNext(){
	var items = document.getElementsByClassName("item");
	if (counter < items.length ){
		items[counter].classList.add("is-active");
		counter++;	
	} 
}

//	Transition to next slide
//
function slideNext(){
	if (counter < images.length ){
		//	Hide privius
		//
		var previus = (counter==0)?images.length-1:counter-1;
		images[previus].classList.remove("roundPhotoFront");
		console.log("Poping: "+ images[previus]) ;
		
		//	Show Current
		//
		images[counter].classList.toggle("roundPhotoFront");
		console.log("Pushing: " + images[counter]);

		counter++;	
	} else {
		counter=0;
	}
}

//	Main Functions
//
if ( items.length > 0 ){	
	//	Animate Menu Page
	//
   	setInterval( activateNext ,200);
} else {
	//	Animate Project Page
	//
	setInterval( slideNext ,300);
	
	/*
//	JQuerry Slides
	$("#myslides").cycle({
		speed: 2000,
		timeout: 3000
	});
*/
}

//	Tweeter Widget
//
!function(d,s,id){
	var js,
		fjs=d.getElementsByTagName(s)[0],
		p=/^http:/.test(d.location)?'http':'https';
	if(!d.getElementById(id)){
		js=d.createElement(s);
		js.id=id;
		js.src=p+"://platform.twitter.com/widgets.js";
		fjs.parentNode.insertBefore(js,fjs);
	}
}(document,"script","twitter-wjs");


	