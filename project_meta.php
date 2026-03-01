<?php
/**
 * Project Metadata Helper
 * 
 * This file provides functions to read project metadata from text files
 * stored in each project folder (TITLE.txt, MEDIUM.txt, DESCRIPTION.txt, DIMENSIONS.txt)
 */

/**
 * Get project metadata from a project path
 * 
 * @param string $project_path Path to project (e.g., "2023/blink")
 * @param string $base_path Base path to prepend (default: current directory)
 * @return array Associative array with project metadata
 */
function get_project_meta($project_path, $base_path = '') {
    $full_path = $base_path . $project_path;
    
    // Extract year from path (first folder)
    $path_parts = explode('/', trim($project_path, '/'));
    $year = $path_parts[0];
    $folder = isset($path_parts[1]) ? $path_parts[1] : '';
    
    // Read metadata files
    $title = read_meta_file($full_path . '/TITLE.txt');
    $medium = read_meta_file($full_path . '/MEDIUM.txt');
    $description = read_meta_file($full_path . '/DESCRIPTION.txt');
    $dimensions = read_meta_file($full_path . '/DIMENSIONS.txt');
    
    // Auto-detect thumbnail
    $thumb = null;
    foreach (['thumb.gif', 'thumb.jpg', 'thumb.png'] as $img) {
        if (file_exists($full_path . '/' . $img)) {
            $thumb = $img;
            break;
        }
    }
    
    return array(
        'path' => $project_path,
        'year' => $year,
        'folder' => $folder,
        'title' => $title,
        'medium' => $medium,
        'description' => $description,
        'dimensions' => $dimensions,
        'thumb' => $thumb
    );
}

/**
 * Get project metadata from the current directory
 * Use this when you're inside a project's index.php
 * 
 * @param string $dir_path Path to read from (default: current directory)
 * @return array Associative array with project metadata
 */
function get_current_project_meta($dir_path = '.') {
    // Get the current working directory to extract year/folder
    $cwd = getcwd();
    $path_parts = explode('/', $cwd);
    
    // Get last two parts (year/folder)
    $folder = end($path_parts);
    $year = prev($path_parts);
    
    // Read metadata files from current directory
    $title = read_meta_file($dir_path . '/TITLE.txt');
    $medium = read_meta_file($dir_path . '/MEDIUM.txt');
    $description = read_meta_file($dir_path . '/DESCRIPTION.txt');
    $dimensions = read_meta_file($dir_path . '/DIMENSIONS.txt');
    
    // Auto-detect thumbnail
    $thumb = null;
    foreach (['thumb.gif', 'thumb.jpg', 'thumb.png'] as $img) {
        if (file_exists($dir_path . '/' . $img)) {
            $thumb = $img;
            break;
        }
    }
    
    return array(
        'path' => $year . '/' . $folder,
        'year' => $year,
        'folder' => $folder,
        'title' => $title,
        'medium' => $medium,
        'description' => $description,
        'dimensions' => $dimensions,
        'thumb' => $thumb
    );
}

/**
 * Read a metadata file and return its content (trimmed)
 * Returns null if file doesn't exist
 */
function read_meta_file($filepath) {
    if (file_exists($filepath)) {
        return trim(file_get_contents($filepath));
    }
    return null;
}

/**
 * Render a project item for the gallery/listing pages
 * 
 * @param array $meta Project metadata array from get_project_meta()
 * @param bool $commented Whether to wrap in HTML comments (default: false)
 */
function render_project_item($meta, $commented = false) {
    $html = '';
    
    if ($commented) {
        $html .= "        <!-- ";
    }
    
    $html .= '<article class="item">' . "\n";
    $html .= '            <div class="item-image">' . "\n";
    
    // Use URL if provided, otherwise use path
    $link = isset($meta['url']) && $meta['url'] ? $meta['url'] : $meta['path'] . '/';
    $html .= '                <a href="' . htmlspecialchars($link) . '">';
    
    if ($meta['thumb']) {
        // For thumbnail, always use path (even for external URLs)
        $thumb_src = isset($meta['thumbnail']) && $meta['thumbnail'] 
            ? $meta['thumbnail'] 
            : htmlspecialchars($meta['path']) . '/' . htmlspecialchars($meta['thumb']);
        $html .= '<img class="photoTh" src="' . $thumb_src . '" alt="' . htmlspecialchars($meta['title']) . '"/>';
    }
    
    $html .= '</a>' . "\n";
    $html .= '            </div>' . "\n";
    $html .= '            <div class="item-info">' . "\n";
    $html .= '                <span class="item-title">' . htmlspecialchars($meta['title']) . '</span>' . "\n";
    $html .= '                <span class="item-year">' . htmlspecialchars($meta['year']) . '</span>' . "\n";
    
    if ($meta['medium']) {
        $html .= '                <span class="item-medium">' . htmlspecialchars($meta['medium']) . '</span>' . "\n";
    }
    
    if ($meta['dimensions']) {
        $html .= '                <span class="item-dimensions">' . htmlspecialchars($meta['dimensions']) . '</span>' . "\n";
    }
    
    $html .= '            </div>' . "\n";
    $html .= '        </article>';
    
    if ($commented) {
        $html .= " -->";
    }
    
    $html .= "\n";
    
    return $html;
}

/**
 * Get list of all projects by scanning year directories
 * 
 * @param string $base_path Base path to scan (default: current directory)
 * @param array $excluded_folders Folders to exclude (like 'blog', 'css', etc.)
 * @return array Array of project paths
 */
function list_all_projects($base_path = '.', $excluded_folders = array('blog', 'css', 'js', 'images', 'parsedown')) {
    $projects = array();
    
    // Get all year directories (folders that start with 20xx)
    $year_dirs = glob($base_path . '/20*', GLOB_ONLYDIR);
    
    foreach ($year_dirs as $year_dir) {
        $year = basename($year_dir);
        
        // Get all project folders within the year
        $project_dirs = glob($year_dir . '/*', GLOB_ONLYDIR);
        
        foreach ($project_dirs as $project_dir) {
            $folder = basename($project_dir);
            
            // Skip excluded folders
            if (in_array($folder, $excluded_folders)) {
                continue;
            }
            
            // Check if it has metadata files
            if (file_exists($project_dir . '/TITLE.txt')) {
                $projects[] = $year . '/' . $folder;
            }
        }
    }
    
    // Sort by year/folder descending
    rsort($projects);
    
    return $projects;
}
?>
