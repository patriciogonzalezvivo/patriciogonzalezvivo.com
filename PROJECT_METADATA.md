# Project Metadata System

## Overview

Each project folder contains simple text files that store metadata used across the site:

- `TITLE.txt` - Project title (e.g., "BLINK", "Flight Studies")
- `MEDIUM.txt` - Medium/technique (e.g., "Real-time Generative Art", "Oil on Canvas")
- `DESCRIPTION.txt` - Short description for page metadata and social sharing
- `DIMENSIONS.txt` (optional) - Physical dimensions when applicable (e.g., "52cm x 27cm x 5.5cm")

The year is automatically extracted from the folder path (e.g., `2023/blink` → year = 2023).

## Usage in Project Index.php

### Basic Usage

```php
<?php
include("../../project_meta.php");
$meta = get_project_meta('.', '../../'); // Read from current project folder

$page_title = $meta['title'];
$page_description = $meta['description'];
include("../../header.php");
?>
<?php include("../../menu.php");?>

<div class="item-info">
    <span class="item-title"><?php echo htmlspecialchars($meta['title']); ?></span>
    <span class="item-year"><?php echo htmlspecialchars($meta['year']); ?></span>
    <span class="item-medium"><?php echo htmlspecialchars($meta['medium']); ?></span>
    <?php if ($meta['dimensions']): ?>
    <span class="item-dimensions"><?php echo htmlspecialchars($meta['dimensions']); ?></span>
    <?php endif; ?>
</div>
```

### Full Example (2023/blink/index.php)

```php
<?php
// Load project metadata from TITLE.txt, MEDIUM.txt, etc.
include("../../project_meta.php");
$meta = get_project_meta('.', '../../');

// Use metadata for page header
$page_title = $meta['title'];
$page_description = $meta['description'];
include("../../header.php");
?>
<?php include("../../menu.php");?>

<link rel="stylesheet" href="style.css" type="text/css" />

<article class="item">
    <div class="item-image">
        <div id="wrapper" class="windowed">
            <canvas class='emscripten' id='canvas'></canvas>
        </div>
    </div>
    <div class="item-info">
        <span class="item-title"><?php echo htmlspecialchars($meta['title']); ?></span>
        <span class="item-year"><?php echo htmlspecialchars($meta['year']); ?></span>
        <span class="item-medium"><?php echo htmlspecialchars($meta['medium']); ?></span>
    </div>
</article>

<div id="longer-info">
    <?php
    include("../../parsedown/Parsedown.php");
    $Parsedown = new Parsedown();
    echo $Parsedown->text(file_get_contents('README.md'));
    ?>
</div>

<script src="main.js"></script>
<?php include("../../footer.php"); ?>
```

## Usage in Listing Pages (index.php, works.php)

### Manual List

```php
<?php include("header.php");?>
<?php include("menu.php");?>
<?php include("project_meta.php"); ?>

<section class="content">
<?php
// Define list of projects to display
$projects = array(
    '2023/blink',
    '2022/time',
    '2021/memory',
    '2021/fen',
    // ... more projects
);

// Render each project
foreach ($projects as $project) {
    $meta = get_project_meta($project);
    echo render_project_item($meta);
}
?>
</section>

<?php include("footer.php"); ?>
```

### Auto-discover All Projects

```php
<?php include("header.php");?>
<?php include("menu.php");?>
<?php include("project_meta.php"); ?>

<section class="content">
<?php
// Automatically find all projects with metadata files
$projects = list_all_projects('.');

// Render each project
foreach ($projects as $project) {
    $meta = get_project_meta($project);
    echo render_project_item($meta);
}
?>
</section>

<?php include("footer.php"); ?>
```

### Custom Filtering

```php
<?php
include("project_meta.php");

// Get all projects
$all_projects = list_all_projects('.');

// Filter by year
$recent_projects = array_filter($all_projects, function($project) {
    $parts = explode('/', $project);
    $year = intval($parts[0]);
    return $year >= 2020;
});

// Render filtered list
foreach ($recent_projects as $project) {
    $meta = get_project_meta($project);
    echo render_project_item($meta);
}
?>
```

### Render as Commented Out

```php
<?php
$meta = get_project_meta('2019/hogar');
echo render_project_item($meta, true); // true = wrap in HTML comments
?>
```

## Project Metadata Functions

### `get_project_meta($project_path, $base_path = '')`

Returns an associative array with:
- `path` - Project path (e.g., "2023/blink")
- `year` - Extracted year (e.g., "2023")
- `folder` - Folder name (e.g., "blink")  
- `title` - From TITLE.txt
- `medium` - From MEDIUM.txt
- `description` - From DESCRIPTION.txt
- `dimensions` - From DIMENSIONS.txt (or null)
- `thumb` - Auto-detected thumbnail (thumb.gif/jpg/png)

### `render_project_item($meta, $commented = false)`

Renders HTML for a project item in gallery/listing format.

### `list_all_projects($base_path = '.', $excluded_folders = array())`

Auto-discovers all projects by scanning year directories for folders containing TITLE.txt.

## Migration Steps

1. **Create metadata files** for each project:
   ```bash
   cd 2023/blink
   echo "BLINK" > TITLE.txt
   echo "Real-time Generative Art" > MEDIUM.txt
   echo "Short description here" > DESCRIPTION.txt
   ```

2. **Update project index.php** to use metadata:
   ```php
   <?php
   include("../../project_meta.php");
   $meta = get_project_meta('.', '../../');
   $page_title = $meta['title'];
   $page_description = $meta['description'];
   include("../../header.php");
   ?>
   ```

3. **Update listing pages** (index.php, works.php) to generate from metadata.

## Benefits

- **Single Source of Truth**: Each project's metadata lives in one place
- **No Duplication**: Title, medium, etc. defined once, used everywhere
- **Easy Maintenance**: Update text files, changes reflect everywhere
- **Auto-generation**: Can automatically generate listing pages
- **Version Control Friendly**: Simple text files track well in git
