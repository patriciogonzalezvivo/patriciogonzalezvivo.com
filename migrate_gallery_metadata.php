<?php
/**
 * Migration Script: Convert Gallery Metadata to .txt Files
 * 
 * Run this script to convert hardcoded metadata arrays to individual .txt files
 * for each artwork.
 * 
 * Usage: php migrate_gallery_metadata.php
 */

include('gallery_helper.php');

echo "Gallery Metadata Migration Tool\n";
echo "================================\n\n";

// Migrate 2024/portraits
echo "Migrating 2024/portraits...\n";
$portraits_sold = array(
    'IMG_4793.jpeg',
);

$portraits_info = array(
    'IMG_4826.jpeg' => array(
        'title' => 'Untitled',
        'year' => '2025',
        'medium' => 'Oil over cardboard',
        'size' => '16 x 12 inches'
    ),
);

export_metadata_to_files($portraits_info, $portraits_sold, '2024/portraits/images');
echo "\n";

// Migrate 2025/hybrids
echo "Migrating 2025/hybrids...\n";
$hybrids_sold = array(
    'IMG_7185.jpeg',
    'IMG_7375.jpeg',
    'IMG_7444.jpeg',
);

$hybrids_info = array();

export_metadata_to_files($hybrids_info, $hybrids_sold, '2025/hybrids/images');
echo "\n";

// Migrate 2025/imaginary
echo "Migrating 2025/imaginary...\n";
$imaginary_sold = array(
    'IMG_7185.jpeg',
    'IMG_7375.jpeg',
    'IMG_7444.jpeg',
);

$imaginary_info = array(
    'IMG_7608.jpeg' => array(
        'title' => 'James',
        'year' => '2025',
        'medium' => 'Oil and Acrylic on canvas',
        'size' => '16 x 12 inches'
    ),
    'IMG_7615.jpeg' => array(
        'title' => 'Jorge',
        'year' => '2025',
        'medium' => 'Oil and Acrylic on canvas',
        'size' => '16 x 12 inches'
    ),
    'IMG_7634.jpeg' => array(
        'title' => 'Xul',
        'year' => '2025',
        'medium' => 'Oil and Acrylic on canvas',
        'size' => '16 x 12 inches'
    ),
    'IMG_7697.jpeg' => array(
        'title' => 'Audre',
        'year' => '2025',
        'medium' => 'Oil and Acrylic on canvas',
        'size' => '16 x 12 inches'
    ),
    'IMG_7713.jpeg' => array(
        'title' => 'Octavia',
        'year' => '2025',
        'medium' => 'Oil and Acrylic on canvas',
        'size' => '16 x 12 inches'
    ),
    'IMG_7724.jpeg' => array(
        'title' => 'Hilma',
        'year' => '2025',
        'medium' => 'Oil and Acrylic on canvas',
        'size' => '16 x 12 inches'
    ),
);

export_metadata_to_files($imaginary_info, $imaginary_sold, '2025/imaginary/images');
echo "\n";

echo "Migration complete!\n";
echo "\nNext steps:\n";
echo "1. Review the generated .txt files\n";
echo "2. Update index.php files to use the new gallery_helper.php\n";
echo "3. Test the galleries\n";
?>
