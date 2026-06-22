<?php
    include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../server/header.php");?>
    <?php include("../../server/menu.php");?>
        <link rel="stylesheet" href="./style.css" type="text/css" />

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

        <?php
        $arcanas = [
            ['roman' => '0',      'name' => 'Fool',        'fn' => 'fool'],
            ['roman' => 'I',      'name' => 'Magician',    'fn' => 'magician'],
            ['roman' => 'II',     'name' => 'Priestess',   'fn' => 'highPriestess'],
            ['roman' => 'III',    'name' => 'Empress',     'fn' => 'empress'],
            ['roman' => 'IV',     'name' => 'Emperor',     'fn' => 'emperator'],
            ['roman' => 'V',      'name' => 'Hierophant',  'fn' => 'hierophant'],
            ['roman' => 'VI',     'name' => 'Lovers',      'fn' => 'lovers'],
            ['roman' => 'VII',    'name' => 'Chariot',     'fn' => 'chariot'],
            ['roman' => 'VIII',   'name' => 'Strength',    'fn' => 'strength'],
            ['roman' => 'IX',     'name' => 'Hermit',      'fn' => 'hermit'],
            ['roman' => 'X',      'name' => 'Fortune',     'fn' => 'fortune'],
            ['roman' => 'XI',     'name' => 'Justice',     'fn' => 'justice'],
            ['roman' => 'XII',    'name' => 'Hanged Man',  'fn' => 'hanged'],
            ['roman' => 'XIII',   'name' => 'Death',       'fn' => 'death'],
            ['roman' => 'XIV',    'name' => 'Temperance',  'fn' => 'temperance'],
            ['roman' => 'XV',     'name' => 'Devil',       'fn' => 'devil'],
            ['roman' => 'XVI',    'name' => 'Tower',       'fn' => 'tower'],
            ['roman' => 'XVII',   'name' => 'Star',        'fn' => 'star'],
            ['roman' => 'XVIII',  'name' => 'Moon',        'fn' => 'moon'],
            ['roman' => 'XIX',    'name' => 'Sun',         'fn' => 'sun'],
            ['roman' => 'XX',     'name' => 'Judgement',   'fn' => 'judgement'],
            ['roman' => 'XXI',    'name' => 'World',       'fn' => 'world'],
        ];
        ?>
        <div id="arcana-carousel">
            <?php foreach ($arcanas as $a): ?>
            <button class="arcana-item<?php echo $a['fn'] === 'fool' ? ' active' : ''; ?>" data-fn="<?php echo $a['fn']; ?>">
                <span class="arcana-roman"><?php echo $a['roman']; ?></span>
                <span class="arcana-name"><?php echo $a['name']; ?></span>
            </button>
            <?php endforeach; ?>
        </div>

        <div id="longer-info">
            <?php
            include("../../server/ParsedownExtended.php");
            $Parsedown = new ParsedownExtended();
            echo $Parsedown->text(file_get_contents('README.md'));
            ?>

            <h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2023/blink'],
                    ['path' => '2017/pixelspirit']
                ];

                echo render_projects_list($projects, '../../');
            ?>

        </div>

        <wasm-loader></wasm-loader>
        <script type="module" src="/2021/arcana/main.js"></script>

<?php include("../../server/footer.php"); ?>
