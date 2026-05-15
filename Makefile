.PHONY: portfolio server

portfolio:
	python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json && xdg-open $$(ls -t *.pdf | head -1)

server:
	php -S localhost:8000