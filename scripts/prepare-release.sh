#!/usr/bin/env bash
#
# Prepares plugin packages for publishing to GitHub Packages.
#
# Replaces @internal/ scope with the public scope, removes the
# "private" flag, and sets the publishConfig registry.
#
# Usage: ./scripts/prepare-release.sh
#
set -euo pipefail

PUBLIC_SCOPE="@grahambrooks"
REGISTRY="https://npm.pkg.github.com"

PLUGIN_DIRS=(
  "plugins/product"
  "plugins/product-backend"
)

for dir in "${PLUGIN_DIRS[@]}"; do
  pkg="$dir/package.json"
  echo "Preparing $pkg for release..."

  # Replace @internal/ scope with public scope in package name
  sed -i "s|\"@internal/|\"${PUBLIC_SCOPE}/|g" "$pkg"

  # Replace @internal/ references in dependencies (cross-plugin refs)
  # This catches any dependency on sibling plugins
  sed -i "s|@internal/|${PUBLIC_SCOPE}/|g" "$pkg"

  # Remove "private": true
  sed -i '/"private": true,/d' "$pkg"

  # Set the registry in publishConfig
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('$pkg', 'utf8'));
    pkg.publishConfig = pkg.publishConfig || {};
    pkg.publishConfig.registry = '$REGISTRY';
    fs.writeFileSync('$pkg', JSON.stringify(pkg, null, 2) + '\n');
  "

  echo "  -> $(node -e "console.log(JSON.parse(require('fs').readFileSync('$pkg','utf8')).name)")"
done

# Also replace @internal/ references in built source files
# This ensures import statements in compiled output use the public scope
for dir in "${PLUGIN_DIRS[@]}"; do
  if [ -d "$dir/dist" ]; then
    echo "Updating references in $dir/dist/..."
    find "$dir/dist" -type f \( -name '*.js' -o -name '*.mjs' -o -name '*.cjs' -o -name '*.d.ts' -o -name '*.json' \) \
      -exec sed -i "s|@internal/|${PUBLIC_SCOPE}/|g" {} +
  fi
done

echo "Release preparation complete."
