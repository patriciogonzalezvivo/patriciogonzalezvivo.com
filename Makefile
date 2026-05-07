.PHONY: portfolio server

portfolio:
	python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json -o portfolio.pdf && xdg-open portfolio.pdf

server:
	php -S localhost:8000