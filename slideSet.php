<?php
/**
 * SlideSet Helper Functions
 * 
 * Provides reusable functions for rendering image slideshows that are animated
 * by js/slideSet.js.
 * 
 * File structure:
 *   images/01.jpg - Slide images
 *   images/02.jpg
 *   ...
 * 
 * Usage:
 *   <?php include('../../slideSet.php'); ?>
 *   
 *   Simple (defaults to 'images' directory):
 *   <?php echo slideset(); ?>
 *   
 *   With custom directory:
 *   <?php echo slideset('photos'); ?>
 *   
 *   With custom directory and inline styles:
 *   <?php echo slideset('images', 'width: 100%; height: 640px; object-fit: cover;'); ?>
 *   
 *   Advanced with all options:
 *   <?php echo render_slideset(['images_dir' => 'photos', 'pattern' => '*.png', 'img_style' => '...']); ?>
 */

/**
 * Get all slide images from a directory
 * 
 * @param string $images_dir Directory containing the images (e.g., 'images')
 * @param string $pattern Glob pattern for images (default: '*.{jpg,jpeg,png,gif}')
 * @return array Array of image paths sorted alphabetically
 */
function get_slide_images($images_dir = 'images', $pattern = '*.{jpg,jpeg,png,gif}') {
    $image_paths = glob($images_dir . '/' . $pattern, GLOB_BRACE);
    
    if (!$image_paths) {
        return [];
    }
    
    // Sort naturally to handle numbered files correctly (01, 02, 10, 11, etc.)
    natsort($image_paths);
    
    return array_values($image_paths);
}

/**
 * Render a slideSet HTML structure compatible with js/slideSet.js
 * 
 * @param array $options Configuration options
 *   - images_dir: Directory containing images (default: 'images')
 *   - pattern: Glob pattern for images (default: '*.{jpg,jpeg,png,gif}')
 *   - id: HTML id attribute (default: 'slideSet')
 *   - class: Additional CSS classes (default: 'photo')
 *   - img_class: CSS class for img tags (default: 'photo')
 *   - img_style: Inline style attribute for img tags (default: '')
 *   - div_style: Inline style attribute for the container div (default: '')
 *   - alt: Alt text for images (default: 'slide')
 * @return string Complete slideSet HTML
 */
function render_slideset($options = []) {
    // Default options
    $defaults = [
        'images_dir' => 'images',
        'pattern' => '*.{jpg,jpeg,png,gif}',
        'id' => 'slideSet',
        'class' => 'photo',
        'img_class' => 'photo',
        'img_style' => '',
        'div_style' => '',
        'alt' => 'slide',
    ];
    
    $options = array_merge($defaults, $options);
    
    // Get slide images
    $images = get_slide_images($options['images_dir'], $options['pattern']);
    
    if (empty($images)) {
        return '<!-- No images found in ' . htmlspecialchars($options['images_dir']) . ' -->';
    }
    
    // Build HTML
    $html = '<div id="' . htmlspecialchars($options['id']) . '" class="' . htmlspecialchars($options['class']) . '"';
    if (!empty($options['div_style'])) {
        $html .= ' style="' . htmlspecialchars($options['div_style']) . '"';
    }
    $html .= '>' . "\n";
    
    foreach ($images as $image) {
        $html .= '    <img class="' . htmlspecialchars($options['img_class']) . '" ';
        $html .= 'src="' . htmlspecialchars($image) . '" ';
        if (!empty($options['img_style'])) {
            $html .= 'style="' . htmlspecialchars($options['img_style']) . '" ';
        }
        $html .= 'alt="' . htmlspecialchars($options['alt']) . '"/>' . "\n";
    }
    
    $html .= '</div>' . "\n";
    
    return $html;
}

/**
 * Render a slideSet with manually specified images
 * Useful when you need more control over which images to include
 * 
 * @param array $images Array of image paths
 * @param array $options Configuration options (same as render_slideset)
 * @return string Complete slideSet HTML
 */
function render_slideset_manual($images, $options = []) {
    // Default options
    $defaults = [
        'id' => 'slideSet',
        'class' => 'photo',
        'img_class' => 'photo',
        'img_style' => '',
        'div_style' => '',
        'alt' => 'slide',
    ];
    
    $options = array_merge($defaults, $options);
    
    if (empty($images)) {
        return '<!-- No images provided -->';
    }
    
    // Build HTML
    $html = '<div id="' . htmlspecialchars($options['id']) . '" class="' . htmlspecialchars($options['class']) . '"';
    if (!empty($options['div_style'])) {
        $html .= ' style="' . htmlspecialchars($options['div_style']) . '"';
    }
    $html .= '>' . "\n";
    
    foreach ($images as $image) {
        $html .= '    <img class="' . htmlspecialchars($options['img_class']) . '" ';
        $html .= 'src="' . htmlspecialchars($image) . '" ';
        if (!empty($options['img_style'])) {
            $html .= 'style="' . htmlspecialchars($options['img_style']) . '" ';
        }
        $html .= 'alt="' . htmlspecialchars($options['alt']) . '"/>' . "\n";
    }
    
    $html .= '</div>' . "\n";
    
    return $html;
}

/**
 * Render slideSet with simpler parameters
 * Convenience function for common use cases
 * 
 * @param string $images_dir Directory containing images (default: 'images')
 * @param string $img_style Optional inline style for images (default: '')
 * @return string Complete slideSet HTML
 */
function slideset($images_dir = 'images', $img_style = '') {
    return render_slideset([
        'images_dir' => $images_dir,
        'img_style' => $img_style,
    ]);
}

/**
 * Output slideSet directly (echoes immediately)
 * Convenience function for simple cases
 * 
 * @param array $options Configuration options (same as render_slideset)
 */
function display_slideset($options = []) {
    echo render_slideset($options);
}
?>
