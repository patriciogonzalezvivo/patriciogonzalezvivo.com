//	Lunch Item Animation in Cascade
//
function activateNext(){var e=document.getElementsByClassName("item");if(counter<e.length){e[counter].classList.add("is-active");counter++}}function slideNext(){if(counter<images.length){var e=counter==0?images.length-1:counter-1;images[e].classList.remove("roundPhotoFront");console.log("Poping: "+images[e]);images[counter].classList.toggle("roundPhotoFront");console.log("Pushing: "+images[counter]);counter++}else counter=0}var counter=0,items=document.getElementsByClassName("item"),images=document.getElementById("myslides").getElementsByClassName("roundPhoto");items.length>0?setInterval(activateNext,200):setInterval(slideNext,300);!function(e,t,n){var r,i=e.getElementsByTagName(t)[0],s=/^http:/.test(e.location)?"http":"https";if(!e.getElementById(n)){r=e.createElement(t);r.id=n;r.src=s+"://platform.twitter.com/widgets.js";i.parentNode.insertBefore(r,i)}}(document,"script","twitter-wjs");