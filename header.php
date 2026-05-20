<?php

// Default values - can be overridden by setting variables before including header.php
if (!isset($page_title)) $page_title = "Patricio Gonzalez Vivo";
if (!isset($page_author)) $page_author = "Patricio Gonzalez Vivo";
if (!isset($page_description)) $page_description = "Patricio Gonzalez Vivo multidisciplinary artist working across traditional and digital mediums. In his work, he pursues awareness and self-discovery through themes like celestial bodies, esoteric symbolism, clocks and maps.";
if (!isset($page_keywords)) $page_keywords = "digital, art, oil, painting, plotting, symbolism, astrology, tarot, clocks, lenses, alchemy, time and space";


// Open Graph defaults
if (!isset($og_site_name)) $og_site_name = "Patricio Gonzalez Vivo";
if (isset($page_title) && $page_title !== $og_site_name) {
	$page_title = $page_title . " - " . $og_site_name;
}
if (!isset($og_title)) $og_title = $page_title;
if (!isset($og_type)) $og_type = "website";
if (!isset($og_description)) $og_description = $page_description;
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

// Auto-detect thumbnail image if not set. og:image only supports static
// formats, so we restrict to THUMBNAIL_EXTS_STATIC and prefer the
// higher-resolution 'thumbnail.*' over 'thumb.*' for social previews.
if (!isset($og_image) && function_exists('find_thumbnail')) {
	$og_image = find_thumbnail('.', ['thumbnail', 'thumb'], THUMBNAIL_EXTS_STATIC);
}

// Resolve og_image to a local filesystem path for dimension lookup.
// $og_image may already be an absolute URL (e.g. set by set_random_og_image()),
// or a path relative to the current page's directory.
$og_image_local = null;
if (isset($og_image)) {
	if (substr($og_image, 0, 4) === 'http') {
		// Strip the site prefix to recover a local filesystem path.
		$_parsed_path = parse_url($og_image, PHP_URL_PATH);
		if ($_parsed_path) $og_image_local = ltrim($_parsed_path, '/');
	} else {
		$og_image_local = $og_image;
	}
}

// Auto-calculate image dimensions from the local file (works for both
// already-absolute URLs and relative paths).
if ($og_image_local && file_exists($og_image_local) && (!isset($og_image_width) || !isset($og_image_height))) {
	$image_info = getimagesize($og_image_local);
	if ($image_info !== false) {
		if (!isset($og_image_width)) $og_image_width = $image_info[0];
		if (!isset($og_image_height)) $og_image_height = $image_info[1];
	}
}

// Convert relative og_image paths to absolute URLs (required by Open Graph spec).
// REQUEST_URI may include a filename (e.g. /2026/santos/index.php) — strip it so
// the image URL resolves relative to the directory, not the file.
if (isset($og_image) && substr($og_image, 0, 4) !== 'http') {
	$request_uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
	$_dir_path = strtok($request_uri, '?');
	if ($_dir_path && pathinfo($_dir_path, PATHINFO_EXTENSION)) {
		$_dir_path = dirname($_dir_path);
	}
	$_dir_path = rtrim($_dir_path, '/') . '/';
	$og_image = 'https://patriciogonzalezvivo.com' . $_dir_path . ltrim($og_image, '/');
}

// Derive image MIME type for og:image:type (Facebook, Slack, Discord)
if (isset($og_image) && !isset($og_image_type)) {
	$_ext = strtolower(pathinfo(parse_url($og_image, PHP_URL_PATH), PATHINFO_EXTENSION));
	$_mime = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif', 'webp' => 'image/webp'];
	$og_image_type = $_mime[$_ext] ?? 'image/jpeg';
}

// Default alt text for og:image (accessibility + social previews)
if (isset($og_image) && !isset($og_image_alt)) $og_image_alt = $og_title;

// Twitter/X Card — set $twitter_handle = '@yourhandle' before including header.php
// Used as fallback by Bluesky, Discord, Slack, Telegram, WhatsApp, iMessage, LinkedIn
if (!isset($twitter_card)) $twitter_card = 'summary_large_image';
// $twitter_handle is intentionally unset by default; define it to emit twitter:site/creator

// theme-color — Discord embed accent, mobile Chrome/Safari, PWA manifest
if (!isset($theme_color)) $theme_color = '#000000';

// Optional properties (set before including header.php to override)
// $og_image        - path/URL to image (auto-detected from thumb.* if present)
// $og_image_type   - MIME type (auto-derived from extension)
// $og_image_alt    - alt text (defaults to page title)
// $og_url          - full URL to page (auto-generated from current path)
// $og_image_width  - image width in pixels (auto-calculated from local image)
// $og_image_height - image height in pixels (auto-calculated from local image)
// $twitter_handle  - Twitter/X handle e.g. '@yourhandle' (optional, enables twitter:site/creator)
// $theme_color     - hex color for theme-color meta (default '#000000')

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
		<meta name="theme-color" content="' . htmlspecialchars($theme_color) . '" />
		
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
if (isset($og_image_type)) {
	echo '
		<meta property="og:image:type" content="' . htmlspecialchars($og_image_type) . '" />';
}
if (isset($og_image_alt)) {
	echo '
		<meta property="og:image:alt" content="' . htmlspecialchars($og_image_alt) . '" />';
}

// Twitter/X · Bluesky · Discord · Slack · Telegram · WhatsApp · iMessage · LinkedIn
echo '
		<!-- Twitter / X · Bluesky · Discord · Slack Card -->
		<meta name="twitter:card" content="' . htmlspecialchars($twitter_card) . '" />
		<meta name="twitter:title" content="' . htmlspecialchars($og_title) . '" />
		<meta name="twitter:description" content="' . htmlspecialchars($og_description) . '" />';

if (isset($og_image)) {
	echo '
		<meta name="twitter:image" content="' . htmlspecialchars($og_image) . '" />';
}
if (isset($og_image_alt)) {
	echo '
		<meta name="twitter:image:alt" content="' . htmlspecialchars($og_image_alt) . '" />';
}
if (!empty($twitter_handle)) {
	echo '
		<meta name="twitter:site" content="' . htmlspecialchars($twitter_handle) . '" />
		<meta name="twitter:creator" content="' . htmlspecialchars($twitter_handle) . '" />';
}
if (isset($og_url)) {
	echo '
		<!-- Canonical URL -->
		<link rel="canonical" href="' . htmlspecialchars($og_url) . '" />';
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

$is_embed = isset($_GET['embed']) && $_GET['embed'] === '1';

if (!$is_embed) {
	echo '
		<script async src="https://www.googletagmanager.com/gtag/js?id=G-QT11DDJJFX"></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag("js", new Date());
			gtag("config", "G-QT11DDJJFX");
		</script>';
}

if ($is_embed) {
	echo '
		<style>
			html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
			.item-info, #longer-info, #menu, footer { display: none !important; }
			article.item { margin: 0 !important; padding: 0 !important; display: block !important; }
			.item-image { margin: 0 !important; padding: 0 !important; text-align: left !important; }
			body.windowed-mode #wrapper.windowed {
				position: relative !important;
				top: 0 !important;
				left: 0 !important;
				transform: none !important;
				margin: 0 !important;
			}
		</style>';
}

echo '
	</head>
	<body class="windowed-mode' . ($is_embed ? ' embed' : '') . '">
	';
?>
