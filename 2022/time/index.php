<?php
    include("../../project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../header.php");?>
	<?php include("../../menu.php");?>

	<script src="https://fast.wistia.com/player.js" async></script>
	<script src="https://fast.wistia.com/embed/5nu91zr9q6.js" async type="module"></script>
	<style>wistia-player[media-id='5nu91zr9q6']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/5nu91zr9q6/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style> 
	<wistia-player media-id="5nu91zr9q6" aspect="1.7777777777777777"></wistia-player>
	
	<div class="item-info">
		<span class="item-title"><?php echo htmlspecialchars($meta['title']); ?></span>
		<span class="item-year"><?php echo htmlspecialchars($meta['year']); ?></span>
		<span class="item-medium"><?php echo htmlspecialchars($meta['medium']); ?></span>
		<span class="item-dimensions"><?php echo htmlspecialchars($meta['dimensions']); ?></span>
		<p class="item-description"><?php echo htmlspecialchars($meta['description']); ?></p>
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
                    ['path' => '2025/hybrids'],
                    ['path' => '2014/skylines'],
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

<?php include("../../footer.php"); ?>
