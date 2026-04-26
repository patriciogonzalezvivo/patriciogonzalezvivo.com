<?php
include("project_meta.php");

    $projects = [
        ['path' => '2022/vera', 'url' => 'https://github.com/patriciogonzalezvivo/vera', 'title' => 'VERA', 'year' => '2022', 'medium' => 'C++/WASM GL Framework'],
        ['path' => '2021/lygia', 'url' => 'https://lygia.xyz', 'title' => 'LYGIA', 'year' => '2021', 'medium' => 'GLSL/HLSL/WGSL/WESL/METAL/CUDA Shader Library'],
        ['path' => '2020/hilma', 'url' => 'https://github.com/patriciogonzalezvivo/hilma', 'title' => 'HILMA', 'year' => '2020', 'medium' => '3D geometry library'],
        ['path' => '2020/ada', 'url' => 'https://github.com/patriciogonzalezvivo/ada', 'title' => 'ADA', 'year' => '2020', 'medium' => 'Cross-platform app library'],
        ['path' => '2020/midigyver', 'url' => 'https://github.com/patriciogonzalezvivo/midigyver', 'title' => 'MidiGyver', 'year' => '2020', 'medium' => 'MIDI swiss army knife', 'commented' => true],
        ['path' => '2020/openlidar', 'url' => 'https://github.com/patriciogonzalezvivo/OpenLiDAR', 'title' => 'OpenLiDAR', 'year' => '2020', 'medium' => 'DIY LiDAR scanner', 'commented' => true],
        ['path' => '2019/berthe', 'url' => 'https://github.com/patriciogonzalezvivo/berthe', 'title' => 'BERTHE', 'year' => '2018', 'medium' => 'Vector line library for plotters'],
        ['path' => '2018/hypatia', 'url' => 'https://github.com/patriciogonzalezvivo/hypatia', 'title' => 'HYPATIA', 'year' => '2018', 'medium' => 'Geo-astronomical library'],
        ['path' => '2016/glslEditor', 'url' => 'https://github.com/patriciogonzalezvivo/glslEditor', 'title' => 'glslEditor', 'year' => '2016', 'medium' => 'Web GLSL shader editor (WebGL/JS)'],
        ['path' => '2015/glslCanvas', 'url' => 'https://github.com/patriciogonzalezvivo/glslCanvas', 'title' => 'glslCanvas', 'year' => '2015', 'medium' => 'GLSL shaders on HTML Canvas (WebGL/JS)'],
        ['path' => '2015/glslViewer', 'url' => 'https://github.com/patriciogonzalezvivo/glslViewer/wiki', 'title' => 'glslViewer', 'year' => '2015', 'medium' => 'Live-coding shader tool (OpenGL ES/C++)'],
        ['path' => '2014/ofxBundler', 'url' => 'https://github.com/patriciogonzalezvivo/ofxBundler', 'title' => 'ofxBundler', 'year' => '2014', 'medium' => 'openFrameworks addon'],
        ['path' => '2014/ofxVectorTile', 'url' => 'https://github.com/patriciogonzalezvivo/ofxVectorTile', 'title' => 'ofxVectorTile', 'year' => '2014', 'medium' => 'openFrameworks addon'],
        ['path' => '2014/ofxStreetView', 'url' => 'https://github.com/patriciogonzalezvivo/ofxStreetView', 'title' => 'ofxStreetView', 'year' => '2014', 'medium' => 'openFrameworks addon'],
        ['path' => '2014/ofxPiTFT', 'url' => 'https://github.com/patriciogonzalezvivo/ofxPiTFT', 'title' => 'ofxPiTFT', 'year' => '2014', 'medium' => 'openFrameworks addon', 'commented' => true],
        ['path' => '2014/ofxThermalPrinter', 'url' => 'https://github.com/patriciogonzalezvivo/ofxThermalPrinter', 'title' => 'ofxThermalPrinter', 'year' => '2014', 'medium' => 'openFrameworks addon'],
        ['path' => '2014/vPlotter', 'url' => 'https://github.com/patriciogonzalezvivo/vPlotter', 'title' => 'vPlotter', 'year' => '2014', 'medium' => 'Wireless wall plotter (RaspberryPi)'],
        ['path' => '2014/ofxFluid', 'url' => 'https://github.com/patriciogonzalezvivo/ofxFluid', 'title' => 'ofxFluid', 'year' => '2013', 'medium' => 'GPU Fluid Simulator for openFrameworks'],
        ['path' => '2013/snode', 'url' => 'https://github.com/patriciogonzalezvivo/sNodes', 'title' => 'sNode', 'year' => '2013', 'medium' => 'GLSL shader prototyping tool (openFrameworks)'],
        ['path' => '2013/ofxvoro', 'url' => 'https://github.com/patriciogonzalezvivo/ofxvoro', 'title' => 'ofxVoro', 'year' => '2013', 'medium' => 'openFrameworks addon'],
        ['path' => '2013/ofxpulsesensor', 'url' => 'https://github.com/patriciogonzalezvivo/ofxpulsesensor', 'title' => 'ofxPulseSensor', 'year' => '2013', 'medium' => 'openFrameworks addon'],
        ['path' => '2012/ofplay', 'url' => 'https://github.com/patriciogonzalezvivo/ofplay', 'title' => 'ofPlay', 'year' => '2012', 'medium' => 'openFrameworks UI/UX addon'],
        ['path' => '2012/ofxinteractivesurface', 'url' => 'https://github.com/patriciogonzalezvivo/ofxinteractivesurface', 'title' => 'ofxInteractiveSurface', 'year' => '2012', 'medium' => 'openFrameworks addon'],
        ['path' => '2012/eden', 'title' => 'Eden 1.2', 'year' => '2012', 'medium' => 'GLSL atmosphere/biosphere simulator', 'commented' => true],
        ['path' => '2012/ofxcomposer', 'url' => 'https://github.com/patriciogonzalezvivo/ofxcomposer', 'title' => 'ofxComposer', 'year' => '2012', 'medium' => 'openFrameworks addon'],
        ['path' => '2011/ofxfx', 'url' => 'https://github.com/patriciogonzalezvivo/ofxfx', 'title' => 'ofxFX', 'year' => '2011', 'medium' => 'GLSL shaders addon for openFrameworks'],
        ['path' => '2011/kinectcorevision', 'url' => 'https://github.com/patriciogonzalezvivo/kinectcorevision', 'title' => 'Kinect Core Vision', 'year' => '2011', 'medium' => 'CCV + Kinect finger tracking'],
        ['path' => '2009/joyoflight', 'url' => 'https://github.com/patriciogonzalezvivo/joyoflight', 'title' => 'JoyOfLight', 'year' => '2009', 'medium' => 'iOS, OSX, Linux and Windows light drawing tool'],
    ];

set_random_og_image($projects);

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
