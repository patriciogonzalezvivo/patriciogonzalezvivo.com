//	Lunch Item Animation in Cascade
//
var counter=0;
var items=document.getElementsByClassName("item");
var images=[];

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
		//	Hide previus
		//
		var previus = (counter==0)?images.length-1:counter-1;
		images[previus].classList.remove("photoFront");

		//	Show Current
		//
		images[counter].classList.toggle("photoFront");

		document.getElementById("myslides").style.height =  images[counter].height+"px" ;
		counter++;
	} else {
		counter=0;
	}
}

//	MENU or PROJECT
//
if ( items.length > 0 ){
   	setInterval( activateNext ,200);
} else {
	var mySlides = document.getElementById("myslides");

	if ( mySlides != null ){
		images=mySlides.getElementsByTagName("img");
		images[images.length-1].classList.toggle("photoFront");
		document.getElementById("myslides").style.height =  images[0].height+"px" ;
		setInterval( slideNext ,3000);
	}
}