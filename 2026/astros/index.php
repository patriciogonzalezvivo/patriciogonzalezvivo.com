<?php
    $page_title = "Astros - Patricio Gonzalez Vivo";
    $page_description = "Astros is a living, luminous meditation on the present sky.";
    $page_keywords = "Patricio Gonzalez Vivo, astros, generative art, real-time art, astrology";
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

