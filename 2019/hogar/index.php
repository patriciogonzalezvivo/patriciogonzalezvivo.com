<?php include("../../header.php");?>

<script src="https://fast.wistia.com/player.js" async></script>
<script src="https://fast.wistia.com/embed/xw7vb7vgnn.js" async type="module"></script>
<style>wistia-player[media-id='xw7vb7vgnn']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/xw7vb7vgnn/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style> 	

<?php include("../../menu.php");?>


	<wistia-player media-id="xw7vb7vgnn" aspect="1.7777777777777777"></wistia-player>

	<div class="item-info">
		<span class="item-title">Hogar</span>
		<span class="item-year">2019</span>
		<span class="item-medium">Custom real-time software</span>
	</div>

	<div id="longer-info">
		<?php
		include("../../parsedown/Parsedown.php");
		$Parsedown = new Parsedown();
		echo $Parsedown->text(file_get_contents('README.md'));
		?>
	</div>

<?php include("../../footer.php"); ?>
