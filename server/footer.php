<?php
// main footer

if (isset($_GET['embed']) && $_GET['embed'] === '1') {
	echo '</body></html>';
	return;
}

echo '
		<script type="text/javascript" src="/js/slideSet.js" defer></script>
		<script type="text/javascript" src="/js/gallery.js" defer></script>

		<footer>
			<p>© Patricio Gonzalez Vivo 2026</p>
		</footer>
	</body>
</html>
	';
?>
