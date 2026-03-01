<?php

// Default values - can be overridden by setting variables before including header.php
if (!isset($page_title)) $page_title = "Patricio Gonzalez Vivo";
if (!isset($page_description)) $page_description = "Patricio Gonzalez Vivo multidisciplinary artist working across traditional and digital mediums. In his work, he pursues awareness and self-discovery through themes like celestial bodies, esoteric symbolism, clocks and maps.";
if (!isset($page_keywords)) $page_keywords = "digital, art, creative coding, shaders, maps, clocks, lenses, alchemy, time and space";
if (!isset($page_author)) $page_author = "Patricio Gonzalez Vivo";

// Open Graph defaults
if (!isset($og_title)) $og_title = $page_title;
if (!isset($og_type)) $og_type = "website";
if (!isset($og_description)) $og_description = $page_description;

// if $page_title is set but $og_title is not set, default $og_title to $page_title
if (!isset($page_title ) && isset($og_site_name)) {
	$og_site_name = $page_title . " - " . "Patricio Gonzalez Vivo";
}
if (!isset($og_locale)) $og_locale = "en_US";
if (!isset($og_author)) $og_author = $page_author;

// Auto-generate og_url from current path if not set
if (!isset($og_url)) {
	$request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
	// Remove query string if present
	$path = strtok($request_uri, '?');
	// Ensure trailing slash for directories
	if ($path && substr($path, -1) !== '/' && !pathinfo($path, PATHINFO_EXTENSION)) {
		$path .= '/';
	}
	$og_url = "https://patriciogonzalezvivo.com" . $path;
}

// Auto-detect thumbnail image if not set
if (!isset($og_image)) {
	$possible_thumbs = array('thumb.gif', 'thumb.jpg', 'thumb.png');
	foreach ($possible_thumbs as $thumb) {
		if (file_exists($thumb)) {
			$og_image = $thumb;
			break;
		}
	}
}

// Auto-calculate image dimensions if image exists but dimensions not set
if (isset($og_image) && (!isset($og_image_width) || !isset($og_image_height))) {
	if (file_exists($og_image)) {
		$image_info = getimagesize($og_image);
		if ($image_info !== false) {
			if (!isset($og_image_width)) $og_image_width = $image_info[0];
			if (!isset($og_image_height)) $og_image_height = $image_info[1];
		}
	}
}

// Optional OG properties (only display if set)
// $og_image - path to image (auto-detected from thumb.gif/jpg/png if present)
// $og_url - full URL to page (auto-generated from current path)
// $og_image_width - image width in pixels (auto-calculated from image)
// $og_image_height - image height in pixels (auto-calculated from image)
// Note: $og_title defaults to $page_title, $og_description defaults to $page_description

// Google Fonts - can be array or string
if (!isset($google_fonts)) $google_fonts = "Source+Sans+Pro:200,300,400,600,200italic,300italic,400italic";

// main menu
echo '
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<title>' . htmlspecialchars($page_title) . '</title>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
		<meta name="keywords" content="' . htmlspecialchars($page_keywords) . '" />
		<meta name="description" content="' . htmlspecialchars($page_description) . '" />
		<meta name="author" content="' . htmlspecialchars($page_author) . '" />
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-capable" content="yes">
		
		<!-- Open Graph Meta Tags -->
		<meta property="og:title" content="' . htmlspecialchars($og_title) . '" />
		<meta property="og:type" content="' . htmlspecialchars($og_type) . '" />
		<meta property="og:site_name" content="' . htmlspecialchars($og_site_name) . '" />
		<meta property="og:locale" content="' . htmlspecialchars($og_locale) . '" />
		<meta property="og:author" content="' . htmlspecialchars($og_author) . '" />
		<meta property="og:description" content="' . htmlspecialchars($og_description) . '" />';

if (isset($og_image)) {
	echo '
		<meta property="og:image" content="' . htmlspecialchars($og_image) . '" />';
}
if (isset($og_url)) {
	echo '
		<meta property="og:url" content="' . htmlspecialchars($og_url) . '" />';
}
if (isset($og_image_width)) {
	echo '
		<meta property="og:image:width" content="' . htmlspecialchars($og_image_width) . '" />';
}
if (isset($og_image_height)) {
	echo '
		<meta property="og:image:height" content="' . htmlspecialchars($og_image_height) . '" />';
}

echo '

		<link href="/ico.gif" rel="shortcut icon"  />
		<link href="/css/style.css" rel="stylesheet" />';

// Google Fonts
if (is_array($google_fonts)) {
	foreach ($google_fonts as $font) {
		echo '
		<link href="https://fonts.googleapis.com/css?family=' . urlencode($font) . '" rel="stylesheet" type="text/css">';
	}
} else if ($google_fonts) {
	echo '
		<link href="https://fonts.googleapis.com/css?family=' . $google_fonts . '" rel="stylesheet" type="text/css">';
}

	echo '
		<script async src="https://www.googletagmanager.com/gtag/js?id=G-W5MR6SK1EZ"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag("js", new Date());
			gtag("config", "G-QT11DDJJFX");
		</script>';
echo '
	</head>
	<body class="windowed-mode">
	';
?>
