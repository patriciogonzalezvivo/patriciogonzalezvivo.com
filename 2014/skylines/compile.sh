#!/usr/bin/env bash
#

# Pandoc options
OPTS="-N --latex-engine=xelatex --toc --toc-depth=3 -V documentclass=report -V links-as-notes -s -S"
# --biblio biblio.bib --csl chicago-author-date.csl"
#  -s -p 
#"--latex-engine=xelatex -V papersize=a4 -V documentclass=scrbook"

# Find chapter files
FILES=$(find $(pwd) -type f -name "*.md" | sort | tr "\n" " ")

# Bring README's of Tools from github
# 
wget --no-check-certificate https://raw.github.com/patriciogonzalezvivo/vPlotter/master/README.md -O 03-vPlotter.md
echo -e "# The Tools\n\n## vPlotter\n\n$(cat 03-vPlotter.md)" > 03-vPlotter.md
#wget --no-check-certificate https://raw.github.com/patriciogonzalezvivo/ofxThermalPrinter/master/README.md -O 04-ThermalPrinter.md

# Extract and download the images
#
mkdir -p tmp
for f in *.md; do sed "s/<object.*//g" $f | sed "s/<iframe.*//g" | sed "s/<script.*//g" | sed "s/<object.*//g" | sed -n "s/\!\[\([^]]*\)\](\([^)]*\))/\2/p" | sed -n "/http.*jpg/p" | sed "s/jpg.*/jpg/g" | sed "s/\[//g" | sed "s/https/http/g" > images.txt;
  images=($(< images.txt))
  for img in "${images[@]}";do 
      wget $img -P tmp/
  done
done

# Stich them together
#
for f in *.md; do sed "s/<object.*//g" $f | sed "s/<iframe.*//g" | sed "s/<script.*//g" | sed "s/<object.*//g" | sed "s/\!\[\([^]]*\)\](http.*\/\([^)]*\).jpg.*)/\![\1](tmp\/\2.jpg)/g" | sed "s/\" target=\"_blank\"//g" ; printf "\n\n\n\n" ; done  | pandoc $OPTS -o total.pdf
retval=$?

rm -rf tmp
rm images.txt 03-vPlotter.md 
#rm 04-ThermalPrinter.md


exit $retval