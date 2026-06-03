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
            <img src="imgs/mayor_arcana.png" alt="<?php echo htmlspecialchars($meta['title'] ?? ''); ?>" />
            
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
