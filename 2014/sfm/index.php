<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../parsedown/Parsedown.php");
			$Parsedown = new Parsedown();
			echo $Parsedown->text(file_get_contents('https://gist.githubusercontent.com/patriciogonzalezvivo/0cc2d0fb6e9af9040eff/raw/f0ecc1846499bf8d93c1d8b402f9ae5ef161c088/SFM.md'));
		?>

	</section>

<?php include("../../footer.php"); ?>
