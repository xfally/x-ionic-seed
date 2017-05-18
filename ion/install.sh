#!/bin/bash
# Install all needed packages and prepare build env
# Usage:
# $ ./install.sh

echo "*** install start ***"

# Install global packages
# - Just tested with ionic 1.x
#npm install -g bower gulp grunt-cli cordova ionic@1.x
# - Just iOS needed
#npm install -g ios-deploy ios-sim --unsafe-perm

# Install local packages
npm install

# Install web lib
# - Refer to gulpfile.js: bower install
gulp install

# Restore cordova platforms and plugins
ionic prepare

echo "*** install end ***"
