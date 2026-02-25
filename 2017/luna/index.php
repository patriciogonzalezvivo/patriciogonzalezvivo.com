<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Luna</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:image" content="thumb.gif" />
        <meta property="og:title" content="Luna" />
        <meta property='og:description' content='Luna is living meditation on time and celestial rhythm'/>
        <meta property='og:site_name' content='Patricio Gonzalez Vivo'/>

        <meta name="description" content="Luna is living meditation on time and celestial rhythm" />
        <meta name="keywords" content="Luna, Patricio Gonzalez Vivo" />
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
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W5MR6SK1EZ');
        </script>
    </head>
    <body class="windowed-mode">
        
        <?php include("../../menu.php");?>

        <article class="item">
			<div class="item-image">
				<div id="wrapper" class="windowed">
					<img id="frame-back" class="frame" src="frame_background.png" alt="">
					<canvas class='emscripten' id='canvas' oncontextmenu='event.preventDefault()' tabindex=-1></canvas>
					<img id="frame-front" class="frame" src="frame_refleccion.png" alt="">
				</div>
			</div>
            <div class="item-info">
                <span class="item-title">LUNA</span>
                <span class="item-year">2017</span>
                <span class="item-medium">Custom real-time software</span>
				<p class="item-description">Made In collaboration with <a href="https://www.jenlowe.net/">Jen Lowe</a></p>
            </div>
        </article>

        <div id="ui">
            <a id="frm-btn" href="https://frm.fm/a/patricio_gonzalez_vivo/luna" target="_blank">
				<img src="frm_logo.png" alt="FRM Logo">
			</a>
            <button id="resize-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            </button>
        </div>


        <div id="longer-info">
        	<p>Luna is a living meditation on time and celestial rhythm. This real-time digital artwork mirrors the moon’s current phase, slowly rotating to reveal both illuminated and obscured surfaces. Her form subtly transforms in sync with the lunar cycle, while the surrounding atmosphere shifts from daylight to darkness. Functioning simultaneously as a lunar calendar and a daily clock, Luna invites sustained contemplation and a heightened awareness of time’s quiet passage.</p>
			<p>Exibitions:</p>
			<ul>
				<p>2017 - Historia de un malentendido at Espacio Pla, Buenos Aires</p>
				<p>2017 - Temporal Topologies show at IFP, New York City</p>
				<p>2018 - <a href="https://frm.fm/a/patricio_gonzalez_vivo/luna">Framed</a></p>
			</ul>
        </div>
        <wasm-loader></wasm-loader>

        <footer>
            <p>© Patricio Gonzalez Vivo 2026</p>
        </footer>
    </body>
    <script type="module" src="main.js"></script>
</html>