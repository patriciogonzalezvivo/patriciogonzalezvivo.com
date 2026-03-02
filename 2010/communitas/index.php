
<?php include("../../header.php");?>
<?php include("../../menu.php");?>


	<!-- <iframe title="vimeo-player" src="https://player.vimeo.com/video/15171352?h=2b8e0fde57" width="640" height="360" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" allowfullscreen></iframe> -->
	
	
	<script src="https://fast.wistia.com/player.js" async></script>
	<script src="https://fast.wistia.com/embed/3sl00cbq2s.js" async type="module"></script><style>wistia-player[media-id='3sl00cbq2s']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/3sl00cbq2s/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style> 
	<wistia-player media-id="3sl00cbq2s" aspect="1.7777777777777777"></wistia-player>
	
	<div id="longer-info">

		<?php
		include("../../parsedown/Parsedown.php");
		$Parsedown = new Parsedown();
		echo $Parsedown->text(file_get_contents ('README.md'));
		?>

		<article>
			<p>Communitas was develop for Interactivos 2010 at Espacio Fundación Telefónica</p>
			<a href="http://www.espacioft.org.ar/"><img src="sponsor.jpg" alt="sponsor"/></a>
		</article>
		
		<div id="myslides" class="photo">
			<img class="photo" src="images/01.jpg" alt="slide"/>
			<img class="photo" src="images/02.jpg" alt="slide"/>
			<img class="photo" src="images/03.jpg" alt="slide"/>
			<img class="photo" src="images/04.jpg" alt="slide"/>
			<img class="photo" src="images/05.jpg" alt="slide"/>
			<img class="photo" src="images/06.jpg" alt="slide"/>
			<img class="photo" src="images/07.jpg" alt="slide"/>
			<img class="photo" src="images/08.jpg" alt="slide"/>
			<img class="photo" src="images/09.jpg" alt="slide"/>
			<img class="photo" src="images/10.jpg" alt="slide"/>
		</div>

		<h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2026/astros'],
                    // ['path' => '2025/weaver', 'url' => 'https://patriciogonzalezvivo.github.io/weaver'],
                    ['path' => '2011/efectomariposa'],
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
