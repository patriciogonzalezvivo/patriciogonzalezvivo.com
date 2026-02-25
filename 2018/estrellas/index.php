<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Estrellas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:image" content="thumb.gif" />
        <meta property="og:title" content="Estrellas" />
        <meta property='og:image:width' content='575'/>
        <meta property='og:image:height' content='165'/>
        <meta property='og:description' content='Estrellas is an instrument for connection, presence and empathy through watching the sky together.'/>
        <meta property='og:site_name' content='Patricio Gonzalez Vivo'/>
        <meta name="description" content="Estrellas is an instrument for connection, presence and empathy through watching the sky together." />
        <meta name="keywords" content="Estrellas, Patricio Gonzalez Vivo" />
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
                <span class="item-title">Estrellas</span>
                <span class="item-year">2018</span>
                <span class="item-medium">Custom real-time software</span>
            </div>
        </article>

        <div id="ui">
            <a id="frm-btn" href="https://frm.fm/a/patricio_gonzalez_vivo/estrellas" target="_blank">
                <img src="frm_logo.png" alt="FRM Logo">
            </a>
            <button id="resize-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            </button>
        </div>


        <div id="longer-info">
            <p>In collaboration with <a href="https://www.jenlowe.net/">Jen Lowe</a></p>
            <p>The stars have served as silent witnesses, teaching us about cycles, orientation, and transcendence. This real-time installation functions as a window onto the cosmos, presenting an accurate, live view of stars and celestial bodies as they exist in the present moment. By situating astronomical data within the here and now, the work seeks to restore an awareness of time as an experiential landscape rather than an abstract measure. It offers a contemporary reflection on an earlier epoch, when humanity looked to the sky for knowledge, meaning, and guidance.</p>
        </div>
        <wasm-loader></wasm-loader>

        <footer>
            <p>© Patricio Gonzalez Vivo 2026</p>
        </footer>
    </body>
    <script type="module" src="main.js"></script>
</html>