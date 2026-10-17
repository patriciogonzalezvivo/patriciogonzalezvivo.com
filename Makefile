.PHONY: portfolio server deploy deploy-dry

DEPLOY_HOST ?=
DEPLOY_PATH ?= /var/www/patriciogonzalezvivo.com
RSYNC_DEPLOY = rsync -az --delete --filter='merge .deploy-filter' \
	--chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r --itemize-changes ./ $(DEPLOY_HOST):$(DEPLOY_PATH)/

deploy-dry:
	@test -n "$(DEPLOY_HOST)" || (echo "usage: make deploy-dry DEPLOY_HOST=ubuntu@<server>" && exit 1)
	$(RSYNC_DEPLOY) --dry-run

deploy:
	@test -n "$(DEPLOY_HOST)" || (echo "usage: make deploy DEPLOY_HOST=ubuntu@<server>" && exit 1)
	$(RSYNC_DEPLOY)

portfolio:
	python generate_portfolio.py -t portfolio/template.tex -d portfolio/data.json && open $$(ls -t *.pdf | head -1)

server:
	php -S localhost:8000