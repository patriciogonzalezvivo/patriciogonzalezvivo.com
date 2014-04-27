<?php
define('GITHUB_USER', 'patriciogonzalezvivo');
define('GITHUB_REPO', 'vPlotter');
define('GITHUB_BRANCH', 'master');

function post_receive($encoded_json) {
  $payload = json_decode($encoded_json);
  if (!$payload || !isset($payload->ref)
      || $payload->ref !== 'refs/heads/master') {
    return FALSE;
  }
  cache_all();
}

function cache_all() {
	$context = stream_context_create(array('http' => array('header' => 'User-Agent: PatricioGonzalezVivo site')));
	$url = 'https://api.github.com/repos/'.GITHUB_USER.'/'.GITHUB_REPO.'/git/trees/'.GITHUB_BRANCH.'?recursive=1';
  $branch = json_decode(file_get_contents($url, FALSE, $context));
	$tree = $branch->tree;
  $images = array_filter($tree, function($obj) {
    return $obj->type === 'blob' && preg_match('/^media\/archive\/[^(HD)]+/', $obj->path);
  });
  cache_images($images);
  cache_text_files();
}

// Returns a GitHub raw URL
function get_raw_url($path) {
  return 'https://raw.github.com/'.GITHUB_USER.'/'.GITHUB_REPO.'/'.GITHUB_BRANCH.'/'.$path;
}

// Empty directory
function rrmdir($dir) {
  if (!file_exists($dir)) {
    return;
  }
  $files = glob($dir . '/*');
  if ($files) {
    foreach($files as $file) {
      if(is_dir($file)) {
        rrmdir($file);
      }
      else {
        unlink($file);
      }
    }
  }
  rmdir($dir);
}

// Cache a file
function cache_file($url, $path) {
  if (file_exists($path)) {
    unlink($path);
  }
  file_put_contents($path, file_get_contents($url));
}

// Cache text files
function cache_text_files() {
  rrmdir(__DIR__ . '/cache');
  mkdir(__DIR__ . '/cache');
  cache_file(get_raw_url('README.md'), __DIR__ . '/cache/README.md');
}

// Fetch images from GitHub and cache them
function cache_images($images) {
  rrmdir(__DIR__ . '/cache/images');
  mkdir(__DIR__ . '/cache/images');
  foreach($images as $id => $image) {
    cache_file(get_raw_url($image->path), __DIR__ . '/images/' . basename($image->path));
  }
}
