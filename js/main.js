var counter=0;

function activateNext(){
	var items = document.getElementsByClassName("item");
	
	if ( items.length > 0 ){
	
		//	It's in a menu
		//	
		if (counter < items.length ){
			items[counter].classList.add("is-active");
			counter++;	
		}
	} 
}


$(document).ready(function(){ 
       
	$("#myslides").cycle({
    	speed: 2000,
        timeout: 3000
    });
    
    setInterval( activateNext ,200);
});

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

