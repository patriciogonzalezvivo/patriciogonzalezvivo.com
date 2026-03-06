<?php 
include("project_meta.php");

$astros_meta = get_project_meta('2026/astros');
$imaginary_meta = get_project_meta('2025/imaginary');

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
        ['path' => '2022/time'],
        ['path' => '2021/memory'],
        ['path' => '2021/fen'],
    ];

include("header.php");
include("menu.php");
?>
    <link rel="stylesheet" href="2026/astros/style.css" type="text/css" />
    <!-- <section class="content"> -->

    <a href="2026/astros/">
    <article class="item is-active">
        <div class="item-image" style="width: 400px; filter: drop-shadow(10px 10px 10px #777)">
            <!-- <div id="wrapper" class="windowed">
                <img id="frame-back" class="frame" src="images/frame_background.png" alt="">
                    <canvas class='emscripten' id='canvas' oncontextmenu='event.preventDefault()' tabindex=-1></canvas>
                <img id="frame-front" class="frame" src="images/frame_refleccion.png" alt="">
            </div> -->
            <script src="https://fast.wistia.com/player.js" async></script>
            <script src="https://fast.wistia.com/embed/6elymy9yw4.js" async type="module"></script>
            <style>wistia-player[media-id='6elymy9yw4']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/6elymy9yw4/swatch'); display: block; filter: blur(5px); padding-top:100.0%; }</style>
            <wistia-player media-id="6elymy9yw4" aspect="1.0"></wistia-player>
        </div>
        <div class="item-info">
            <span class="item-title"><?php echo htmlspecialchars($astros_meta['title']); ?></span>
            <span class="item-year"><?php echo htmlspecialchars($astros_meta['year']); ?></span>
            <span class="item-medium"><?php echo htmlspecialchars($astros_meta['medium']); ?></span>
            <p class="item-description"><?php echo htmlspecialchars($astros_meta['description']); ?></p>
        </div>
    </article>
    </a>

    <a href="2025/imaginary/">
     <article class="item is-active" style="">
		<div class="item-image">
            <?php include("slideSet.php"); echo render_slideset(['images_dir' => '2025/imaginary/images', 'div_style' => 'width: 400px; filter: drop-shadow(10px 10px 10px #777);']); ?>
        </div>
        <div class="item-info" style="bottom: 0px;">
            <span class="item-title"><?php echo htmlspecialchars($imaginary_meta['title']); ?></span>
            <span class="item-year"><?php echo htmlspecialchars($imaginary_meta['year']); ?></span>
            <span class="item-medium"><?php echo htmlspecialchars($imaginary_meta['medium']); ?></span>
            <span class="item-dimensions"><?php echo htmlspecialchars($imaginary_meta['dimensions']); ?></span>
        </div>
    </article>
    </a>


    <!-- </section> -->

    <!-- <wasm-loader basepath="2026/astros/"></wasm-loader> -->
    <!-- <script type="module" src="2026/astros/main.js"></script> -->

<?php include("footer.php"); ?>
