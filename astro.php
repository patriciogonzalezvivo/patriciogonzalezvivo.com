<?php
include("server/project_meta.php");

    $projects = [
        ['path' => '2026/astros'],
        ['path' => '2026/weaver2'],
        ['path' => '2019/hogar'],
        ['path' => '2018/estrellas'],
        ['path' => '2025/orbitas2', 'title' => 'Órbitas', 'year' => '2018'],
        ['path' => '2018/hypatia', 'url' => 'https://github.com/patriciogonzalezvivo/hypatia', 'title' => 'HYPATIA', 'year' => '2018', 'medium' => 'Geo-astronomical library'],
        ['path' => '2017/luna'],
    ];

set_random_og_image($projects);

include("server/header.php");
include("server/menu.php");
?>
    <section class="content">
<?php echo render_projects_list($projects); ?>
    </section>

<?php include("server/footer.php"); ?>
