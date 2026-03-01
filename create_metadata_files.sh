#!/bin/bash

# Portraits - 2024/portraits/images
echo "Creating metadata for portraits..."
for img in 2024/portraits/images/IMG_*.jpeg; do
  txtfile="${img%.jpeg}.txt"
  if [ ! -f "$txtfile" ]; then
    base=$(basename "$img" .jpeg)
    cat > "$txtfile" << METADATA
title: Untitled
year: 2024
medium: Oil over cardboard
dimensions: 16 x 12 inches
METADATA
    echo "Created: $txtfile"
  fi
done

# Hybrids - 2025/hybrids/images
echo -e "\nCreating metadata for hybrids..."
for img in 2025/hybrids/images/IMG_*.jpeg; do
  txtfile="${img%.jpeg}.txt"
  if [ ! -f "$txtfile" ]; then
    base=$(basename "$img" .jpeg)
    cat > "$txtfile" << METADATA
title: Untitled
year: 2025
medium: Oil and Acrylic on canvas
dimensions: 16 x 12 inches
METADATA
    echo "Created: $txtfile"
  fi
done

echo -e "\nDone! Summary:"
echo "Portraits: $(find 2024/portraits/images -maxdepth 1 -name "IMG_*.txt" | wc -l) .txt files"
echo "Hybrids: $(find 2025/hybrids/images -maxdepth 1 -name "IMG_*.txt" | wc -l) .txt files"
echo "Imaginary: $(find 2025/imaginary/images -maxdepth 1 -name "IMG_*.txt" | wc -l) .txt files"
