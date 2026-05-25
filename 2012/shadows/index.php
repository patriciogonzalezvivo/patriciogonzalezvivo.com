<?php
    include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = implode('. ', array_filter([$meta['medium'], $meta['description']]));
    include("../../server/header.php");?>
<?php include("../../server/menu.php");?>


	<div id="longer-info">
        <h2 class="title"><?php echo $meta['title']; ?></h2>

		<script src="https://fast.wistia.com/player.js" async></script><script src="https://fast.wistia.com/embed/dj337xbmbs.js" async type="module"></script><style>wistia-player[media-id='dj337xbmbs']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/dj337xbmbs/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style> <wistia-player media-id="dj337xbmbs" aspect="1.7777777777777777"></wistia-player>

		<?php
		include("../../server/ParsedownExtended.php");
		$Parsedown = new ParsedownExtended();
		echo $Parsedown->text(file_get_contents ('README.md'));
		?>

		<!-- <iframe src="http://player.vimeo.com/video/41256563?autoplay=1" width="575" height="323" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe> -->


		<h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2010/communitas'],
                    ['path' => '2011/efectomariposa'],
                ];

                echo render_projects_list($projects, '../../');
            ?>
	</div>

	<!-- <section class="content">
		<div class="video-container">
			<iframe src="http://player.vimeo.com/video/41256563?autoplay=1" width="575" height="323" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
		</div>
		<article class="cita">
			<p>Some games require very few elements even just another person to play with.</p> 
			<p>Playing with shadows is one of the oldest pastimes we have. It is the ancestor of the TV, film and theater. The shadows of our hands can create fantastic worlds. We just need a light source and our imagination.</p>
		</article>
		
		<article>
			<p>Within our contemporary culture of play, we see the coexistence of our traditional games inheritance with cutting-edge technology. This rich encounter between the past and the “future” raises new and exciting questions about how we play and what kind of role playing has in our society.</p> 

			<p>The act of play can be seen through different theories and perspectives. Post-Freudian psychoanalysts see it not just as a potential medium for the unconscious to manifest but as a space with a unique nature between reality and fantasy where errors can be made without consequence and rules may be blend according to the imagination. This is an essential ability in order to think and explore different points of view and ways of looking at the world, which constitute the basic framework of democratic society. As such, for this project we focus on how we can see through the act of playing to discover cultural and social patterns and, at the same time, create a playground to explore new dynamics and ways of thinking.</p>

			<p>From this inquiry, “Mesa Del Tiempo” was originally designed for the <a href="http://museodeljuguetesi.org.ar/" target="_blank"> Museum of Toys, San Isidro </a>(Buenos Aires, Argentina) to develop new configurations of traditional games using cutting-edge technology. Each one of the different installations (Shadows, Kaleidoscope, Simon, and Oca, among others) proposes new models of play.</p>
		</article>
		
		<article>
			<p>The <strong>Shadow installation</strong> records and retains the shadows we make and then replay them in order to interact with a new audience. Each group can play with the shadows that other people made before while making new shadows to interact with the people to come.</p>
			<p>Shadows is specially designed to play with the concept of collective memory, tradition and cultural legacy.</p>
		</article>
		
		<article>
			<p>Special thanks to:</p>
			<p>- Art Director of the Museum: Daniela Pelegrinelli</p>	
			<p>- Iron Works: Juan Manuel Toconás.</p>
		</article>
		<div>
			<a href="http://museodeljuguetesi.org.ar/"><img src="sponsor.jpg" alt="sponsor"/></a>
		</div>
	</section> -->
	
<?php include("../../server/footer.php"); ?>
