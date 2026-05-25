<!DOCTYPE html>
<html>
<head>
    <title>Project Metadata Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .project { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .project h2 { margin-top: 0; color: #333; }
        .meta { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 3px; }
        .meta strong { display: inline-block; width: 120px; }
        pre { background: #f0f0f0; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Project Metadata System Test</h1>
    
    <?php
    include("project_meta.php");
    
    // Test individual project
    echo "<h2>Individual Project Test</h2>";
    $test_projects = array('2023/blink', '2021/fen', '2022/time');
    
    foreach ($test_projects as $project_path) {
        $meta = get_project_meta($project_path);
        ?>
        <div class="project">
            <h2><?php echo htmlspecialchars($meta['title']); ?></h2>
            <div class="meta">
                <strong>Path:</strong> <?php echo htmlspecialchars($meta['path']); ?><br>
                <strong>Year:</strong> <?php echo htmlspecialchars($meta['year']); ?><br>
                <strong>Folder:</strong> <?php echo htmlspecialchars($meta['folder']); ?><br>
                <strong>Medium:</strong> <?php echo htmlspecialchars($meta['medium']); ?><br>
                <strong>Description:</strong> <?php echo htmlspecialchars($meta['description']); ?><br>
                <?php if ($meta['dimensions']): ?>
                <strong>Dimensions:</strong> <?php echo htmlspecialchars($meta['dimensions']); ?><br>
                <?php endif; ?>
                <strong>Thumbnail:</strong> <?php echo $meta['thumb'] ? htmlspecialchars($meta['thumb']) : 'Not found'; ?><br>
            </div>
            
            <h3>Rendered HTML:</h3>
            <pre><?php echo htmlspecialchars(render_project_item($meta)); ?></pre>
            
            <h3>Preview:</h3>
            <?php echo render_project_item($meta); ?>
        </div>
        <?php
    }
    
    // Test auto-discovery
    echo "<h2>Auto-Discovery Test</h2>";
    $all_projects = list_all_projects('.');
    echo "<p>Found " . count($all_projects) . " projects with metadata:</p>";
    echo "<ul>";
    foreach ($all_projects as $project) {
        $meta = get_project_meta($project);
        echo "<li><strong>" . htmlspecialchars($meta['title']) . "</strong> (" . htmlspecialchars($project) . ")</li>";
    }
    echo "</ul>";
    ?>
    
    <h2>Full Gallery Example</h2>
    <section class="content">
        <?php
        // Render first 5 projects
        $recent = array_slice($all_projects, 0, 5);
        foreach ($recent as $project) {
            $meta = get_project_meta($project);
            echo render_project_item($meta);
        }
        ?>
    </section>
</body>
</html>
