$(document).ready( function(){ 
       
	$("#myslides").cycle({
    	speed: 2000,
        timeout: 3000
    });
    
}); 


google.load("feeds", "1");

function initialize() {
    
  		var feedGithub = new google.feeds.Feed("https://github.com/patriciogonzalezvivo.atom");
  		feedGithub.setNumEntries(10);
  		feedGithub.setResultFormat(google.feeds.Feed.XML_FORMAT);
  		
  		feedGithub.load( function(result){
  			var container = document.getElementById("github");
  			if (!result.error) {
  				var ul = document.createElement("ul");
  				var totalElements = 0;

  				for (var i = 0; i < result.xmlDocument.getElementsByTagName("entry").length && totalElements<6; i++) {
	  				var entry = result.xmlDocument.getElementsByTagName("entry")[i];
  					var li = document.createElement("li");
  					var a = document.createElement("a");
  					//var img = document.createElement("img");
  					//var div = document.createElement("div");
  					//div.className="github_avatar";
  					//img.src = entry.getElementsByTagNameNS("*","thumbnail")[0].getAttribute("url");
  					a.href = entry.getElementsByTagName("link")[0].getAttribute("href");
  					var title = entry.getElementsByTagName("title")[0].textContent;

  					if(title.indexOf("Merge") == 0){
  						continue;
  					}
  					
  					var date = entry.getElementsByTagName("updated")[0].textContent;
  					var dateTag = document.createElement("span");
  					dateTag.className = "feedTime";
  					dateTag.title = date;
  					dateTag.appendChild(document.createTextNode(jQuery.timeago(date)));
  					a.appendChild(document.createTextNode(title));
  					a.appendChild(dateTag);
  					//div.appendChild(img);
  					//li.appendChild(div);
  					li.appendChild(a);
  					li.appendChild(document.createElement("br"));
  					ul.appendChild(li);
  					totalElements++;
  				}
  				container.appendChild(ul);
  			} else {
  				container.innerHTML = "<p>error</p>";
  			}
  		});
}
  	
google.setOnLoadCallback(initialize); 
  			
  			/*
  			
  		var rssfeed = new google.feeds.Feed("http://patriciogonzalezvivo.com/blog/wp-atom.php");
  		rssfeed.setNumEntries(10);
  		rssfeed.setResultFormat(google.feeds.Feed.XML_FORMAT);
  		rssfeed.load( function(result){
  			var container = document.getElementById("wordpress");

  			if (!result.error) {
  				var ul = document.createElement("ul");
  				var totalElements = 0;

  				for (var i = 0; i < result.xmlDocument.getElementsByTagName("entry").length; i++) {
	  				var entry = result.xmlDocument.getElementsByTagName("entry")[i];
	  				var li = document.createElement("li");
	  				var a = document.createElement("a");
  					a.href = entry.getElementsByTagName("link")[0].getAttribute("href");
  					var title = entry.getElementsByTagName("title")[0].textContent;
  									
  					var date = entry.getElementsByTagName("published")[0].textContent;
  					var dateTag = document.createElement("span");
  					dateTag.className = "feedTime";
  					dateTag.title = date;
  					dateTag.appendChild(document.createTextNode(jQuery.timeago(date)));
 					a.appendChild(document.createTextNode(title));
 					a.appendChild(dateTag);
  								
	  				li.appendChild(a);
	  				li.appendChild(document.createElement("br"));
	  				ul.appendChild(li);
	  				totalElements++;
	  			}
	  			container.appendChild(ul);
	  		} else {
  				container.innerHTML = "<p>error</p>";
  			}
  		});
  		
  	}
  	
  	google.setOnLoadCallback(initialize);  
*/
                		




  			