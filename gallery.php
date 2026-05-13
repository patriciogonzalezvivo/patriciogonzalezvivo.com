<?php
/**
 * Gallery Helper Functions
 * 
 * Provides reusable functions for rendering art galleries with metadata stored
 * in individual .txt files for each artwork.
 * 
 * File structure:
 *   images/IMG_1234.jpeg           - Main image
 *   images/thumbnails/IMG_1234.jpeg - Thumbnail
 *   images/detail/IMG_1234.jpeg     - Detail shot (optional)
 *   images/installation/IMG_1234.jpeg - Installation shot (optional)
 *   images/IMG_1234.txt             - Metadata file
 * 
 * Metadata file format (key: value, one per line):
 *   title: Portrait of Jane
 *   year: 2025
 *   medium: Oil over cardboard
 *   dimensions: 16 x 12 inches
 *   sold: yes
 */

/**
 * Load artwork metadata from a .txt file
 * 
 * @param string $metadata_file Path to the metadata .txt file
 * @param array $defaults Default values to use if not specified
 * @return array Associative array with artwork metadata
 */
function load_artwork_metadata($metadata_file, $defaults = []) {
    $metadata = $defaults;
    
    if (!file_exists($metadata_file)) {
        return $metadata;
    }
    
    $lines = file($metadata_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        // Skip comments
        if (substr(trim($line), 0, 1) === '#') {
            continue;
        }
        
        // Parse key: value format
        $parts = explode(':', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = trim($parts[1]);
            
            // Convert sold to boolean
            if ($key === 'sold') {
                $value = in_array(strtolower($value), ['yes', 'true', '1', 'sold']);
            }
            
            $metadata[$key] = $value;
        }
    }
    
    return $metadata;
}

/**
 * Get all artwork files and their metadata from a directory
 * 
 * @param string $images_dir Directory containing the images (e.g., 'images')
 * @param string $pattern Glob pattern for main images (default: 'IMG_*.jpeg')
 * @param array $defaults Default metadata values
 * @return array Array of artwork data with metadata
 */
function get_gallery_artworks($images_dir = 'images', $pattern = 'IMG_*.{jpg,jpeg,png,gif}', $defaults = []) {
    $artworks = [];
    
    // Get all matching images
    $image_paths = glob($images_dir . '/' . $pattern, GLOB_BRACE);
    sort($image_paths);
    
    foreach ($image_paths as $image_path) {
        $filename = basename($image_path);
        $basename = pathinfo($filename, PATHINFO_FILENAME);
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        
        // Load metadata from .txt file
        $metadata_file = $images_dir . '/' . $basename . '.txt';
        $metadata = load_artwork_metadata($metadata_file, $defaults);
        
        // Check for additional image variants
        $artwork = [
            'filename' => $filename,
            'basename' => $basename,
            'main_image' => $image_path,
            'thumbnail' => file_exists($images_dir . '/thumbnails/' . $filename) 
                ? $images_dir . '/thumbnails/' . $filename 
                : $image_path,
            'detail' => file_exists($images_dir . '/detail/' . $filename) 
                ? $images_dir . '/detail/' . $filename 
                : null,
            'installation' => file_exists($images_dir . '/installation/' . $filename) 
                ? $images_dir . '/installation/' . $filename 
                : null,
            'metadata' => $metadata,
        ];
        
        $artworks[] = $artwork;
    }
    
    return $artworks;
}

/**
 * Render a gallery item HTML
 * 
 * @param array $artwork Artwork data array from get_gallery_artworks()
 * @return string HTML for the gallery item
 */
