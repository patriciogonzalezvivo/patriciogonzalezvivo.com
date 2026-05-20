
<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../project_meta.php");?>


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

        <?php include("../../slideSet.php"); echo slideset(); ?>

		<article>
			<p>Communitas was develop for Interactivos 2010 at Espacio Fundación Telefónica</p>
			<a href="http://www.espacioft.org.ar/"><img src="sponsor.jpg" alt="sponsor"/></a>
		</article>

		<h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2026/astros'],
                    // ['path' => '2025/weaver', 'url' => 'https://patriciogonzalezvivo.github.io/weaver'],
                    ['path' => '2011/efectomariposa'],
                ];

                echo render_projects_list($projects, '../../');
            ?>
	</div>

<?php include("../../footer.php"); ?>
