
<?php include("../../header.php");?>
<?php include("../../menu.php");?>


<iframe title="vimeo-player" src="https://player.vimeo.com/video/15171352?h=2b8e0fde57" width="640" height="360" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" allowfullscreen></iframe>
	<!-- CONTENT -->
	<div id="longer-info">
		<?php
		include("../../parsedown/Parsedown.php");
		$Parsedown = new Parsedown();
		echo $Parsedown->text(file_get_contents ('README.md'));
		?>
	</div>

	<div id="longer-info">
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
	</div>

<?php include("../../footer.php"); ?>
