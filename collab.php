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

set_random_og_image($projects);
include("header.php");
include("menu.php");
?>
    <section class="content">
<?php echo render_projects_list($projects); ?>
    </section>

<?php include("footer.php"); ?>
