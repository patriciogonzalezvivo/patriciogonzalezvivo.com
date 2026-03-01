<?php include("../../header.php");?>
<?php include("../../menu.php");?>


	<!-- CONTENT -->
	
	<div id="longer-info">
		<?php
		include("../../parsedown/Parsedown.php");
		$Parsedown = new Parsedown();
		echo $Parsedown->text(file_get_contents('README.md'));
		?>
	</div>
		
	
<?php include("../../footer.php"); ?>
