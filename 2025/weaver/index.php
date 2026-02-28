<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title> WIP </title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <meta name='mobile-web-app-capable' content='yes'>
        <meta name='apple-mobile-web-app-capable' content='yes'>
        <meta property="og:image" content="thumb.gif" />
        <meta property="og:title" content=" WIP " />
        <meta property="og:url" content="https://patriciogonzalezvivo.com/2025/weaver/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content=" WIP " />
        <meta property="og:locale" content="en_US" />
        <meta property="og:author" content="Patricio Gonzalez Vivo" />
        <!-- <meta property='og:description' content='by Patricio Gonzalez Vivo. Instrument for connection, presence and empathy through watching the sky together.'/> -->
        <meta property='og:image:width' content='640'/>
        <meta property='og:image:height' content='641'/>

        <meta name="description" content=" WIP" />
        <meta name="keywords" content="Patricio Gonzalez Vivon" />
        <meta name="author" content="Patricio Gonzalez Vivo" />
        

        <link href="../../ico.gif" rel="shortcut icon"  />
        <link href="../../css/style.css" rel="stylesheet" />
        <link href="http://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,200italic,300italic,400italic" rel="stylesheet" type="text/css">
        <script type="text/javascript" src="https://www.google.com/jsapi"></script>

        <script>
            (function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,"script","//www.google-analytics.com/analytics.js","ga");
            ga("create", "UA-18824436-1", "patriciogonzalezvivo.com");
            ga("send", "pageview");
        </script>

        <link rel="stylesheet" href="style.css" type="text/css" />
        <script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-W5MR6SK1EZ"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W5MR6SK1EZ');
        </script>
    </head>
    <body class="windowed-mode">

        <?php include("../../menu.php");?>

        <div id="wrapper" class="windowed">
            <img id="frame-back" class="frame" src="frame_background.png" alt="">
            <canvas class='emscripten' id='canvas' oncontextmenu='event.preventDefault()' tabindex=-1></canvas>
            <img id="frame-front" class="frame" src="frame_refleccion.png" alt="">
        </div>

        <div id="ui">
            <button id="resize-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            </button>
        </div>


        <div id="longer-info">
            <div>
                <video controls width="100%" style="max-width: 800px;">
                <source src="000.mp4" type="video/mp4">
                Your browser does not support the video tag.
                </video>
            </div>
            <div>
                <video controls width="100%" style="max-width: 800px;">
                <source src="IMG_4879.MP4" type="video/mp4">
                Your browser does not support the video tag.
                </video>
            </div>
            <!-- <div>
                <video controls width="100%" style="max-width: 800px;">
                <source src="relics.mp4" type="video/mp4">
                Your browser does not support the video tag.
                </video>
            </div> -->
        </div>
        <weaver-loader></weaver-loader>
        <overlay-controls></overlay-controls>
	    <footer>
		    <p>Copyright Patricio Gonzalez Vivo 2026</p>
	    </footer>
    </body>
    <script type="module" src="main.js"></script>
</html>
