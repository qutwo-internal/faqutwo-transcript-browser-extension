#!/usr/bin/env bash
# Sign the extension for Firefox via AMO as a self-distributed (unlisted) add-on → a permanently
# installable .xpi (Firefox requires signing for permanent install; about:debugging temp-loads reset
# on restart). This is NOT a public AMO listing.
#
# 1. Get API credentials (once) at https://addons.mozilla.org/developers/addon/api/key/
# 2. export WEB_EXT_API_KEY="user:XXXXXXX:NNN"
#    export WEB_EXT_API_SECRET="XXXXXXXXXXXXXXXX"      # never commit these
# 3. ./sign.sh                                          # signed .xpi lands in ./dist/
#
# Install the resulting .xpi: Firefox → about:addons → gear ⚙ → "Install Add-on From File…".
set -euo pipefail
cd "$(dirname "$0")"
npx --yes web-ext@latest sign --source-dir extension --channel=unlisted --artifacts-dir dist "$@"
