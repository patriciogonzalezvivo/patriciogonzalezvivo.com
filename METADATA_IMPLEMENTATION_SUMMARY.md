# Project Metadata System - Implementation Summary

## What Was Created

### 1. Metadata Files (text files in each project folder)

Each project now has simple text files storing its metadata:

```
2023/blink/
  ├── TITLE.txt          → "BLINK"
  ├── MEDIUM.txt         → "Real-time Generative Art"
  ├── DESCRIPTION.txt    → "Both memento mori and moment..."
  └── README.md          → Long-form content (already existed)

2021/fen/
  ├── TITLE.txt          → "Flight Studies"
  ├── MEDIUM.txt         → "Red Oak, Ucycled Screen..."
  ├── DESCRIPTION.txt    → "Displayed on custom made..."
  ├── DIMENSIONS.txt     → "52cm x 27cm x 5.5cm"
  └── README.md
```

**Created for 13 projects:**
- 2026/astros
- 2025/imaginary, hybrids, weaver, orbitas2
- 2024/portraits
- 2023/blink
- 2022/time
- 2021/memory, fen
- 2019/hogar
- 2018/estrellas
- 2017/luna

### 2. Core System Files

**`project_meta.php`** - Helper functions:
- `get_project_meta($path, $base_path)` - Reads metadata from files
- `render_project_item($meta, $commented)` - Generates HTML for listings
- `list_all_projects($base_path)` - Auto-discovers all projects
- `read_meta_file($filepath)` - Reads a single metadata file

**`PROJECT_METADATA.md`** - Complete documentation with examples

**`generate_metadata.php`** - Script to create metadata files from existing data

**`test_metadata.php`** - Test page to verify the system works

### 3. Updated Files

**`2023/blink/index.php`** - Now uses the metadata system:
```php
<?php
include("../../project_meta.php");
$meta = get_project_meta('.', '../../');
$page_title = $meta['title'];
$page_description = $meta['description'];
include("../../header.php");
?>
```

## How It Works

### Single Source of Truth

Before:
- Title appears in: index.php, works.php, project/index.php
- Medium appears in: index.php, works.php, project/index.php
- Description appears in: project/index.php, header meta tags

After:
- Each value stored once in a text file
- All pages read from these files
- Change once, updates everywhere

### Example Usage

#### In Project index.php:
```php
<?php
include("../../project_meta.php");
$meta = get_project_meta('.', '../../');
$page_title = $meta['title'];
$page_description = $meta['description'];
include("../../header.php");
?>

<div class="item-info">
    <span class="item-title"><?php echo htmlspecialchars($meta['title']); ?></span>
    <span class="item-year"><?php echo htmlspecialchars($meta['year']); ?></span>
    <span class="item-medium"><?php echo htmlspecialchars($meta['medium']); ?></span>
</div>
```

#### In Listing Pages (index.php, works.php):
```php
<?php
include("project_meta.php");

$projects = array('2023/blink', '2022/time', '2021/memory');

foreach ($projects as $project) {
    $meta = get_project_meta($project);
    echo render_project_item($meta);
}
?>
```

Or auto-discover all projects:
```php
<?php
include("project_meta.php");
$projects = list_all_projects('.');
foreach ($projects as $project) {
    echo render_project_item(get_project_meta($project));
}
?>
```

## Benefits

✅ **No Duplication** - Each project's title, medium, etc. defined in one place
✅ **Easy Maintenance** - Edit simple text files, not PHP code
✅ **Version Control** - Text files track cleanly in git with meaningful diffs
✅ **Auto-generation** - Can automatically generate listing pages
✅ **Consistency** - Same data everywhere, impossible to have mismatches
✅ **Separation of Concerns** - Content (text files) vs. code (PHP)

## Next Steps

### 1. Review Generated Metadata
Check the created TITLE.txt, MEDIUM.txt files and refine as needed:
```bash
cat 2024/portraits/TITLE.txt
cat 2024/portraits/MEDIUM.txt
```

### 2. Update Remaining Project index.php Files
Apply the pattern from 2023/blink/index.php to other projects:
```php
<?php
include("../../project_meta.php");
$meta = get_project_meta('.', '../../');
$page_title = $meta['title'];
$page_description = $meta['description'];
include("../../header.php");
?>
```

### 3. Update Listing Pages
Regenerate index.php and works.php using the metadata system:
```php
<?php include("project_meta.php"); ?>
<section class="content">
<?php
$featured = array('2023/blink', '2022/time', '2021/memory');
foreach ($featured as $project) {
    echo render_project_item(get_project_meta($project));
}
?>
</section>
```

### 4. Add Metadata for Older Projects
Create TITLE.txt, MEDIUM.txt for projects from 2010-2016:
```bash
cd 2012/codemology
echo "Code-Mology" > TITLE.txt
echo "Interactive Installation" > MEDIUM.txt
echo "Visual programming concepts" > DESCRIPTION.txt
```

### 5. Test the System
Visit test page: `http://localhost/test_metadata.php`

## File Structure Summary

```
patriciogonzalezvivo.com/
├── project_meta.php          # Core helper functions
├── PROJECT_METADATA.md       # Documentation
├── generate_metadata.php     # Generation script
├── test_metadata.php         # Test page
├── index.php                 # Homepage (can be updated)
├── works.php                 # Works page (can be updated)
└── 2023/blink/              # Example project
    ├── TITLE.txt
    ├── MEDIUM.txt
    ├── DESCRIPTION.txt
    ├── README.md
    └── index.php             # Updated to use metadata
```

## Questions?

- See `PROJECT_METADATA.md` for full documentation
- Run `php test_metadata.php` to view the test page
- Run `php generate_metadata.php` to regenerate metadata files
