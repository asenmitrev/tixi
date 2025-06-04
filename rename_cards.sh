#!/bin/bash

# Script to rename all files in public/cards folder to sequential numbers 1-94

# Change to the cards directory
cd public/cards

# Check if directory exists
if [ ! -d "." ]; then
    echo "Error: public/cards directory not found!"
    exit 1
fi

# Count files to make sure we have files to rename
file_count=$(ls -1 *.jpg 2>/dev/null | wc -l)
if [ "$file_count" -eq 0 ]; then
    echo "Error: No .jpg files found in public/cards directory!"
    exit 1
fi

echo "Found $file_count .jpg files to rename"

# Create a temporary directory to avoid conflicts during renaming
temp_dir="../temp_cards_rename"
mkdir -p "$temp_dir"

# Copy all files to temp directory with new names
counter=1
for file in *.jpg; do
    cp "$file" "$temp_dir/${counter}.jpg"
    echo "Renaming: $file -> ${counter}.jpg"
    counter=$((counter + 1))
done

# Remove original files and move renamed files back
rm -f *.jpg
mv "$temp_dir"/*.jpg .
rmdir "$temp_dir"

echo "Renaming complete! All files have been renamed to sequential numbers 1-$((counter-1)).jpg"
echo "Total files renamed: $((counter-1))" 