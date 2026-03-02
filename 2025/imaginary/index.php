<?php
	 include("../../project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
	include("../../header.php");
	include("../../gallery_helper.php");
?>
<?php include("../../menu.php");?>

	<!-- GALLERY -->
	<!-- <link rel="stylesheet" href="style.css"> -->
	
	<?php
		// Render the gallery using the helper function
		echo render_gallery([
			'images_dir' => 'images',
			'pattern' => 'IMG_*.jpeg',
			'defaults' => [
				'title' => 'Untitled',
				'year' => '2025',
				'medium' => 'Oil and Acrylic on canvas',
				'dimensions' => '16 x 12 inches',
				'sold' => false,
			],
		]);
	?>

	<div id="longer-info">
		<?php
		include("../../parsedown/Parsedown.php");
		$Parsedown = new Parsedown();
		echo $Parsedown->text(file_get_contents ('README.md'));
		?>

		<h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2025/hybrids'],
					['path' => '2026/astros'],
                    // ['path' => '2025/weaver', 'url' => 'https://patriciogonzalezvivo.github.io/weaver'],
                    ['path' => '2017/pixelspirit', 'url' => 'http://pixelspiritdeck.com/', 'title' => 'PixelSpirit', 'year' => '2017', 'medium' => 'Tarot Deck / Book', 'dimensions' => '78 Cards'],
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
