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
	</div>

<?php include("../../footer.php"); ?>
