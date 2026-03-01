<?php
    include("../../project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../header.php");?>
        <?php include("../../menu.php");?>
        <link rel="stylesheet" href="style.css" type="text/css" />

        <div id="wrapper" class="windowed">
            <img id="frame-back" class="frame" src="../../images/frame_background.png" alt="">
            <canvas class='emscripten' id='canvas' oncontextmenu='event.preventDefault()' tabindex=-1></canvas>
            <img id="frame-front" class="frame" src="../../images/frame_refleccion.png" alt="">
        </div>

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

        <weaver-loader></weaver-loader>
        <overlay-controls></overlay-controls>
        <script type="module" src="main.js"></script>

<?php include("../../footer.php"); ?>
