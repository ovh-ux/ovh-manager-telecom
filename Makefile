#### SYSTEM COMMAND ####
NODE=node
YARN=yarn
GIT=git
CD=cd
ECHO=@echo
TAR=tar -zcf
DEL=rm -rf
MAKE=make
MV=mv
RSYNC=rsync -av --delete --exclude=".git"

#### FOLDERS ####
NODE_DIR=node_modules
DIST_DIR=dist

#### FILES ####
DIST_TAR=dist.tar.gz

#### MACRO ####
NAME=`grep -Po '(?<="name": ")[^"]*' package.json`

#### OTHER ####


help:
	$(ECHO) "_____________________________"
	$(ECHO) "$(NAME)"
	$(ECHO) "Copyright (c) OVH SAS."
	$(ECHO) "All rights reserved."
	$(ECHO) "_____________________________"
	$(ECHO) " -- AVAILABLE TARGETS --"
	$(ECHO) "make clean                                                         => clean the sources"
	$(ECHO) "make install                                                       => install deps"
	$(ECHO) "make dev                                                           => launch the project (development)"
	$(ECHO) "make prod                                                          => launch the project (production) - For testing purpose only"
	$(ECHO) "make test                                                          => launch the tests"
	$(ECHO) "make build                                                         => build the project and generate dist"
	$(ECHO) "make release type=patch|minor|major                                => build the project, generate build folder, increment release and commit the source"
	$(ECHO) "_____________________________"

clean:
	$(DEL) $(NODE_DIR)
	$(DEL) $(DIST_DIR)
	$(DEL) $(DIST_TAR)

install:
	$(YARN) install

dev: deps
	$(YARN) start

prod: deps
	$(YARN) build

build: deps
	# if [ -n "$(SMARTTAG_REPO_EU)" ]; then $(YARN) add "$(SMARTTAG_REPO_EU)" --no-lockfile; fi
	# if [ -n "$(SMARTTAG_REPO_EU)" ]; then sed -i -r 's/at\-internet\-smarttag\-manager(-eu|-ca|-us)?\/dist/at-internet-smarttag-manager-eu\/dist/' $(DEPENDENCIES_FILES_LIST); fi
	$(YARN) build
	mkdir dist/client
	cd dist && ls -1 | grep -v ^client$ | xargs -I{} mv {} client && cd ..
	$(TAR) $(DIST_TAR) $(DIST_DIR)

release: deps
	$(YARN) version --new-version $(type) -m "chore: release v%s"

###############
# Tests tasks #
###############

test: deps
	$(YARN) test --quiet

#############
# Sub tasks #
#############

# Dependencies of the project
deps: $(GRUNT_DEP)

$(NODE_DIR)/%:
	$(MAKE) install
