<?php
    $page_title = "Orbitas - Patricio Gonzalez Vivo";
    $page_description = "Orbitas, a living cosmic choreography";
    $page_keywords = "Orbitas, Patricio Gonzalez Vivo";
    include("../../header.php");?>
        <?php include("../../menu.php");?>
        <link rel="stylesheet" href="style.css" type="text/css" />

        <article class="item">
            <div class="item-image">
                <div id="wrapper" class="windowed">
                    <img id="frame-back" class="frame" src="../../images/frame_background.png" alt="">
                        <canvas class='emscripten' id='canvas' oncontextmenu='event.preventDefault()' tabindex=-1></canvas>
                    <img id="frame-front" class="frame" src="../../images/frame_refleccion.png" alt="">
                </div>
            </div>
            <div class="item-info">
                <span class="item-title">Estrellas</span>
                <span class="item-year">2018</span>
                <span class="item-medium">Custom real-time software</span>
            </div>
        </article>

        <div id="ui">
            <a id="frm-btn" href="https://frm.fm/a/patricio_gonzalez_vivo/orbitas" target="_blank">
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
			echo $Parsedown->text(file_get_contents ('README.md'));
			?>
        </div>
        <wasm-loader></wasm-loader>
        <script type="module" src="main.js"></script>

<?php include("../../footer.php"); ?>