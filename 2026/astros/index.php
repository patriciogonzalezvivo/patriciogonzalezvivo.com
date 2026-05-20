
<?php
    include("../../project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = implode('. ', array_filter([$meta['medium'], $meta['description']]));
    include("../../header.php");?>
        <?php include("../../menu.php");?>
        <link rel="stylesheet" href="style.css" type="text/css" />
        <script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>

        <article class="item">
            <div class="item-image">
                <div id="wrapper" class="windowed">
                    <img id="frame-back" class="frame" src="../../images/frame_background.png" alt="">
                        <canvas class='emscripten' id='canvas' oncontextmenu='event.preventDefault()' tabindex=-1></canvas>
                    <img id="frame-front" class="frame" src="../../images/frame_refleccion.png" alt="">
                </div>
            </div>
            <div class="item-info">
                <span class="item-title"><?php echo htmlspecialchars($meta['title'] ?? ''); ?></span>
                <span class="item-year"><?php echo htmlspecialchars($meta['year'] ?? ''); ?></span>
                <span class="item-medium"><?php echo htmlspecialchars($meta['medium'] ?? ''); ?></span>
                <span class="item-dimensions"><?php echo htmlspecialchars($meta['dimensions'] ?? ''); ?></span>
                <p class="item-description"><?php echo htmlspecialchars($meta['description'] ?? ''); ?></p>
            </div>
        </article>

        <div id="ui">
            <button id="resize-btn" tabindex="-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            </button>
        </div>

        <div id="longer-info">
            <?php
			include("../../ParsedownExtended.php");
			$Parsedown = new ParsedownExtended();
			echo $Parsedown->text(file_get_contents ('README.md'));
			?>

            <!-- <script src="https://fast.wistia.com/player.js" async></script>
            <script src="https://fast.wistia.com/embed/6elymy9yw4.js" async type="module"></script>
            <style>wistia-player[media-id='6elymy9yw4']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/6elymy9yw4/swatch'); display: block; filter: blur(5px); padding-top:100.0%; }</style>
            <wistia-player media-id="6elymy9yw4" aspect="1.0"></wistia-player> -->

            <h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2026/santos'],
                    ['path' => '2026/weaver2'],
                    ['path' => '2017/pixelspirit', 'url' => 'http://pixelspiritdeck.com/', 'title' => 'PixelSpirit', 'year' => '2017', 'medium' => 'Tarot Deck / Book', 'dimensions' => '78 Cards'],
                    ['path' => '2018/estrellas'],
                    ['path' => '2017/luna'],
                    // ['path' => '2019/hogar'],
                ];

                echo render_projects_list($projects, '../../');
            ?>
        </div>

        <wasm-loader></wasm-loader>
        <overlay-controls></overlay-controls>
        <script type="module" src="main.js"></script>

        <!-- <section class="content"> -->
            
    <!-- </section> -->

<?php include("../../footer.php"); ?>

