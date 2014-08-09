<?php include("../../../header.php");?>
<?php include("../../../menu.php");?>

		<section class="content">
			<?php
				include("../../../parsedown/Parsedown.php");
				$Parsedown = new Parsedown();
				echo $Parsedown->text(file_get_contents ('about.md'));
			?>	
		</section>

		<script src="/js/libs/three.js"></script>
		<script src="/js/libs/OrbitControls.js"></script>
		<script src="/js/libs/stats.min.js"></script>
		<script src="/js/libs/dat.gui.min.js"></script>
		<script src="/js/libs/dat.gui.min.js"></script>	
		<script src="/js/libs/potree.min.js"></script>
		<script src="pointcloud.js"></script>

		</div>

		<footer>
			<!-- <p>Copyright Patricio Gonzalez Vivo 2012</p> -->
		</footer>
	</body>
</html>

<?php include("../../footer.php"); ?>
