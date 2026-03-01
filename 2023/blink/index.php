<?php
    // Customize page metadata before including header
    $page_title = "BLINK";
    $page_description = "Both memento mori and moment of delight, an object suspended between disappearance and wonder";
    include("../../header.php");?>
    <?php include("../../menu.php");?>
        <link rel="stylesheet" href="style.css" type="text/css" />

        <article class="item">
            <div class="item-image">
                <div id="wrapper" class="windowed">
                    <img id="frame-back" class="frame" src="frame_background.png" alt="">
                        <canvas class='emscripten' id='canvas' oncontextmenu='event.preventDefault()' tabindex=-1 width="516" height="810"></canvas>
                    <!-- <img id="frame-front" class="frame" src="frame_refleccion.png" alt=""> -->
                </div>
            </div>
            <div class="item-info">
                <span class="item-title">BLINK</span>
                <span class="item-year">2023</span>
                <span class="item-medium">Real-time Generative Art</span>
                <p class="item-description">Made In collaboration with <a href="https://www.jenlowe.net/">Jen Lowe</a></p>
            </div>
        </article>

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
        
        <div id="longer-info">
            <p>Created for the <a href="https://app.brightmoments.io/collections/blink">BrightMoments exhibition</a>, BLINK emerges from a dialogue with Baroque vanitas painting, 17th-century still lifes that used fragile, transient objects to meditate on time, impermanence, and human finitude.</p>
            <p>In BLINK, the bubble becomes both memento mori and moment of delight, an object suspended between disappearance and wonder. The work translates this historically loaded symbol into a computational language, scaling the bubble to monumental proportions while preserving its essential fragility. Flowing background streams and algorithmic fields echo visual systems developed in The Book of Shaders, situating the piece within an ongoing exploration of time, perception, and scale in code-based art.</p>
            <p>The result is a paradoxical image: a structure that feels planetary yet impossibly delicate.</p>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/three@0.124/build/three.min.js"></script>
        <script type="module" src="main.min.js"></script>

<?php include("../../footer.php"); ?>