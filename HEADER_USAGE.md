# Header.php Usage Guide

The `header.php` file has been generalized to support customizable metadata, Open Graph tags, Google Fonts, and Google Analytics.

## Default Values

If you don't set any variables, the header will use these defaults:
- **Title**: "Patricio Gonzalez Vivo"
- **Description**: "Patricio Gonzalez Vivo multidisciplinary artist..."
- **Keywords**: "digital, art, creative coding, shaders..."
- **Google Font**: Source Sans Pro (multiple weights)
- **Google Analytics**: G-W5MR6SK1EZ

## How to Customize

Define variables **before** including `header.php`:

```php
<?php
// Basic page info (required for custom pages)
$page_title = "My Project - Patricio Gonzalez Vivo";
$page_description = "Description of my project";
$page_keywords = "art, project, custom, keywords";

// That's it! The following are auto-generated:
// - $og_url (from current path)
// - $og_title (uses $page_title)  
// - $og_description (uses $page_description)
// - $og_image (from thumb.gif/jpg/png)
// - $og_image_width and $og_image_height (from image file)

include("../../header.php");
?>
```

### Advanced Customization (Optional)

```php
<?php
// Override specific OG properties if needed
$page_title = "My Project - Patricio Gonzalez Vivo";
$page_description = "Full description for the page";

// Override just the OG title for social sharing (keeps full title for browser)
$og_title = "My Project";  

// Override OG description if different from page description
$og_description = "Short description for social media";

// Override auto-detected URL (rarely needed)
$og_url = "https://patriciogonzalezvivo.com/custom-path/";

// Override auto-detected thumbnail
$og_image = "custom-image.jpg";

// Override auto-calculated dimensions
$og_image_width = "1200";
$og_image_height = "630";

// Optional: Customize Google Fonts
$google_fonts = "Roboto:300,400,700";
// Or as an array for multiple fonts:
$google_fonts = array("Roboto:300,400,700", "Playfair+Display:400,700");
// Or disable Google Fonts:
$google_fonts = false;

// Optional: Disable or change Google Analytics
$google_analytics_id = false;  // to disable
// or
$google_analytics_id = "G-YOUR-ID";  // to use different ID

include("../../header.php");
?>
```

## Auto-Detection Features

### Thumbnail Images
The header **automatically detects** thumbnail images in this order:
1. `thumb.gif`
2. `thumb.jpg`
3. `thumb.png`

If any of these files exist in the same directory, they'll be used for `$og_image` unless you explicitly set it.

### Image Dimensions
The header **automatically calculates** image dimensions using PHP's `getimagesize()` function. You only need to manually set `$og_image_width` and `$og_image_height` if you want to override the detected values or if the image file isn't accessible to PHP.

### Page URL
The header **automatically generates** the full URL (`$og_url`) from the current path using `$_SERVER['REQUEST_URI']`. For example, if your page is at `/2024/portraits/`, the `$og_url` will be automatically set to `https://patriciogonzalezvivo.com/2024/portraits/`.

### Unified Title and Description
By default:
- `$og_title` uses `$page_title` if not set separately
- `$og_description` uses `$page_description` if not set separately

This means you usually only need to set `$page_title` and `$page_description`, and they'll be used for both the page meta tags and Open Graph tags.

## Available Variables

### Required (have defaults)
- `$page_title` - Page title (appears in browser tab)
- `$page_description` - Meta description
- `$page_keywords` - Meta keywords
- `$page_author` - Author name

### Open Graph (optional but recommended)
- `$og_title` - Social media title (**auto-uses** $page_title)
- `$og_description` - Social media description (**auto-uses** $page_description)
- `$og_url` - Full URL to page (**auto-generated** from current path)
- `$og_image` - Path to social media image (**auto-detected** from thumb.gif/jpg/png)
- `$og_image_width` - Image width in pixels (**auto-calculated** from image)
- `$og_image_height` - Image height in pixels (**auto-calculated** from image)
- `$og_type` - Content type (default: "website")
- `$og_site_name` - Site name (default: "Patricio Gonzalez Vivo")
- `$og_locale` - Locale (default: "en_US")
- `$og_author` - Author (defaults to $page_author)

### Other
- `$google_fonts` - Google Fonts to load (string or array)
- `$google_analytics_id` - Google Analytics tracking ID

## Examples

### Minimal customization (everything auto-detected)
```php
<?php
// Just set title and description - everything else is automatic!
$page_title = "My Project - Patricio Gonzalez Vivo";
$page_description = "A unique art project exploring...";
// URL, thumbnail, and dimensions are all auto-detected
include("../../header.php");
?>
```

### With custom OG title (shorter for social media)
```php
<?php
$page_title = "My Amazing Project - Patricio Gonzalez Vivo";
$page_description = "A unique art project exploring...";
$og_title = "My Amazing Project";  // Shorter version for social sharing
// URL, thumbnail, and dimensions auto-detected
include("../../header.php");
?>
```

### Full customization example
```php
<?php
$page_title = "BLINK - Patricio Gonzalez Vivo";
$page_description = "Both memento mori and moment of delight";
$og_title = "BLINK";  // Custom short title
$og_site_name = "BLINK";  // Custom site name
$og_image = "custom-social-card.jpg";  // Override auto-detection
// URL and dimensions still auto-calculated
include("../../header.php");
?>
```

## Testing Open Graph Tags

Test how your page will appear on social media:
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/
