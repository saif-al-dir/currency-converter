#!/bin/bash
set -e
cd "$(dirname "$0")"
git pull
npm ci
npm run build
find "$HOME/domains/currency.saif1.usermd.net/public_html" -mindepth 1 -delete
cp -r dist/. "$HOME/domains/currency.saif1.usermd.net/public_html/"
echo "Deployed."