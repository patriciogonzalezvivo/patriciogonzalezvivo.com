<?php
	include("../../project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
	include("../../header.php");
	include("../../gallery.php");
?>
<?php include("../../menu.php");?>


	<!-- GALLERY -->
	<!-- <link rel="stylesheet" href="style.css"> -->
	
	<?php
		// Render the gallery using the helper function
		echo render_gallery([
			'images_dir' => 'images',
			'pattern' => '_DSF*.jpg',
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
        <h2 class="title"><?php echo $meta['title']; ?></h2>
        
		<?php
		include("../../parsedown/Parsedown.php");
		$Parsedown = new Parsedown();
		echo $Parsedown->text(file_get_contents ('README.md'));
		?>
        </div>

    <div id="longer-info">
		<h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2026/santos'],
					// ['path' => '2022/time'],
                    ['path' => '2014/skylines'],
                ];

                echo render_projects_list($projects, '../../');
            ?>
	</div>
<?php include("../../footer.php"); ?>
