<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title> Astros </title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <meta name='mobile-web-app-capable' content='yes'>
        <meta name='apple-mobile-web-app-capable' content='yes'>
        <meta property="og:image" content="thumb.gif" />
        <meta property="og:title" content=" Astros " />
        <meta property="og:url" content="https://patriciogonzalezvivo.com/2026/astros/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content=" Astros " />
        <meta property="og:locale" content="en_US" />
        <meta property="og:author" content="Patricio Gonzalez Vivo" />
        <meta property='og:description' content='by Patricio Gonzalez Vivo. Astros is a living, luminous meditation on the present sky.'/>
        <meta property='og:image:width' content='640'/>
        <meta property='og:image:height' content='192'/>

        <meta name="description" content=" Astros " />
        <meta name="keywords" content="Patricio Gonzalez Vivon" />
        <meta name="author" content="Patricio Gonzalez Vivo" />
        

        <script async src="https://www.googletagmanager.com/gtag/js?id=G-W5MR6SK1EZ"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W5MR6SK1EZ');
            </script>
    </head>
    <body class="windowed-mode">
        
        <link href="../../ico.gif" rel="shortcut icon"  />
        <link href="../../css/style.css" rel="stylesheet" />
        <link href="http://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600,200italic,300italic,400italic" rel="stylesheet" type="text/css">
        <script type="text/javascript" src="https://www.google.com/jsapi"></script>
        <link rel="stylesheet" href="style.css" type="text/css" />
        <script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>

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
                <span class="item-title">Astros</span>
                <span class="item-year">2026</span>
                <span class="item-medium">Real-time Generative Art</span>
                <p class="item-description">In conversation with <a href="https://martinbonadeo.art/">Martin Bonadeo</a>, <a href="https://www.oliverioduhalde.com/">Oliverio Duhalde</a> (sound design) and <a href="https://astrologiacampusvirtual.com/profesores/alejandra-eusebi/">Alejandra Eusebi Polich</a> (astrology).</p>
            </div>
        </article>

        <div id="ui">
            <button id="resize-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            </button>
        </div>

        <div id="longer-info">
            <?php
			include("../../parsedown/Parsedown.php");
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents ('README.md'));
			?>
        </div>
        <wasm-loader></wasm-loader>
        <script type="module" src="main.js"></script>

<?php include("../../footer.php"); ?>

