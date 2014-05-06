#!/usr/bin/env bash
#
# requires Pandoc 1.12
# Pandoc options here: http://johnmacfarlane.net/pandoc/README.html#synopsis

USAGE="Usage:
./make.sh html
./make.sh pdf
./make.sh tex
List detected files:
./make.sh debug"

if [ -z "$1" ]
then
    echo "No argument supplied!"
    echo "$USAGE"
    exit 1
fi

# general options:
GENERAL_OPTS="-N --smart --toc --toc-depth=4 -s -p"

# Latex-related options
# Note: PDF output requires Latex, too
# Note: requires xetex currently due to UTF8 problems with regular latex
LATEX_OPTS="--latex-engine=xelatex -V papersize=a4 -V documentclass=scrbook -V links-as-notes"

# html-related options
HTML_OPTS="--self-contained --mathml"

# Find chapter files
FILES=$(find $(pwd) -type f -name "*.md" | sort | tr "\n" " ")

# put all the images into an images folder in the root folder, so that
# pandoc finds them from relative links


# option string construction
if [ "$1" = "html" ] ; then
    OPTS="$GENERAL_OPTS $HTML_OPTS"
elif [ "$1" = "tex" ] ; then
    OPTS="$GENERAL_OPTS $LATEX_OPTS"
elif [ "$1" = "pdf" ] ; then
    OPTS="$GENERAL_OPTS $LATEX_OPTS"
elif [ "$1" = "debug" ] ; then
    echo "List of discovered files:"
    echo $FILES
    exit 0
else
    echo "Invalid argument $1!"
    echo "$USAGE"
    exit 1
fi

# Extract and download the images
#
mkdir -p tmp
cd tmp
for f in *.md; do
    sed "s/<object.*//g" $f | sed "s/<iframe.*//g" | sed "s/<script.*//g" | sed -n "s/\!\[\([^]]*\)\](\([^)]*\))/\2/p" | sed -n "/http.*jpg/p" | sed "s/jpg.*/jpg/g" | sed "s/\[//g" >> images.txt
    images=($(< images.txt))
    for i in "${images[@]}";do 
        wget $url
    done
done

#create the book
# pandoc $FILES $OPTS -o paper.$1
#for f in *.md; do sed "s/<object.*//g" $f | sed "s/<iframe.*//g" | sed "s/<script.*//g" ; printf "\n\n\n\n"; done  | pandoc $OPTS -o paper.$1
#retval=$?

#exit $retval