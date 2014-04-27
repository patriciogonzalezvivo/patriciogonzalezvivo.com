<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

	<!-- CONTENT -->
	<section class="content">

		<?php
			include("../../parsedown/Parsedown.php");
			require_once __DIR__ . '/config.php';
			require_once __DIR__ . '/lib.php';
			// cache_text_files();

			if (!file_exists(__DIR__. '/cache/README.md')) {
  			cache_all();
			}

			$readme = file_get_contents( __DIR__. '/cache/README.md' );
			print $readme;

			$Parsedown = new Parsedown();
			echo $Parsedown->text($readme);
		?>

	</section>

<?php include("../../footer.php"); ?>
