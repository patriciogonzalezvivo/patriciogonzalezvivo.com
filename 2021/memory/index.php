<?php
    // Customize page metadata before including header
    $page_title = "Memory Studies - Patricio Gonzalez Vivo";
    $page_description = "Memory Studies, an exploration of the intersection between memory and digital media.";
    $page_keywords = "Memory, Digital Media, Patricio Gonzalez Vivo";
    // Override og_title/og_site_name for social sharing (optional)
    $og_title = "Memory Studies";
    $og_site_name = "Memory Studies";
    // $og_url will be auto-generated from current path
    // $og_description will use page_description
    // $og_image will be auto-detected from thumb.gif
    // $og_image_width and $og_image_height will be auto-calculated

    include("../../header.php");
    ?>
    <?php include("../../menu.php");?>
            <link rel="stylesheet" href="style.css" type="text/css" />

        <article class="item">
            <div class="item-image">
                <div id="wrapper" class="windowed">
                    <img id="frame-back" class="frame" src="frame_background.png" alt="">
                        <canvas class='emscripten' id='canvas' oncontextmenu='event.preventDefault()' tabindex=-1></canvas>
                    <img id="frame-front" class="frame" src="frame_refleccion.png" alt="">
                </div>
            </div>
            <div class="item-info">
                <span class="item-title">Memory Studies</span>
                <span class="item-year">2021</span>
                <span class="item-medium">Real-time Generative Art</span>
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
            echo $Parsedown->text(file_get_contents('README.md'));
            ?>
        </div>
        <wasm-loader></wasm-loader>
        <script type="module" src="main.js"></script>
	
<?php include("../../footer.php"); ?>
