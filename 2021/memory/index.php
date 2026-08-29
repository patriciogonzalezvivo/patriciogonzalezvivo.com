<?php
    include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../server/header.php");?>
    <?php include("../../server/menu.php");?>
        <link rel="stylesheet" href="style.css" type="text/css" />

        <article class="item">
            <div class="item-image">
                <div id="wrapper" class="windowed">
                    <canvas class='emscripten' id='canvas' oncontextmenu='event.preventDefault()' tabindex=-1></canvas>
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
            include("../../server/ParsedownExtended.php");
            include("../../server/objkt.php");
            $Parsedown = new ParsedownExtended();
            echo render_readme_with_objkt('README.md', $Parsedown, [
                'ref'    => 'tz1NqueFctvNCQrsELm6k4N6XfwAYu5Qp5LN',
                'tokens' => [
                    'https://objkt.com/asset/hicetnunc/320118',
                    'https://objkt.com/asset/hicetnunc/369576',
                    'https://objkt.com/asset/hicetnunc/396220',
                    'https://objkt.com/asset/hicetnunc/424348',
                    'https://objkt.com/asset/hicetnunc/447619',
                    'https://objkt.com/asset/hicetnunc/479680',
                ],
            ]);
            ?>

            <h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2023/blink'],
                    ['path' => '2021/fen']
                ];

                echo render_projects_list($projects, '../../');
            ?>

        </div>
        
        <wasm-loader></wasm-loader>
        <script type="module" src="main.js"></script>
	
<?php include("../../server/footer.php"); ?>
