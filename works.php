<?php 
include("project_meta.php");

    // Array of projects with their configuration
    // Each entry can have:
    //  - 'path': folder path for local projects (will load metadata from TITLE.txt, MEDIUM.txt, etc.)
    //  - 'url': custom URL (for external sites or overriding the default path URL)
    //  - 'thumbnail': custom thumbnail URL (overrides auto-detected thumb)
    //  - 'commented': true to render as HTML comment
    // For external projects without local metadata, add 'title', 'year', 'medium', 'dimensions' directly
    $projects = [
        ['path' => '2026/astros'],
        ['path' => '2025/imaginary'],
        ['path' => '2025/hybrids'],
        // ['path' => '2025/weaver', 'url' => 'https://patriciogonzalezvivo.github.io/weaver'],
        ['path' => '2023/blink'],
        ['path' => '2022/time'],
        ['path' => '2021/memory'],
        ['path' => '2021/fen'],
        ['path' => '2019/hogar'],
        ['path' => '2018/estrellas'],
        ['path' => '2025/orbitas2', 'title' => 'Órbitas', 'year' => '2018'],
        ['path' => '2017/pixelspirit', 'url' => 'http://pixelspiritdeck.com/', 'title' => 'PixelSpirit', 'year' => '2017', 'medium' => 'Tarot Deck / Book', 'dimensions' => '78 Cards'],
        ['path' => '2017/luna'],
        ['path' => '2015/thebookofshaders', 'url' => 'http://thebookofshaders.com/', 'title' => 'The Book of Shaders', 'year' => '2015', 'medium' => 'Book'],
        ['path' => '2014/skylines'],
        // ['path' => '2014/pointcloudcity', 'title' => 'Point Cloud City', 'year' => '2014', 'medium' => 'Data Visualization'],
        // ['path' => '2013/clouds', 'url' => 'https://cloudsdocumentary.com', 'title' => 'CLOUDS Documentary', 'year' => '2013', 'medium' => 'Documentary / Interactive'],
        // ['path' => '2012/codemology', 'title' => 'Codemology', 'year' => '2012', 'medium' => 'Custom real-time software'],
        // ['path' => '2012/flatland', 'title' => 'FlatLand', 'year' => '2012', 'medium' => 'Custom software'],
        ['path' => '2011/efectomariposa'],
        // ['path' => '2011/liquidkinect', 'url' => 'https://vimeo.com/19198053', 'title' => 'Liquid Kinect', 'year' => '2011', 'medium' => 'Custom real-time software'],
        ['path' => '2010/communitas'],
    ];

include("header.php");
include("menu.php");
?>
    <section class="content">
<?php
foreach ($projects as $project) {
    $commented = isset($project['commented']) && $project['commented'];
    
    // Load metadata for projects with a path
    if (isset($project['path'])) {
        $meta = get_project_meta($project['path']);
        
        // Override with explicitly provided values
        if (isset($project['title'])) $meta['title'] = $project['title'];
        if (isset($project['year'])) $meta['year'] = $project['year'];
        if (isset($project['medium'])) $meta['medium'] = $project['medium'];
        if (isset($project['dimensions'])) $meta['dimensions'] = $project['dimensions'];
        if (isset($project['description'])) $meta['description'] = $project['description'];
        if (isset($project['url'])) $meta['url'] = $project['url'];
        if (isset($project['thumbnail'])) $meta['thumbnail'] = $project['thumbnail'];
    } else {
        // External project without local path - use provided metadata
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
    
    // Render the item
    echo render_project_item($meta, $commented);
}
?>
    </section>

<?php include("footer.php"); ?>
