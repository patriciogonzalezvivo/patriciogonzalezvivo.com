<?php
include("server/project_meta.php");

    $projects = [
        ['path' => '2026/santos'],
        ['path' => '2025/hybrids'],
        ['path' => '2025/gestures'],
        ['path' => '2025/memories'],
        ['path' => '2024/portraits'],
        ['path' => '2014/skylines'],
        ['path' => '2011/communitas'],
    ];

set_random_og_image($projects);

// Page metadata for search engines and link previews (server/seo.php, server/header.php)
$seo_kind = 'collection';
$page_title = 'Oil paintings and drawings';
$page_description = 'Oil paintings and plotter drawings by Patricio Gonzalez Vivo: portraits where a machine plots the structure of a face and the brush returns to it, again and again.';

include("server/header.php");
include("server/menu.php");
?>
    <section class="content">
<?php echo render_projects_list($projects); ?>
    </section>

<?php include("server/footer.php"); ?>
