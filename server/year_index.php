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

include($root_dir . "/server/project_meta.php");

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

require_once $root_dir . '/server/seo.php';
// Year page: name the projects in it (titles come from TITLE.txt), so search engines see what it holds.
$_titles = array_values(array_filter(array_map(fn($f) => read_meta_file($year_dir . '/' . $f . '/TITLE.txt'), $projects)));
$seo_kind = 'collection';
$page_title = 'Work from ' . $year;
if ($_titles) {
    $page_description = seo_truncate('Work by Patricio Gonzalez Vivo from ' . $year . ': ' . implode(', ', array_slice($_titles, 0, 8)) . (count($_titles) > 8 ? ' and more.' : '.'), 160);
} else {
    $page_description = 'Projects by Patricio Gonzalez Vivo from ' . $year . ': art, software and experiments in oil paint, code and drawing machines.';
}

include($root_dir . "/server/header.php");
include($root_dir . "/server/menu.php");
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

<?php include($root_dir . "/server/footer.php"); ?>
