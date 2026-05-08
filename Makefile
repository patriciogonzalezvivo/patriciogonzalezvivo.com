.PHONY: portfolio docx slides pptx server

portfolio:
	python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json -o portfolio.pdf && xdg-open portfolio.pdf

slides:
	python generate_portfolio.py -t portfolio/beamer_template.tex -d portfolio/data.json -o portfolio_slides.pdf --slides && xdg-open portfolio_slides.pdf

pptx:
	python generate_portfolio.py -d portfolio/data.json -o portfolio_slides.pptx --pptx && xdg-open portfolio_slides.pptx

docx:
	python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json -o portfolio.pdf --latex-only
	pandoc portfolio.tex \
		--from=latex \
		--to=docx \
		--resource-path=. \
		--extract-media=portfolio_media \
		-o portfolio.docx
	xdg-open portfolio.docx

server:
	php -S localhost:8000