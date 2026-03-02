<?php
    // Load project metadata from TITLE.txt, MEDIUM.txt, etc.
    include("../../project_meta.php");
    $meta = get_current_project_meta();
    // Use metadata for page header
    $page_title = $meta['title'];
    $page_description = $meta['description'];
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
                <span class="item-title"><?php echo htmlspecialchars($meta['title']); ?></span>
                <span class="item-year"><?php echo htmlspecialchars($meta['year']); ?></span>
                <span class="item-medium"><?php echo htmlspecialchars($meta['medium']); ?></span>
                <span class="item-dimensions"><?php echo htmlspecialchars($meta['dimensions']); ?></span>
                <p class="item-description"><?php echo htmlspecialchars($meta['description']); ?></p>
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
            <?php
            include("../../parsedown/Parsedown.php");
            $Parsedown = new Parsedown();
            echo $Parsedown->text(file_get_contents('README.md'));
            ?>

            <h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2026/astros'],
                    // ['path' => '2025/weaver', 'url' => 'https://patriciogonzalezvivo.github.io/weaver'],
                    ['path' => '2023/blink'],
                    ['path' => '2025/orbitas2', 'title' => 'Órbitas', 'year' => '2018'],
                    ['path' => '2019/hogar'],
                    ['path' => '2017/luna'],
                ];

                foreach ($projects as $project) {
                    $commented = isset($project['commented']) && $project['commented'];
                    
                    // Load metadata for projects with a path
                    if (isset($project['path'])) {
                        $meta = get_project_meta($project['path'], '../../');
                        
                        // Fix path to be relative from this page
                        $meta['path'] = '../../' . $meta['path'];
                        
                        // Override with explicitly provided values
                        if (isset($project['title'])) $meta['title'] = $project['title'];
                        if (isset($project['year'])) $meta['year'] = $project['year'];
                        if (isset($project['medium'])) $meta['medium'] = $project['medium'];
                        if (isset($project['dimensions'])) $meta['dimensions'] = $project['dimensions'];
                        if (isset($project['description'])) $meta['description'] = $project['description'];
                        if (isset($project['url'])) $meta['url'] = $project['url'];
                        if (isset($project['thumbnail'])) $meta['thumbnail'] = $project['thumbnail'];
                    } else {
                        // External project without local path - use provided metadata
                        $meta = [
                            'title' => $project['title'] ?? '',
                            'year' => $project['year'] ?? '',
                            'medium' => $project['medium'] ?? '',
                            'dimensions' => $project['dimensions'] ?? '',
                            'description' => $project['description'] ?? '',
                            'url' => $project['url'],
                            'thumbnail' => $project['thumbnail'] ?? '',
                        ];
                    }
                    
                    // Render the item
                    echo render_project_item($meta, $commented);
                }
            ?>
        </div>

        <wasm-loader></wasm-loader>
        <script type="module" src="main.js"></script>

<?php include("../../footer.php"); ?>