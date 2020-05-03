#!/bin/sh
npm run build
npm run buildServer
cp -r lib ../herokudeploy/pgo-tarot/
cp -r img ../herokudeploy/pgo-tarot/
cp -r dist ../herokudeploy/pgo-tarot/
cp -r style ../herokudeploy/pgo-tarot/
# cp -r package.json ../herokudeploy/pgo-tarot/