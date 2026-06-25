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

# web-ext needs Node >= 20; on older Node it dies with a cryptic pino "tracingChannel" crash.
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
if [ "${NODE_MAJOR:-0}" -lt 20 ]; then
  echo "✗ web-ext needs Node >= 20, but 'node' here is $(node -v 2>/dev/null || echo 'missing')." >&2
  echo "  Fix:  nvm install 20 && nvm use 20    (or: brew install node, then a fresh shell)" >&2
  echo "  Then re-run ./sign.sh  (your conda env's Node may be shadowing a newer one)." >&2
  exit 1
fi

npx --yes web-ext@latest sign --source-dir extension --channel=unlisted --artifacts-dir dist "$@"