function render_gallery_item($artwork) {
    $meta = $artwork['metadata'];
    $is_sold = isset($meta['sold']) && $meta['sold'];
    
    $sold_class = $is_sold ? ' sold' : '';
    $sold_attr = $is_sold ? ' data-sold="true"' : '';
    
    // Prepare data attributes for fullscreen modal
    $data_attrs = [
        'data-full' => htmlspecialchars($artwork['main_image']),
    ];
    
    if ($artwork['detail']) {
        $data_attrs['data-detail'] = htmlspecialchars($artwork['detail']);
    }
    
    if ($artwork['installation']) {
        $data_attrs['data-installation'] = htmlspecialchars($artwork['installation']);
    }
    
    // Encode metadata for JavaScript
    $info_json = htmlspecialchars(json_encode($meta), ENT_QUOTES, 'UTF-8');
    $data_attrs['data-info'] = "'" . $info_json . "'";
    
    // Build HTML
    $html = '<div class="painting-item' . $sold_class . '"' . $sold_attr;
    $html .= ' data-id="' . htmlspecialchars($artwork['basename']) . '"';
    foreach ($data_attrs as $attr => $value) {
        if ($attr === 'data-info') {
            $html .= ' ' . $attr . '=' . $value;
        } else {
            $html .= ' ' . $attr . '="' . $value . '"';
        }
    }
    $html .= '>';
    
    // Thumbnail image
    $title = isset($meta['title']) ? htmlspecialchars($meta['title']) : 'Untitled';
    $html .= '<div class="painting-thumb-wrapper">';
    $html .= '<img src="' . htmlspecialchars($artwork['thumbnail']) . '" ';
    $html .= 'alt="' . $title . '" ';
    $html .= 'loading="lazy" ';
    $html .= 'class="painting-thumb">';
    $html .= '</div>';
    
    // Artwork info
    $html .= '<div class="artwork-info">';
    $html .= '<div class="artwork-title">' . $title . '</div>';
    
    if (isset($meta['year']) || isset($meta['medium'])) {
        $html .= '<div class="artwork-details">';
        $details = [];
        if (isset($meta['year'])) {
            $details[] = htmlspecialchars($meta['year']);
        }
        if (isset($meta['medium'])) {
            $details[] = htmlspecialchars($meta['medium']);
        }
        $html .= implode(' | ', $details);
        $html .= '</div>';
    }
    
    if (isset($meta['dimensions'])) {
        $html .= '<div class="artwork-size">' . htmlspecialchars($meta['dimensions']) . '</div>';
    }
    
    // Buy Print and Buy buttons
    $has_print = isset($meta['print']) && !empty($meta['print']);
    if ($has_print || !$is_sold) {
        $html .= '<div class="artwork-buttons">';
        if ($has_print) {
            $html .= '<a class="artwork-btn buy-print-btn" href="' . htmlspecialchars($meta['print']) . '" target="_blank" rel="noopener noreferrer">Buy Print</a>';
        }
        if (!$is_sold) {
            $title_val = isset($meta['title']) ? $meta['title'] : 'Untitled';
            $year_val = isset($meta['year']) ? $meta['year'] : '';
            $email_subject = 'Acquisition Inquiry: ' . $title_val . ($year_val ? ', ' . $year_val : '');

            // Build absolute image URL
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'];
            $script_dir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
            $image_url = $protocol . '://' . $host . $script_dir . '/' . $artwork['main_image'];

            $email_body  = "Hi Patricio,\n\n";
            $email_body .= "I'm interested in the piece ( " . $image_url . " ) and would like to inquire about its availability.\n\n";
            // $email_body .= "Could you please share further details regarding the work, including:\n\n";
            // $email_body .= "- Availability and pricing\n";
            // $email_body .= "- Framing options\n";
            // $email_body .= "- Shipping or delivery options\n\n";
            // $email_body .= "If there are additional works related to this piece or from the same series that you would recommend, I would be very interested in learning more.\n\n";
            // $email_body .= "Thank you for your time, and I look forward to your response.\n\n";
            // $email_body .= "Warm regards,";

            $email_href = 'mailto:patriciogonzalezvivo@gmail.com?subject=' . rawurlencode($email_subject) . '&body=' . rawurlencode($email_body);
            $html .= '<a class="artwork-btn buy-btn" href="' . $email_href . '">Acquire Original</a>';
        }
        $html .= '</div>';
    }
    
    // // Sold marker inside artwork-info
    // if ($is_sold) {
    //     $html .= '<div class="sold-marker"></div>';
    // }
    
    $html .= '</div>'; // .artwork-info
    $html .= '</div>'; // .painting-item
    
    return $html;
}

/**
 * Render a complete gallery
 * 
 * @param array $options Configuration options
 *   - images_dir: Directory containing images (default: 'images')
 *   - pattern: Glob pattern for images (default: 'IMG_*.{jpg,jpeg,png,gif}')
 *   - defaults: Default metadata values
 *   - show_modal: Whether to include fullscreen modal HTML (default: true)
 * @return string Complete gallery HTML
 */
