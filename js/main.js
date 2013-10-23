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
		images[previus].classList.remove("roundPhotoFront");
		
		//	Show Current
		//
		images[counter].classList.toggle("roundPhotoFront");

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
		images[images.length-1].classList.toggle("roundPhotoFront");
		document.getElementById("myslides").style.height =  images[0].height+"px" ;
		setInterval( slideNext ,3000);
	}
}

//	If the user have CHROME load a subtle webGL scene based on the time of the day
//
if (navigator.userAgent.indexOf('Chrome') != -1 && parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Chrome') + 7).split(' ')[0]) >= 15){
 	
 	//	We are in CHROME
 	// 
	var d = new Date();
	var now = d.getHours();
	var shader = document.getElementById('fragmentShader');    	
	
	if( shader != null){
		//	This web have a shader to render
		//
		var newScript = document.createElement('script');
		newScript.type = 'text/javascript';
		newScript.src = '/js/shader.min.js';
		document.getElementsByTagName('head')[0].appendChild(newScript);
		
	} else  if((now>=7)&&(now<19)){
		//	DAY
		//
			
 	} else { 
		//	NIGHT
		//
		var newScript = document.createElement('script');
		newScript.type = 'text/javascript';
		newScript.src = '/js/star-sky.min.js';
		document.getElementsByTagName('head')[0].appendChild(newScript);
 	} 
    
} else {
	
	//	NO-CHROME Browser
	//	
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

	