//	Lunch Item Animation in Cascade
//
function activateNext(){var e=document.getElementsByClassName("item");if(counter<e.length){e[counter].classList.add("is-active");counter++}}function slideNext(){if(counter<images.length){var e=counter==0?images.length-1:counter-1;images[e].classList.remove("roundPhotoFront");images[counter].classList.toggle("roundPhotoFront");document.getElementById("myslides").style.height=images[counter].height+"px";counter++}else counter=0}var counter=0,items=document.getElementsByClassName("item"),images=[];if(items.length>0)setInterval(activateNext,200);else{images=document.getElementById("myslides").getElementsByTagName("img");images[images.length-1].classList.toggle("roundPhotoFront");document.getElementById("myslides").style.height=images[counter].height+"px";setInterval(slideNext,3e3)}!function(e,t,n){var r,i=e.getElementsByTagName(t)[0],s=/^http:/.test(e.location)?"http":"https";if(!e.getElementById(n)){r=e.createElement(t);r.id=n;r.src=s+"://platform.twitter.com/widgets.js";i.parentNode.insertBefore(r,i)}}(document,"script","twitter-wjs");