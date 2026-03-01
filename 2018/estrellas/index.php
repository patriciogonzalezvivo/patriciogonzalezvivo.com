<?php
// Customize page metadata before including header
$page_title = "Estrellas - Patricio Gonzalez Vivo";
$page_description = "Estrellas is an instrument for connection, presence and empathy through watching the sky together.";
$page_keywords = "Estrellas, Patricio Gonzalez Vivo";
// $og_url will be auto-generated from current path
// $og_title and $og_description will use page_title and page_description
// $og_image will be auto-detected from thumb.gif
// $og_image_width and $og_image_height will be auto-calculated

include("../../header.php");
?>
        <script type="text/javascript" src="https://www.google.com/jsapi"></script>
        <link rel="stylesheet" href="style.css" type="text/css" />
        
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