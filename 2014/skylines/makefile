chap01	= 	01-intro.md
chap02	= 	02-process.md

fnlName	=	paper.pdf

tex	 	= 	template.tex
aux 	= 	$(tex:.tex=.aux)
pdf 	= 	$(tex:.tex=.pdf)
bib 	=  	bibliography.bib

default: clean md2tex tex2pdf clean

clean: 
	rm -f *.aux *.log *.bbl *.blg *.brf *.cb *.ind *.idx *.ilg	\
				*.inx *.toc *.out *~ $(body)

md2tex: 
	pandoc --from markdown --to pdf -o chap01.pdf $(chap01)

tex2pdf: 
	#pdflatex $(tex)
	#bibtex $(aux)
	#pdflatex $(tex)
	#pdflatex $(tex)
	#mv $(pdf) $(fnlName)
	#rm -f *.aux *.log *.bbl *.blg *.brf *.cb *.ind *.idx *.ilg	\
	#			*.inx *.toc *.out *~ $(body)