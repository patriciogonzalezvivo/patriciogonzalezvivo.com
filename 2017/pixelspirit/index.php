<?php
    include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../server/header.php");
?>
<?php include("../../server/menu.php"); ?>

    <link rel="stylesheet" href="src/style.css" type="text/css" />

    <article class="item">
        <div class="item-image" style="width: 25%;">
            <img src="top/mayor_arcana.png" alt="<?php echo htmlspecialchars($meta['title'] ?? ''); ?>" />
            
        </div>
        <div class="item-info">
            <span class="item-title"><?php echo htmlspecialchars($meta['title'] ?? ''); ?></span>
            <span class="item-year"><?php echo htmlspecialchars($meta['year'] ?? ''); ?></span>
            <span class="item-medium"><?php echo htmlspecialchars($meta['medium'] ?? ''); ?></span>
            <p class="item-description"><?php echo htmlspecialchars($meta['description'] ?? ''); ?></p>
        </div>
    </article>

    <!-- <div id="shop" class="centering-panel"> -->
        <!-- <div class="centering-element" id='product-component-d9b6f93439a'></div> -->
    <!-- </div> -->

    <div id="longer-info">
        <?php
            include("../../server/ParsedownExtended.php");
            $Parsedown = new ParsedownExtended();
            echo $Parsedown->text(file_get_contents('README.md'));
        ?>

        <div class="cards" style="width: 100%; padding-bottom: 40%;">
            <div class="flip-container">
                <div class="flipper">
                    <div class="front"><img src="./imgs/cards/000-front.png" style="max-width: 100%;"></div>
                    <div class="back"><img src="./imgs/cards/000-back.png" style="max-width: 100%;"></div>
                </div>
            </div>
            <div class="flip-container">
                <div class="flipper">
                    <div class="front"><img src="./imgs/cards/001-front.png" style="max-width: 100%;"></div>
                    <div class="back"><img src="./imgs/cards/001-back.png" style="max-width: 100%;"></div>
                </div>
            </div>
            <div class="flip-container">
                <div class="flipper">
                    <div class="front"><img src="./imgs/cards/002-front.png" style="max-width: 100%;"></div>
                    <div class="back"><img src="./imgs/cards/002-back.png" style="max-width: 100%;"></div>
                </div>
            </div>
            <div class="flip-container">
                <div class="flipper">
                    <div class="front"><img src="./imgs/cards/003-front.png" style="max-width: 100%;"></div>
                    <div class="back"><img src="./imgs/cards/003-back.png" style="max-width: 100%;"></div>
                </div>
            </div>
        </div>

        <div class="cards" style="width: 73%; padding-bottom: 40%; margin: auto;">
            <div class="flip-container">
                <div class="flipper">
                    <div class="front"><img src="./imgs/cards/004-back.png" style="max-width: 100%;"></div>
                    <div class="back"><img src="./imgs/cards/004-front.png" style="max-width: 100%;"></div>
                </div>
            </div>
            <div class="flip-container">
                <div class="flipper">
                    <div class="front"><img src="./imgs/cards/008-back.png" style="max-width: 100%;"></div>
                    <div class="back"><img src="./imgs/cards/008-front.png" style="max-width: 100%;"></div>
                </div>
            </div>
            <div class="flip-container">
                <div class="flipper">
                    <div class="front"><img src="./imgs/cards/012-back.png" style="max-width: 100%;"></div>
                    <div class="back"><img src="./imgs/cards/012-front.png" style="max-width: 100%;"></div>
                </div>
            </div>
        </div>

        <?php include("../../server/slideSet.php"); echo slideset('images', 'width: 100%;'); ?>

        <h2>Related Works</h2>
        <?php
            $projects = [
                ['path' => '2026/astros'],
                ['path' => '2015/thebookofshaders', 'url' => 'http://thebookofshaders.com', 'title' => 'The Book of Shaders', 'year' => '2015', 'medium' => 'Interactive web / open-source textbook'],
            ];
            echo render_projects_list($projects, '../../');
        ?>
    </div>

    <script type="text/javascript" src="src/main.js"></script>

<?php include("../../server/footer.php"); ?>
