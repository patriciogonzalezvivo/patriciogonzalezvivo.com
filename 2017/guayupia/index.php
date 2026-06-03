<?php
    // Load project metadata from TITLE.txt, MEDIUM.txt, etc.
    include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    // Use metadata for page header
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../server/header.php");?>

        <?php include("../../server/menu.php");?>
        <link rel="stylesheet" href="style.css" type="text/css" />


        <article class="item">
			<div class="item-image">
				<div id="wrapper" class="windowed" style="width: 480px; height: 740px;">
					<iframe src="https://patriciogonzalezvivo.github.io/guayupia/#3/-25.01/-62.53" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
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

        <div id="longer-info">

            <?php
                include("../../server/ParsedownExtended.php");
                $Parsedown = new ParsedownExtended();
                echo $Parsedown->text(file_get_contents('README.md'));

                echo '<h2>Research Notes</h2>';
                echo $Parsedown->text(file_get_contents('NOTES.md'));
            ?>
            <h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2026/weaver2'],
                    ['path' => '2019/hogar'],
                    ['path' => '2018/estrellas'],
                    ['path' => '2011/efectomariposa'],
                ];

                echo render_projects_list($projects, '../../');
            ?>
        </div>
        
        <wasm-loader></wasm-loader>
        <script type="module" src="main.js"></script>
<?php include("../../server/footer.php"); ?>