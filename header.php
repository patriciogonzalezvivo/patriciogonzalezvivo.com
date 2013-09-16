<?php
// main menu

echo '
<!DOCTYPE html>
<html>
	<head>
		<title>Patricio Gonzalez Vivo</title>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<meta name="keywords" content="openFrameworks, expressive, arts, creative, connection, therapy" />
		<meta name="description" content="Patricio Gonzalez Vivo is MFA Design and Technology Candidate at Parsons and clinical psychologist specializing in nonverbal expressive therapies focused on bringing cutting edge technologies to spaces where creativity and playing can bring transformation to people." />
		
		<link href="http://patriciogonzalezvivo.com/ico.gif" rel="shortcut icon"  />
		<link href="http://patriciogonzalezvivo.com/css/style.css" rel="stylesheet" />
		<link href="http://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,200italic,300italic,400italic" rel="stylesheet" type="text/css">
		
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
		<script type="text/javascript" src="http://malsup.github.com/jquery.cycle.all.js"></script>
		<script type="text/javascript" src="https://www.google.com/jsapi"></script>
		<script type="text/javascript" src="http://patriciogonzalezvivo.com/js/jquery.tweet.js"></script>
		<script type="text/javascript" src="http://patriciogonzalezvivo.com/js/jquery.timeago.js"></script>
    
		<script type="text/javascript">

      var _gaq = _gaq || [];
      _gaq.push(["_setAccount", "UA-18824436-1"]);
      _gaq.push(["_setDomainName", "patriciogonzalezvivo.com"]);
      _gaq.push(["_trackPageview"]);

      (function() {
        var ga = document.createElement("script"); ga.type = "text/javascript"; ga.async = true;
        ga.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
        var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ga, s);
      })();

    </script>

		<script type="text/javascript">
    		$(document).ready( function(){ 
       
        		$("#twitter").tweet({
        			count: 1,
        			username: "@patriciogv",
        			loading_text: "searching twitter...",
        			template: "{avatar} {text}"
        			});

        		$("#myslides").cycle({
          			speed: 2000,
          			timeout: 3000
          		});
          	});
        </script>

        <script type="text/javascript">
  			google.load("feeds", "1");

  			function initialize() {
  				var feedGithub = new google.feeds.Feed("https://github.com/patriciogonzalezvivo.atom");
  				feedGithub.setNumEntries(10);
  				feedGithub.setResultFormat(google.feeds.Feed.XML_FORMAT);
  				feedGithub.load(
  					function(result){
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
  					}
  				);
  			}

  			google.setOnLoadCallback(initialize);
		</script>
		
		 <script type="text/javascript">
  			google.load("feeds", "1");

  			function initialize() {
  				var rssfeed = new google.feeds.Feed("http://patriciogonzalezvivo.com/blog/wp-atom.php");
  				rssfeed.setNumEntries(10);
  				rssfeed.setResultFormat(google.feeds.Feed.XML_FORMAT);
  				rssfeed.load(
  					function(result){
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
  					}
  				);
  			}

  			google.setOnLoadCallback(initialize);
		</script>
		
	</head>
	
	<body>
		<div id="wrapper">
	';
?>	