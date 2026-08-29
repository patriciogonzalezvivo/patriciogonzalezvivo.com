<?php
    include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../server/header.php");?>
	<?php include("../../server/menu.php");?>
		<link rel="stylesheet" href="style.css">
		<script type="module" crossorigin src="./assets/index-53c6d30b.js"></script>

		<article class="item">
            <div class="item-image">
                <div id="wrapper">
					<canvas id="threejs"></canvas>
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

		<div id="longer-info">
            <?php
            include("../../server/ParsedownExtended.php");
            include("../../server/objkt.php");
            $Parsedown = new ParsedownExtended();
            // These hic et nunc tokens are video/mp4 with no image preview, so the
            // component uses each token's own artifact (a looping video) as the thumbnail.
            echo render_readme_with_objkt('README.md', $Parsedown, [
                'ref'    => 'tz1NqueFctvNCQrsELm6k4N6XfwAYu5Qp5LN',
                'tokens' => [
                    'https://objkt.com/asset/hicetnunc/50460',
                    'https://objkt.com/asset/hicetnunc/50457',
                    'https://objkt.com/asset/hicetnunc/50442',
                    'https://objkt.com/asset/hicetnunc/50433',
                ],
            ]);
            
            echo $Parsedown->text(file_get_contents ('DISPLAYS.md'));
            echo $Parsedown->text(file_get_contents ('FEN.md'));
            ?>

            <h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2023/blink'],
                    ['path' => '2021/memory']
                ];

                echo render_projects_list($projects, '../../');
            ?>
        
        </div>
	
<?php include("../../server/footer.php"); ?>
