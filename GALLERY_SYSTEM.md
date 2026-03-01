# Gallery System Documentation

A reusable PHP gallery system with metadata stored in individual `.txt` files for each artwork.

## File Structure

For each artwork, the system supports multiple image versions:

```
project/images/
├── IMG_1234.jpeg              # Main high-resolution image
├── IMG_1234.txt               # Metadata file
├── thumbnails/
│   └── IMG_1234.jpeg          # Thumbnail (required)
├── detail/
│   └── IMG_1234.jpeg          # Detail shot (optional)
└── installation/
    └── IMG_1234.jpeg          # Installation view (optional)
```

## Metadata File Format

Each `.txt` file contains metadata in `key: value` format (one per line):

```
title: Portrait of Jane Doe
year: 2025
medium: Oil over cardboard
dimensions: 16 x 12 inches
sold: yes
```

### Supported Fields

- `title`: Artwork title (default: "Untitled")
- `year`: Year created (default: current year)
- `medium`: Medium/technique (e.g., "Oil over cardboard")
- `dimensions`: Size (e.g., "16 x 12 inches")
- `sold`: Whether artwork is sold (values: `yes`, `no`, `true`, `false`, `1`, `0`)

### Comments

Lines starting with `#` are treated as comments and ignored.

## Usage in PHP

### Simple Usage

```php
<?php
include("../../gallery_helper.php");
?>

<?php
echo render_gallery([
    'images_dir' => 'images',
    'pattern' => 'IMG_*.jpeg',
    'defaults' => [
        'title' => 'Untitled',
        'year' => '2025',
        'medium' => 'Oil and Acrylic on canvas',
        'dimensions' => '16 x 12 inches',
        'sold' => false,
    ],
]);
?>
```

### Advanced Usage

```php
<?php include("../../gallery_helper.php"); ?>

<?php
// Get artwork data
$artworks = get_gallery_artworks('images', 'IMG_*.jpeg', [
    'title' => 'Untitled',
    'year' => '2025',
    'medium' => 'Mixed Media',
]);

// Render gallery manually
echo '<div class="paintings-gallery">';
foreach ($artworks as $artwork) {
    echo render_gallery_item($artwork);
}
echo '</div>';

// Add modal
echo render_gallery_modal();
?>
```

## Creating New Galleries

1. **Create the directory structure:**
   ```bash
   mkdir -p project/images/thumbnails
   ```

2. **Add your images:**
   - Place full-size images in `images/`
   - Place thumbnails in `images/thumbnails/`
   - Optionally: add detail shots in `images/detail/`
   - Optionally: add installation views in `images/installation/`

3. **Create metadata files:**
   ```bash
   # For each image, create a .txt file
   cat > images/IMG_1234.txt << EOF
   title: My Artwork
   year: 2025
   medium: Oil on canvas
   dimensions: 24 x 36 inches
   sold: no
   EOF
   ```

4. **Create index.php:**
   ```php
   <?php
       $page_title = "Gallery Name";
       $page_description = "Gallery description";
       include("../../header.php");
       include("../../gallery_helper.php");
   ?>
   <?php include("../../menu.php");?>

   <link rel="stylesheet" href="style.css">
   
   <?php
       echo render_gallery([
           'images_dir' => 'images',
           'pattern' => 'IMG_*.jpeg',
           'defaults' => [
               'title' => 'Untitled',
               'year' => '2025',
               'medium' => 'Mixed Media',
               'dimensions' => '',
               'sold' => false,
           ],
       ]);
   ?>
   
   <?php include("../../footer.php"); ?>
   ```

## Updating Metadata

Simply edit the `.txt` files. Changes take effect immediately (no need to restart anything).

### Example: Marking an artwork as sold

```bash
echo "sold: yes" >> images/IMG_1234.txt
```

### Example: Updating artwork details

```bash
cat > images/IMG_1234.txt << EOF
title: Updated Title
year: 2025
medium: Oil and acrylic on canvas
dimensions: 20 x 16 inches
sold: yes
EOF
```

## Multiple Image Versions

The gallery system automatically detects and includes additional image versions:

- **Thumbnail**: Always shown in gallery grid
- **Main**: Shown when clicked (fullscreen view)
- **Detail**: Close-up/detail shot (accessible via button in fullscreen)
- **Installation**: Installation view (accessible via button in fullscreen)

### Adding Detail or Installation Images

Simply place them in the appropriate subfolder with the same filename:

```bash
# Add a detail shot
cp detail_photo.jpg images/detail/IMG_1234.jpeg

# Add an installation view
cp installation_photo.jpg images/installation/IMG_1234.jpeg
```

The buttons will automatically appear in the fullscreen modal.

## Migration from Old Format

If you have galleries with hardcoded metadata arrays, use the migration script:

1. Edit `migrate_gallery_metadata.php` with your data
2. Run: `php migrate_gallery_metadata.php`
3. Update your `index.php` to use `gallery_helper.php`

## API Reference

### `render_gallery($options)`

Renders a complete gallery with modal.

**Options:**
- `images_dir` (string): Directory containing images (default: `'images'`)
- `pattern` (string): Glob pattern for images (default: `'IMG_*.{jpg,jpeg,png,gif}'`)
- `defaults` (array): Default metadata values
- `show_modal` (bool): Include fullscreen modal HTML (default: `true`)

### `get_gallery_artworks($images_dir, $pattern, $defaults)`

Returns array of artwork data with metadata.

### `render_gallery_item($artwork)`

Renders HTML for a single gallery item.

### `load_artwork_metadata($metadata_file, $defaults)`

Loads metadata from a `.txt` file.

## Examples

See the following galleries for working examples:
- [2024/portraits](2024/portraits/)
- [2025/hybrids](2025/hybrids/)
- [2025/imaginary](2025/imaginary/)
