<?php
// Customize page metadata before including header
$page_title = "Luna - Patricio Gonzalez Vivo";
$page_description = "Luna is living meditation on time and celestial rhythm";
$page_keywords = "Luna, Patricio Gonzalez Vivo";
// $og_url will be auto-generated from current path
// $og_title and $og_description will use page_title and page_description
// $og_image will be auto-detected from thumb.jpg
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
            <?php
            include("../../parsedown/Parsedown.php");
            $Parsedown = new Parsedown();
            echo $Parsedown->text(file_get_contents('README.md'));
            ?>
        </div>
        <wasm-loader></wasm-loader>

        <footer>
            <p>© Patricio Gonzalez Vivo 2026</p>
        </footer>
    </body>
    <script type="module" src="main.js"></script>
</html>