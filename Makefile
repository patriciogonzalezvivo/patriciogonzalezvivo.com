portfolio:
	python generate_portfolio.py -t portfolio_template.tex -d portfolio_data.json -o portfolio.pdf && open portfolio.pdf && open portfolio.pdf

server:
	php -S localhost:8000