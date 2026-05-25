<?php
/**
 * Project Metadata Helper
 *
 * This file provides functions to read project metadata from text files
 * stored in each project folder (TITLE.txt, MEDIUM.txt, DESCRIPTION.txt, DIMENSIONS.txt)
 */

// Canonical thumbnail extension lists.
// THUMBNAIL_EXTS_ALL    — video/animated first, then static (for listing pages).
// THUMBNAIL_EXTS_STATIC — only formats valid for og:image and social previews.
const THUMBNAIL_EXTS_ALL    = ['webm', 'gif', 'webp', 'jpg', 'jpeg', 'png'];
const THUMBNAIL_EXTS_STATIC = ['webp', 'jpg', 'jpeg', 'png', 'gif'];

/**
 * Find the first existing thumbnail file in $dir.
 *
 * @param string $dir    Directory to search.
 * @param array  $kinds  Filename prefixes in priority order (e.g. ['thumbnail'] to require the higher-resolution variant).
 * @param array  $exts   Allowed extensions in priority order.
 * @return string|null   Filename (relative to $dir) or null when none found.
 */
function find_thumbnail($dir, $kinds = ['thumb', 'thumbnail'], $exts = THUMBNAIL_EXTS_ALL) {
    foreach ($kinds as $kind) {
        foreach ($exts as $ext) {
            $name = $kind . '.' . $ext;
            if (file_exists($dir . '/' . $name)) {
                return $name;
            }
        }
    }
    return null;
}

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
    $year_override = read_meta_file($full_path . '/YEAR.txt');
    if ($year_override) {
        $year = $year_override;
    }
    $title = read_meta_file($full_path . '/TITLE.txt');
    $medium = read_meta_file($full_path . '/MEDIUM.txt');
    $description = read_meta_file($full_path . '/DESCRIPTION.txt');
    $dimensions = read_meta_file($full_path . '/DIMENSIONS.txt');

    return array(
        'path' => $project_path,
        'year' => $year,
        'folder' => $folder,
        'title' => $title,
        'medium' => $medium,
        'description' => $description,
        'dimensions' => $dimensions,
        'thumb' => find_thumbnail($full_path),
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
    $year_override = read_meta_file($dir_path . '/YEAR.txt');
    if ($year_override) {
        $year = $year_override;
    }
    $title = read_meta_file($dir_path . '/TITLE.txt');
    $medium = read_meta_file($dir_path . '/MEDIUM.txt');
    $description = read_meta_file($dir_path . '/DESCRIPTION.txt');
    $dimensions = read_meta_file($dir_path . '/DIMENSIONS.txt');

    return array(
        'path' => $year . '/' . $folder,
        'year' => $year,
        'folder' => $folder,
        'title' => $title,
        'medium' => $medium,
        'description' => $description,
        'dimensions' => $dimensions,
        'thumb' => find_thumbnail($dir_path),
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
    // Normalise: empty strings instead of nulls so htmlspecialchars never
    // hits the PHP 8.1+ deprecation for null arguments.
    $title       = $meta['title']       ?? '';
    $year        = $meta['year']        ?? '';
    $medium      = $meta['medium']      ?? '';
    $dimensions  = $meta['dimensions']  ?? '';
    $path        = $meta['path']        ?? '';
    $thumb       = $meta['thumb']       ?? null;
    $thumbnail   = $meta['thumbnail']   ?? '';

    $html = $commented ? "        <!-- " : '';

    $html .= '<article class="item">' . "\n";
    $html .= '            <div class="item-image">' . "\n";

    // Use URL if provided, otherwise use path
    $link = !empty($meta['url']) ? $meta['url'] : $path . '/';
    $html .= '                <a href="' . htmlspecialchars($link) . '">';

    if ($thumb || $thumbnail !== '') {
        $thumb_src = $thumbnail !== ''
            ? htmlspecialchars($thumbnail)
            : htmlspecialchars($path) . '/' . htmlspecialchars($thumb);

        if ($thumb && str_ends_with($thumb, '.webm')) {
            $html .= '<video class="photoTh" autoplay loop muted playsinline loading="lazy">'
                   . '<source src="' . $thumb_src . '" type="video/webm">'
                   . '</video>';
        } else {
            $html .= '<img class="photoTh" loading="lazy" src="' . $thumb_src . '" alt="' . htmlspecialchars($title) . '"/>';
        }
    }

    $html .= '</a>' . "\n";
    $html .= '            </div>' . "\n";
    $html .= '            <div class="item-info">' . "\n";
    $html .= '                <span class="item-title">' . htmlspecialchars($title) . '</span>' . "\n";
    $html .= '                <span class="item-year">' . htmlspecialchars($year) . '</span>' . "\n";

    if ($medium !== '') {
        $html .= '                <span class="item-medium">' . htmlspecialchars($medium) . '</span>' . "\n";
    }
    if ($dimensions !== '') {
        $html .= '                <span class="item-dimensions">' . htmlspecialchars($dimensions) . '</span>' . "\n";
    }

    $html .= '            </div>' . "\n";
    $html .= '        </article>';

    if ($commented) $html .= " -->";

    return $html . "\n";
}

/**
 * Render a list of project entries as ``<article class="item">`` blocks.
 *
 * Each entry can be one of:
 *  - ``['path' => 'YEAR/folder', ...overrides]``  — local project; loads
 *    metadata from the folder and applies any provided overrides
 *    (``title``, ``year``, ``medium``, ``dimensions``, ``description``,
 *    ``url``, ``thumbnail``, ``commented``).
 *  - ``['title' => '...', 'url' => '...', ...]``  — external project; uses
 *    the provided values directly with no folder lookup.
 *
 * @param array  $projects    Array of project entries.
 * @param string $base_path   Path prefix to prepend when locating project
 *                            folders and building links. Use '' from root
 *                            listing pages, '../../' from a project page's
 *                            Related Works section.
 * @return string             Concatenated HTML.
 */
function render_projects_list($projects, $base_path = '') {
    $html = '';
    foreach ($projects as $project) {
        $commented = !empty($project['commented']);

        if (isset($project['path'])) {
            $meta = get_project_meta($project['path'], $base_path);
            // When rendered from inside a project page, paths need the
            // base prefix so the link resolves correctly.
            if ($base_path !== '') {
                $meta['path'] = $base_path . $meta['path'];
            }
            // Apply explicit overrides
            foreach (['title', 'year', 'medium', 'dimensions', 'description', 'url', 'thumbnail'] as $key) {
                if (isset($project[$key])) $meta[$key] = $project[$key];
            }
        } else {
            // External project without a local path - use provided values directly
            $meta = [
                'title'       => $project['title']       ?? '',
                'year'        => $project['year']        ?? '',
                'medium'      => $project['medium']      ?? '',
                'dimensions'  => $project['dimensions']  ?? '',
                'description' => $project['description'] ?? '',
                'url'         => $project['url']         ?? '',
                'thumbnail'   => $project['thumbnail']   ?? '',
                'thumb'       => null,
            ];
        }

        $html .= render_project_item($meta, $commented);
    }
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

/**
 * Pick a random project from a list and set $og_image to a full absolute URL.
 *
 * Call this BEFORE include("header.php") on any listing page (works, teaching,
 * tools, year index, site root) so the og:image meta tag shows a real thumbnail.
 *
 * @param array  $projects   Array of project entries (same format as works.php etc.)
 * @param string $root_path  Filesystem path to the site root used to locate thumbs.
 *                           Use '.' for root-level pages; pass $root_dir for year pages.
 */
function set_random_og_image($projects, $root_path = '.') {
    global $og_image;

    $candidates = [];

    foreach ($projects as $project) {
        // Skip entries without a local path or that are commented-out
        if (!isset($project['path'])) continue;
        if (!empty($project['commented'])) continue;

        // Prefer an explicitly provided static thumbnail override
        if (!empty($project['thumbnail'])) {
            $ext = strtolower(pathinfo($project['thumbnail'], PATHINFO_EXTENSION));
            if (in_array($ext, THUMBNAIL_EXTS_STATIC)) {
                $candidates[] = ltrim($project['thumbnail'], '/');
                continue;
            }
        }

        $proj_fs = rtrim($root_path, '/') . '/' . $project['path'];

        // big_thumbnail type: require the higher-resolution 'thumbnail.*' variant
        if (($project['type'] ?? '') === 'big_thumbnail') {
            $thumb = find_thumbnail($proj_fs, ['thumbnail'], THUMBNAIL_EXTS_STATIC);
            if ($thumb) $candidates[] = $project['path'] . '/' . $thumb;
            continue;
        }

        // Auto-detect from the project folder (static formats only for og:image)
        $thumb = find_thumbnail($proj_fs, ['thumb', 'thumbnail'], THUMBNAIL_EXTS_STATIC);
        if ($thumb) $candidates[] = $project['path'] . '/' . $thumb;
    }

    if (!empty($candidates)) {
        // Set as full absolute URL so header.php's path-prefix logic is bypassed
        $og_image = 'https://patriciogonzalezvivo.com/' . $candidates[array_rand($candidates)];
    }
}
?>
