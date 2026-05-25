<?php
    $allowed = [];
    foreach (glob(__DIR__ . '/chap*.md') as $f) {
        $allowed[] = basename($f);
    }

    $file = isset($_GET['file']) ? basename($_GET['file']) : '';

    if (!$file || !in_array($file, $allowed, true) || !file_exists(__DIR__ . '/' . $file)) {
        header('Location: ./');
        exit;
    }

    include("../../server/project_meta.php");
    $meta = get_current_project_meta();
    $chapter_name = preg_replace('/\.md$/', '', $file);
    $page_title = $meta['title'] . ' — ' . $chapter_name;
    $page_description = $meta['description'];
    include("../../header.php");
?>
<?php include("../../menu.php"); ?>

    <div id="longer-info">
        <p><a href="./">&larr; <?php echo htmlspecialchars($meta['title']); ?></a></p>
        <?php
        include("../../server/ParsedownExtended.php");
        $Parsedown = new ParsedownExtended();
        echo $Parsedown->text(file_get_contents(__DIR__ . '/' . $file));
        ?>
    </div>

<?php include("../../footer.php"); ?>
