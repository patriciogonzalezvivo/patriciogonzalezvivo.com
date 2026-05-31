<?php
    include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
    include("../../server/header.php");?>
        <?php include("../../server/menu.php");?>

         <div class="item-image">
			<script src="https://fast.wistia.com/player.js" async></script><script src="https://fast.wistia.com/embed/77gszchmvi.js" async type="module"></script><style>wistia-player[media-id='77gszchmvi']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/77gszchmvi/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style> <wistia-player media-id="77gszchmvi" aspect="1.7777777777777777"></wistia-player>
		</div>

        <div id="longer-info">
            <?php
            include("../../server/ParsedownExtended.php");
            $Parsedown = new ParsedownExtended();
            echo $Parsedown->text(file_get_contents('README.md'));
            ?>

            <h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2025/orbitas2'],
                    ['path' => '2026/astros'],
                    ['path' => '2018/estrellas'],
                    ['path' => '2019/hogar'],
                    ['path' => '2017/luna'],
                ];

                echo render_projects_list($projects, '../../');
            ?>
        </div>

<?php include("../../server/footer.php"); ?>