function render_gallery($options = []) {
    // Default options
    $defaults = [
        'images_dir' => 'images',
        'pattern' => 'IMG_*.{jpg,jpeg,png,gif}',
        'defaults' => [
            'title' => 'Untitled',
            'year' => date('Y'),
            'medium' => 'Mixed Media',
            'dimensions' => '',
            'sold' => false,
        ],
        'show_modal' => true,
    ];
    
    $options = array_merge($defaults, $options);
    
    // Get artworks
    $artworks = get_gallery_artworks(
        $options['images_dir'],
        $options['pattern'],
        $options['defaults']
    );
    
    $html = '';
    
    // Render gallery items
    $html .= '<div class="paintings-gallery">' . "\n";
    
    foreach ($artworks as $artwork) {
        $html .= '    ' . render_gallery_item($artwork) . "\n";
    }
    
    $html .= '</div>' . "\n";
    
    // Render fullscreen modal if requested
    if ($options['show_modal']) {
        $html .= render_gallery_modal();
    }
    
    return $html;
}

/**
 * Render the fullscreen modal HTML
 * 
 * @return string Modal HTML
 */
function render_gallery_modal() {
    $html = <<<HTML

<!-- Fullscreen Modal -->
<div id="fullscreen-modal" class="fullscreen-modal">
    <span class="close-modal">&times;</span>
    <button class="nav-arrow nav-arrow-left" aria-label="Previous image">&#8249;</button>
    <button class="nav-arrow nav-arrow-right" aria-label="Next image">&#8250;</button>
    <div class="fullscreen-content">
        <img class="fullscreen-image" src="" alt="Artwork">
        <div class="fullscreen-info">
            <span class="fullscreen-title"></span>, <span class="fullscreen-year"></span>
            <span class="fullscreen-medium"></span>
            <span class="fullscreen-dimensions"></span>
            <div class="fullscreen-buttons">
                <a class="artwork-btn buy-print-btn fullscreen-buy-print" href="#" target="_blank" rel="noopener noreferrer" style="display:none;">Buy Print</a>
                <a class="artwork-btn buy-btn fullscreen-buy" href="#" style="display:none;">Acquire Original</a>
            </div>
        </div>
    </div>
    <!-- <div class="sold-marker-fullscreen"></div> -->
    <div class="fullscreen-nav">
        <button class="view-button" data-view="main">Main</button>
        <button class="view-button" data-view="detail" style="display:none;">Detail</button>
        <button class="view-button" data-view="installation" style="display:none;">Installation</button>
    </div>
</div>

HTML;
    
    return $html;
}

/**
 * Export metadata from hardcoded arrays to .txt files
 * This is a utility function to help migrate from the old format
 * 
 * @param array $artwork_info Array of artwork metadata (filename => metadata)
 * @param array $sold_images Array of sold image filenames
 * @param string $output_dir Directory to write .txt files (default: 'images')
 */
function export_metadata_to_files($artwork_info, $sold_images, $output_dir = 'images') {
    foreach ($artwork_info as $filename => $metadata) {
        $basename = pathinfo($filename, PATHINFO_FILENAME);
        $txt_file = $output_dir . '/' . $basename . '.txt';
        
        $content = '';
        if (isset($metadata['title'])) {
            $content .= 'title: ' . $metadata['title'] . "\n";
        }
        if (isset($metadata['year'])) {
            $content .= 'year: ' . $metadata['year'] . "\n";
        }
        if (isset($metadata['medium'])) {
            $content .= 'medium: ' . $metadata['medium'] . "\n";
        }
        if (isset($metadata['size'])) {
            $content .= 'dimensions: ' . $metadata['size'] . "\n";
        }
        if (isset($metadata['dimensions'])) {
            $content .= 'dimensions: ' . $metadata['dimensions'] . "\n";
        }
        
        // Check if it's sold
        if (in_array($filename, $sold_images)) {
            $content .= 'sold: yes' . "\n";
        }
        
        if (!empty($content)) {
            file_put_contents($txt_file, $content);
            echo "Exported: $txt_file\n";
        }
    }
}
?>
