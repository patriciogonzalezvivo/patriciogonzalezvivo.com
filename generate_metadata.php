#!/usr/bin/env php
<?php
/**
 * Generate Metadata Files from Existing Projects
 * 
 * This script scans index.php and works.php to extract project metadata
 * and creates TITLE.txt, MEDIUM.txt files for each project.
 * 
 * Usage: php generate_metadata.php
 */

// Project metadata extracted from index.php and works.php
$projects = array(
    '2026/astros' => array(
        'title' => 'Astros',
        'medium' => 'Custom real-time software',
        'description' => 'Real-time astronomical visualization'
    ),
    '2025/imaginary' => array(
        'title' => 'Imaginary Portraits',
        'medium' => 'Mixed Media on Canvas',
        'description' => 'Imaginary portrait studies'
    ),
    '2025/hybrids' => array(
        'title' => 'Hybrids Studies',
        'medium' => 'Oil on Canvas',
        'description' => 'Hybrid portrait studies'
    ),
    '2025/weaver' => array(
        'title' => 'Light Weaver',
        'medium' => 'Interactive Installation',
        'description' => 'Interactive light installation'
    ),
    '2025/orbitas2' => array(
        'title' => 'Orbitas2',
        'medium' => 'Custom real-time software',
        'description' => 'Orbital mechanics visualization'
    ),
    '2024/portraits' => array(
        'title' => 'Portraits',
        'medium' => 'Oil on cardboard',
        'description' => 'Oil portrait studies'
    ),
    '2023/blink' => array(
        'title' => 'BLINK',
        'medium' => 'Real-time Generative Art',
        'description' => 'Both memento mori and moment of delight, an object suspended between disappearance and wonder'
    ),
    '2022/time' => array(
        'title' => 'Time Studies',
        'medium' => 'Video Art',
        'description' => 'Video work exploring time, perception, and emotional states'
    ),
    '2021/memory' => array(
        'title' => 'Memory Studies',
        'medium' => 'Real-time Generative Art',
        'description' => 'Exploration of digital memory through sorting and scrambling algorithms'
    ),
    '2021/fen' => array(
        'title' => 'Flight Studies',
        'medium' => 'Red Oak, Ucycled Screen, custom real-time software',
        'description' => 'Displayed on custom made digital frames, build from repurposed e-waste and reimagined as a minimalist object of contemplation.',
        'dimensions' => '52cm x 27cm x 5.5cm'
    ),
    '2019/hogar' => array(
        'title' => 'Hogar',
        'medium' => 'Custom real-time software',
        'description' => 'Real-time view of Earth from space'
    ),
    '2018/estrellas' => array(
        'title' => 'Estrellas',
        'medium' => 'Custom real-time software',
        'description' => 'Real-time star map and astronomical visualization'
    ),
    '2017/luna' => array(
        'title' => 'Luna',
        'medium' => 'Custom real-time software',
        'description' => 'Living meditation on time and celestial rhythm'
    ),
);

// Function to create metadata file
function create_meta_file($path, $filename, $content) {
    if (!$content) {
        return;
    }
    
    $filepath = $path . '/' . $filename;
    
    // Check if file already exists
    if (file_exists($filepath)) {
        echo "  [SKIP] $filepath (already exists)\n";
        return;
    }
    
    // Create the file
    if (file_put_contents($filepath, $content) !== false) {
        echo "  [OK] Created $filepath\n";
    } else {
        echo "  [ERROR] Failed to create $filepath\n";
    }
}

// Process each project
foreach ($projects as $path => $meta) {
    echo "\nProcessing $path:\n";
    
    // Check if directory exists
    if (!is_dir($path)) {
        echo "  [SKIP] Directory does not exist\n";
        continue;
    }
    
    // Create metadata files
    create_meta_file($path, 'TITLE.txt', $meta['title']);
    create_meta_file($path, 'MEDIUM.txt', $meta['medium']);
    create_meta_file($path, 'DESCRIPTION.txt', $meta['description'] ?? null);
    
    if (isset($meta['dimensions'])) {
        create_meta_file($path, 'DIMENSIONS.txt', $meta['dimensions']);
    }
}

echo "\n✓ Done! Review the created files and adjust as needed.\n";
echo "\nNext steps:\n";
echo "1. Review and edit the generated metadata files\n";
echo "2. Update project index.php files to use project_meta.php\n";
echo "3. Update index.php and works.php to generate from metadata\n";
?>
