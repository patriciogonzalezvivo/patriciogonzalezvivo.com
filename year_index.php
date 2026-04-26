<?php
/**
 * Year Index Template
 * 
 * Included by each year's index.php after setting $year_dir = __DIR__
 * Automatically scans the year folder for projects with TITLE.txt metadata.
 */

if (!isset($year_dir)) $year_dir = __DIR__;

$year = basename($year_dir);
$root_dir = dirname($year_dir);

$page_title = $year;

include($root_dir . "/project_meta.php");

// Scan the year folder for project subdirectories that have TITLE.txt
$projects = [];
foreach (glob($year_dir . '/*', GLOB_ONLYDIR) as $dir) {
    $folder = basename($dir);
    if (file_exists($dir . '/TITLE.txt')) {
        $projects[] = $folder;
    }
}

sort($projects);

// Build full-path entries for og:image selection, then set a random one
$_og_entries = array_map(fn($f) => ['path' => $year . '/' . $f], $projects);
set_random_og_image($_og_entries, $root_dir);

include($root_dir . "/header.php");
include($root_dir . "/menu.php");
?>
    <section class="content">
<?php
foreach ($projects as $folder) {
    $meta = get_project_meta($year . '/' . $folder, $root_dir . '/');
    // Use folder-only path so links are relative to this year's index page
    $meta['path'] = $folder;
    echo render_project_item($meta);
}

if (empty($projects)) {
    echo '        <p>No projects found for ' . htmlspecialchars($year) . '.</p>' . "\n";
}
?>
    </section>

<?php include($root_dir . "/footer.php"); ?>
