<?php
include("project_meta.php");

    $projects = [
        ['path' => '2021/multiband', 'url' => 'https://web.archive.org/web/20211001235555/https://runwayml.com/blog/presenting-multiband-format', 'title' => 'MultiBand', 'year' => '2021', 'medium' => 'RunwayML'],
        ['path' => '2020/depth_estimation', 'url' => 'https://www.youtube.com/watch?v=5Tia2oblJAg', 'title' => 'Depth Estimation', 'year' => '2020'],
        ['path' => '2018/pointclouds', 'url' => 'https://vimeo.com/298427421/9eb2faf44e', 'title' => 'F8 PointCloud Demo', 'year' => '2018', 'medium' => 'Facebook'],
        ['path' => '2016/openFrame', 'title' => 'openFrame.io', 'year' => '2016', 'medium' => 'Shaders artwork'],
        ['path' => '2016/tron', 'url' => 'https://tangrams.github.io/tron-style/', 'title' => 'TRON2.0', 'year' => '2016'],
        ['path' => '2014/addidas', 'title' => 'Addidas #mizxflux', 'year' => '2014', 'medium' => 'HellicarAndLewis'],
        ['path' => '2014/atramentum', 'title' => 'Atramentum', 'year' => '2014', 'medium' => 'SCOPE / FakeLove.tv / Aerosyn-Lex'],
        ['path' => '2013/clouds', 'title' => 'CLOUDS Documentary', 'year' => '2013', 'medium' => 'Visual Systems'],
        ['path' => '2013/gearup', 'title' => 'GearUp', 'year' => '2013', 'medium' => 'MPI/PRI PetLab'],
        ['path' => '2012/megaphone', 'title' => 'Megaphone', 'year' => '2012', 'medium' => 'YESYESNO'],
        ['path' => '2012/picasso', 'title' => 'MultiTouch DrawingTool', 'year' => '2012', 'medium' => 'Picasso Museum, Coruña'],
        ['path' => '2012/galiciacanibal', 'title' => 'Galicia Canibal', 'year' => '2012', 'medium' => 'Interactive scenography'],
    ];

include("header.php");
include("menu.php");
?>
    <section class="content">
<?php
foreach ($projects as $project) {
    $commented = isset($project['commented']) && $project['commented'];

    if (isset($project['path'])) {
        $meta = get_project_meta($project['path']);

        if (isset($project['title'])) $meta['title'] = $project['title'];
        if (isset($project['year'])) $meta['year'] = $project['year'];
        if (isset($project['medium'])) $meta['medium'] = $project['medium'];
        if (isset($project['dimensions'])) $meta['dimensions'] = $project['dimensions'];
        if (isset($project['description'])) $meta['description'] = $project['description'];
        if (isset($project['url'])) $meta['url'] = $project['url'];
        if (isset($project['thumbnail'])) $meta['thumbnail'] = $project['thumbnail'];
    } else {
        $meta = [
            'title' => $project['title'] ?? '',
            'year' => $project['year'] ?? '',
            'medium' => $project['medium'] ?? '',
            'dimensions' => $project['dimensions'] ?? '',
            'description' => $project['description'] ?? '',
            'url' => $project['url'],
            'thumbnail' => $project['thumbnail'] ?? '',
        ];
    }

    echo render_project_item($meta, $commented);
}
?>
    </section>

<?php include("footer.php"); ?>
