#!/bin/bash
# Bump app version
# Usage:
# 1. $ ./bump-version.sh: query version
# 2. $ ./bump-version.sh x.x.x: update version

echo "*** bump-version start ***"

packageFile=./package.json
configFile=./config.xml
protocolFile=./www/js/protocols.js

function queryVersion()
{
    echo -e -n "package ver: ";
    grep -E "\"version\":( )*\"[0-9]+\.[0-9]+\.[0-9]+\"" $packageFile | grep -E "[0-9]+\.[0-9]+\.[0-9]+" -o
    echo -e -n "native  ver: ";
    grep -E "version=\"[0-9]+\.[0-9]+\.[0-9]+\"" $configFile | grep -E "[0-9]+\.[0-9]+\.[0-9]+" -o
    echo -e -n "web     ver: ";
    grep -E "VER:( )*'[0-9]+\.[0-9]+\.[0-9]+'" $protocolFile | grep -E "[0-9]+\.[0-9]+\.[0-9]+" -o
}

newVer=$1

if [[ -z $newVer || $newVer == "undefined" || ! "$newVer" =~ [0-9]+\.[0-9]+\.[0-9]+ ]]
then
    echo "=== Current App Version ==="
    queryVersion
    echo "=== Current App Version ==="
else
    echo "Updating App Version..."
    sed -r -i "s/\"version\":\s*\"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"$newVer\"/g" $packageFile
    sed -r -i "s/version=\"[0-9]+\.[0-9]+\.[0-9]+\"/version=\"$newVer\"/g" $configFile
    sed -r -i "s/VER:\s*'[0-9]+\.[0-9]+\.[0-9]+'/VER: '$newVer'/g" $protocolFile
    echo "=== New App Version ==="
    queryVersion
    echo "=== New App Version ==="
fi

echo "*** bump-version end ***"
