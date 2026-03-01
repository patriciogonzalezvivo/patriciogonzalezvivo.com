<?php include("../../header.php");?>
<?php include("../../menu.php");?>

	<script src="https://fast.wistia.com/player.js" async></script>
	<script src="https://fast.wistia.com/embed/5nu91zr9q6.js" async type="module"></script>
	<style>wistia-player[media-id='5nu91zr9q6']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/5nu91zr9q6/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style> 
	<wistia-player media-id="5nu91zr9q6" aspect="1.7777777777777777"></wistia-player>
	
	<div class="item-info">
		<span class="item-title">Time Studies</span>
		<span class="item-year">2022</span>
		<span class="item-medium">Video Art</span>
	</div>

	<div id="longer-info">
		<?php
		include("../../parsedown/Parsedown.php");
		$Parsedown = new Parsedown();
		echo $Parsedown->text(file_get_contents('README.md'));
		?>
	</div>

<?php include("../../footer.php"); ?>
