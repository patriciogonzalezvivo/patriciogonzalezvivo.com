<?php
	 include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $page_title = $meta['title'];
    $page_description = $meta['description'];
	include("../../server/header.php");
	include("../../server/gallery.php");
?>
<?php include("../../server/menu.php");?>

    <article class="item medium-hero">
        <div class="item-image" style="width:min(384px, 100%);">
            <iframe id="hero-frame" src="thumb/index.html" title="me_005" allowfullscreen
                    style="display:block; width:100%; aspect-ratio:3/4; border:0; background:#fff; pointer-events:none;"></iframe>
        </div>
        <div class="item-info">
            <span class="item-title"><?php echo htmlspecialchars($meta['title'] ?? ''); ?></span>
            <span class="item-year"><?php echo htmlspecialchars($meta['year'] ?? ''); ?></span>
            <span class="item-medium"><?php echo htmlspecialchars($meta['medium'] ?? ''); ?></span>
            <?php if (!empty($meta['dimensions'])): ?>
                <span class="item-dimensions"><?php echo htmlspecialchars($meta['dimensions']); ?></span>
            <?php endif; ?>
            <!-- <p class="item-description"><?php echo htmlspecialchars($meta['description'] ?? ''); ?></p> -->
        </div>
    </article>
    <script>
        // The embedded piece captures wheel/touch events, which traps page scroll.
        // Keep it inert until the user clicks it; release again when the pointer leaves.
        (function () {
            var hero = document.querySelector('.medium-hero .item-image');
            var frame = document.getElementById('hero-frame');
            hero.addEventListener('click', function () { frame.style.pointerEvents = 'auto'; });
            hero.addEventListener('mouseleave', function () { frame.style.pointerEvents = 'none'; });
            document.addEventListener('touchstart', function (e) {
                if (!hero.contains(e.target)) frame.style.pointerEvents = 'none';
            }, { passive: true });
        })();
    </script>

	<div id="longer-info">
		<?php
		include("../../server/ParsedownExtended.php");
		$Parsedown = new ParsedownExtended();
		echo $Parsedown->text(file_get_contents ('README.md'));
		?>
    </div>

    <!-- add a new line across the page -->
    <div id="longer-info">
        <hr>
        <p>.</p>
    </div>

    <?php
        // Each study is a minted edition: mint/medium_nNN.html (loads the piece from IPFS)
        // plus mint/medium_nNN.gif (looping preview). The HTML carries its folder CID;
        // mint/cids.json maps asset -> CID, so the CID tells us which painting it pairs with
        // (paintings/<asset>[_fit].jpg). The "_fit" suffix is ignored when matching.
        $cids = json_decode(@file_get_contents('mint/cids.json'), true) ?: [];
        $mint_index = json_decode(@file_get_contents('mint/index.json'), true) ?: [];
        $asset_by_cid = array_flip(array_filter($cids));
        // Each edition is live on Transient; tokens.json maps edition number -> token ID.
        $tokens = json_decode(@file_get_contents('tokens.json'), true) ?: [];
        $studies = [];
        foreach (glob('mint/medium_n*.html') as $html) {
            $gif = preg_replace('/\.html$/', '.gif', $html);
            $src = file_get_contents($html);
            if (!file_exists($gif) || !preg_match('/const ARTWORK_CID = "([^"]+)"/', $src, $m) || !isset($asset_by_cid[$m[1]])) continue;
            $asset = $asset_by_cid[$m[1]];
            $n = (int) preg_replace('/\D/', '', basename($html, '.html'));
            $token = $tokens['tokens'][$n] ?? null;
            $transient = $token ? str_replace(['{contract}', '{token}'], [$tokens['contract'], $token], $tokens['url']) : '';
            $studies[preg_replace('/_fit$/', '', $asset)] = [
                'html' => $html, 'gif' => $gif, 'asset' => $asset,
                'title' => sprintf('Medium Study No. %02d', $n),  // same title as the minted token
                'href' => $transient ?: $html,                    // fall back to the IPFS-backed page
                'source' => $mint_index[$asset]['source'] ?? '',
            ];
        }
        $paintings = get_gallery_artworks('paintings', '*.{jpg,JPG,jpeg,png}', [
            'title' => 'Untitled',
            'year' => '2025',
            'medium' => 'Oil and Acrylic on canvas',
            'dimensions' => '16 x 12 inches',
            'sold' => false,
        ]);
    ?>
    <div class="paintings-gallery medium-pairs-gallery">
        <?php foreach ($paintings as $artwork):
            $key = preg_replace('/_fit$/', '', $artwork['basename']);
            $study = $studies[$key] ?? null;
        ?>
        <div class="medium-pair">
            <?php echo render_gallery_item($artwork); ?>
            <?php if ($study):
                // The modal shows the still render in images/ that matches this study
                // (named after its original sandbox); the GIF is the fallback.
                $still = $study['source'] ? glob('images/' . $study['source'] . '_t*_2480x3508.jpg') : [];
                $study_title = $study['title'];
                $info = json_encode(['title' => $study_title, 'year' => '2026', 'medium' => 'Digital sandbox']);
            ?>
            <div class="painting-item medium-study" data-id="<?php echo htmlspecialchars($study['asset']); ?>"
                 data-href="<?php echo htmlspecialchars($study['href']); ?>"
                 data-full="<?php echo htmlspecialchars($still ? $still[0] : $study['gif']); ?>"
                 data-info='<?php echo htmlspecialchars($info, ENT_QUOTES, 'UTF-8'); ?>'>
                <div class="painting-thumb-wrapper">
                    <img class="painting-thumb" src="<?php echo htmlspecialchars($study['gif']); ?>" alt="<?php echo htmlspecialchars($study_title); ?>" loading="lazy">
                </div>
                <div class="artwork-info">
                    <div class="artwork-title"><?php echo htmlspecialchars($study_title); ?></div>
                    <div class="artwork-details"><?php echo htmlspecialchars('2026 | Digital sandbox'); ?></div>
                    <div class="artwork-buttons">
                        <a class="artwork-btn" href="<?php echo htmlspecialchars($study['href']); ?>" target="_blank" rel="noopener">View on Transient</a>
                    </div>
                </div>
            </div>
            <?php endif; ?>
        </div>
        <?php endforeach; ?>
    </div>
    <?php echo render_gallery_modal(); ?>

    <div id="longer-info">
		<h2>Related Works</h2>
            <?php
                $projects = [
                    ['path' => '2025/hybrids'],
                    ['path' => '2022/time'],
                    ['path' => '2021/memory'],
                    ['path' => '2021/fen'],
                    ['path' => '2014/skylines']
                ];

                echo render_projects_list($projects, '../../');
            ?>
	</div>
	
<?php include("../../server/footer.php"); ?>
