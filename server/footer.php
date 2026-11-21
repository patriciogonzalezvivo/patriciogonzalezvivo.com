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
			<p>© Patricio Gonzalez Vivo ' . date('Y') . '. All rights reserved. Not licensed for AI training or for generating work in my name or style.</p>
		</footer>
	</body>
</html>
	';
?>
