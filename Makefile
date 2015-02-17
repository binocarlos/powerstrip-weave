test:
	bash ./tests.sh | ./node_modules/.bin/tap-spec

.PHONY: test