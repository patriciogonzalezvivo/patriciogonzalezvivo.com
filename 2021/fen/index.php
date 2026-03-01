<?php
    include("../../project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../header.php");?>
	<?php include("../../menu.php");?>
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
            include("../../parsedown/Parsedown.php");
            $Parsedown = new Parsedown();
            echo $Parsedown->text(file_get_contents('README.md'));
            ?>
        </div>
	
<?php include("../../footer.php"); ?>
