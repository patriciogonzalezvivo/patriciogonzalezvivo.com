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
                <div id="ui">
                    <a id="arcana-link" href="#" target="_blank" rel="noopener"></a>
                    <button id="resize-btn" tabindex="-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                    </button>
                </div>
            </div>
        </article>

        

        <?php
        $base_url = 'https://objkt.com/tokens/KT1CkDFaHiH8UtZhyR2EvoqhihsntjSikvt9/';
        $ref      = '?ref=tz1NqueFctvNCQrsELm6k4N6XfwAYu5Qp5LN';
        $arcanas = [
            ['roman' => '0',      'name' => 'Fool',          'fn' => 'fool',          'token' => 0],
            ['roman' => 'I',      'name' => 'Magician',      'fn' => 'magician',      'token' => 21],
            ['roman' => 'II',     'name' => 'Priestess',     'fn' => 'highPriestess', 'token' => 20],
            ['roman' => 'III',    'name' => 'Empress',       'fn' => 'empress',       'token' => 19],
            ['roman' => 'IV',     'name' => 'Emperor',       'fn' => 'emperator',     'token' => 18],
            ['roman' => 'V',      'name' => 'Hierophant',    'fn' => 'hierophant',    'token' => 17],
            ['roman' => 'VI',     'name' => 'Lovers',        'fn' => 'lovers',        'token' => 16],
            ['roman' => 'VII',    'name' => 'Chariot',       'fn' => 'chariot',       'token' => 15],
            ['roman' => 'VIII',   'name' => 'Strength',      'fn' => 'strength',      'token' => 14],
            ['roman' => 'IX',     'name' => 'Hermit',        'fn' => 'hermit',        'token' => 13],
            ['roman' => 'X',      'name' => 'Fortune',       'fn' => 'fortune',       'token' => 12],
            ['roman' => 'XI',     'name' => 'Justice',       'fn' => 'justice',       'token' => 11],
            ['roman' => 'XII',    'name' => 'Hanged Man',    'fn' => 'hanged',        'token' => 10],
            ['roman' => 'XIII',   'name' => 'Death',         'fn' => 'death',         'token' =>  9],
            ['roman' => 'XIV',    'name' => 'Temperance',    'fn' => 'temperance',    'token' =>  8],
            ['roman' => 'XV',     'name' => 'Devil',         'fn' => 'devil',         'token' =>  7],
            ['roman' => 'XVI',    'name' => 'Tower',         'fn' => 'tower',         'token' =>  6],
            ['roman' => 'XVII',   'name' => 'Star',          'fn' => 'star',          'token' =>  5],
            ['roman' => 'XVIII',  'name' => 'Moon',          'fn' => 'moon',          'token' =>  4],
            ['roman' => 'XIX',    'name' => 'Sun',           'fn' => 'sun',           'token' =>  3],
            ['roman' => 'XX',     'name' => 'Judgement',     'fn' => 'judgement',     'token' =>  2],
            ['roman' => 'XXI',    'name' => 'World',         'fn' => 'world',         'token' =>  1],
        ];
        ?>

            <div id="longer-info">
                
                
                <div id="arcana-carousel">
                    <?php foreach ($arcanas as $a): ?>
                    <button class="arcana-item<?php echo $a['fn'] === 'fool' ? ' active' : ''; ?>"
                            data-fn="<?php echo $a['fn']; ?>"
                            data-label="<?php echo htmlspecialchars($a['roman'] . ' — ' . $a['name']); ?>"
                            data-url="<?php echo $base_url . $a['token'] . $ref; ?>">
                        <span class="arcana-roman"><?php echo $a['roman']; ?></span>
                        <span class="arcana-name"><?php echo $a['name']; ?></span>
                    </button>
                    <?php endforeach; ?>
                </div>
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
