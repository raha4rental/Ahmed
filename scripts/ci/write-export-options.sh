#!/usr/bin/env bash
# Write ExportOptions.plist for the Xcode on this Mac.
# Xcode 15+ renamed method "app-store" to "app-store-connect".
set -euo pipefail

ROOT="${CM_BUILD_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
OUT="${1:-$ROOT/ios/ExportOptions.plist}"
METHOD="app-store"

if command -v xcodebuild >/dev/null 2>&1; then
  VER="$(xcodebuild -version 2>/dev/null | awk '/Xcode/ {print $2; exit}')"
  MAJOR="${VER%%.*}"
  echo "Xcode ${VER:-unknown}"
  if [ -n "${MAJOR}" ] && [ "${MAJOR}" -ge 15 ] 2>/dev/null; then
    METHOD="app-store-connect"
  fi
fi

mkdir -p "$(dirname "$OUT")"
cat > "$OUT" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>method</key>
	<string>${METHOD}</string>
	<key>teamID</key>
	<string>VPT9SWM94A</string>
	<key>signingStyle</key>
	<string>manual</string>
	<key>signingCertificate</key>
	<string>Apple Distribution</string>
	<key>provisioningProfiles</key>
	<dict>
		<key>com.darraha.ahmed</key>
		<string>Ahmed App Store Codemagic</string>
	</dict>
	<key>compileBitcode</key>
	<false/>
	<key>stripSwiftSymbols</key>
	<true/>
	<key>uploadSymbols</key>
	<true/>
	<key>destination</key>
	<string>export</string>
	<key>manageAppVersionAndBuildNumber</key>
	<false/>
</dict>
</plist>
EOF

echo "Wrote $OUT (method=$METHOD)"
