<?php
	if (isset($_GET['embed']) && $_GET['embed'] === '1') { return; }
	// main menu
	echo '	
		<div id="menu">
			<div id="menu_header">
				<a id="menu_logo" href="/index.php"><img id="menu_logo_img" src="/images/menu_logo.png" alt="Tree Logo" /></a>
				<a id="menu_logo" href="/index.php"><span id="menu_name">PATRICIO GONZALEZ VIVO</span></a>
				<nav id="menu_text">
					<ul>
						<li class="menu_item"><a href="/works.php"> Archive </a></li>
						<li class="menu_item"><a href="https://shop.patriciogonzalezvivo.com/"> Shop </a></li>
						<li class="menu_item"><a href="/about.php"> About </a></li>
						<li class="menu_item"><a href="http://www.instagram.com/patriciogonzalezvivo" target="_blank"><img src="/images/icons/instagram.png" width="32"/></a></li>
					</ul>
				</nav>
			</div>
		</div>';?>