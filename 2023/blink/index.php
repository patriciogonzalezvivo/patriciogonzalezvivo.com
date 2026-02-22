<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>BLINK</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <meta name='mobile-web-app-capable' content='yes'>
        <meta name='apple-mobile-web-app-capable' content='yes'>
        <meta property="og:image" content="thumbnail.png" />
        <meta property="og:title" content="BLINK" />
        <meta property="og:url" content="https://patriciogonzalezvivo.github.io/weaver/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Weaver" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:author" content="Patricio Gonzalez Vivo" />
        <meta property='og:description' content='by Patricio Gonzalez Vivo. both memento mori and moment of delight, an object suspended between disappearance and wonder'/>
        <meta property='og:image:width' content='512'/>
        <meta property='og:image:height' content='512'/>

        <meta name="description" content="Both memento mori and moment of delight, an object suspended between disappearance and wonder" />
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
        <div id="wrapper" class="windowed">
            <img id="frame-back" class="frame" src="frame_background.png" alt="">
                <canvas class='emscripten' id='canvas' oncontextmenu='event.preventDefault()' tabindex=-1 width="516" height="810"></canvas>
            <img id="frame-front" class="frame" src="frame_refleccion.png" alt="">
        </div>
        <div id="ui">
            <button id="bm-btn">
                <a id="frm-btn" href="https://app.brightmoments.io/collections/blink" target="_blank">
                    <svg width="24" height="24" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M0 36C19.8825 36 36 19.8816 36 0C16.1175 0 0 16.1184 0 36ZM25.4555 25.456H10.5445V10.5408H25.4555V25.456Z"></path></svg>
                </a>
                </button>    
            <button id="resize-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            </button>
        </div>
        <div id="info">
            <h1>BLINK</h1>
            <h2>by <a href="https://patriciogonzalezvivo.com">Patricio Gonzalez Vivo</a> and <a href="https://www.jenlowe.net/">Jen Lowe</a></h2>
            <p>Created for the <a href="https://app.brightmoments.io/collections/blink">BrightMoments exhibition</a>, BLINK emerges from a dialogue with Baroque vanitas painting, 17th-century still lifes that used fragile, transient objects to meditate on time, impermanence, and human finitude.</p>
            <p>In BLINK, the bubble becomes both memento mori and moment of delight, an object suspended between disappearance and wonder. The work translates this historically loaded symbol into a computational language, scaling the bubble to monumental proportions while preserving its essential fragility. Flowing background streams and algorithmic fields echo visual systems developed in The Book of Shaders, situating the piece within an ongoing exploration of time, perception, and scale in code-based art.</p>
            <p>The result is a paradoxical image: a structure that feels planetary yet impossibly delicate.</p>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/three@0.124/build/three.min.js"></script>

        <footer>
            <p>Copyright Patricio Gonzalez Vivo 2026</p>
        </footer>
    </body>
    <script type="module" src="main.min.js"></script>
</html>