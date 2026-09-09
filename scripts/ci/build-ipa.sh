#!/usr/bin/env bash
# Archive and export the App Store IPA. Used by GitHub Actions and Codemagic.
set -euo pipefail

ROOT="${CM_BUILD_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
WS="$ROOT/ios/App/App.xcworkspace"
PROJ="$ROOT/ios/App/App.xcodeproj"
ARCHIVE="$ROOT/build/ios/xcarchive/App.xcarchive"
IPA_DIR="$ROOT/build/ios/ipa"
EXPORT="$ROOT/ios/ExportOptions.plist"

mkdir -p "$(dirname "$ARCHIVE")" "$IPA_DIR"

echo "=== schemes ==="
if [ -f "$WS/contents.xcworkspacedata" ]; then
  xcodebuild -workspace "$WS" -list || true
else
  echo "Workspace data missing at $WS"
fi
xcodebuild -project "$PROJ" -list || true
ls -la "$PROJ/xcshareddata/xcschemes" || true
ls -la "$WS" || true
security find-identity -v -p codesigning || true

ARCHIVE_ARGS=(
  -scheme App
  -configuration Release
  -destination "generic/platform=iOS"
  -archivePath "$ARCHIVE"
  COMPILER_INDEX_STORE_ENABLE=NO
  DEVELOPMENT_TEAM=VPT9SWM94A
  CODE_SIGN_STYLE=Manual
  CODE_SIGN_IDENTITY="Apple Distribution"
  "CODE_SIGN_IDENTITY[sdk=iphoneos*]=Apple Distribution"
  PROVISIONING_PROFILE_SPECIFIER="Ahmed App Store Codemagic"
)

if [ -f "$WS/contents.xcworkspacedata" ] && [ -d "$ROOT/ios/App/Pods" ]; then
  echo "Archiving workspace $WS"
  xcodebuild -workspace "$WS" "${ARCHIVE_ARGS[@]}" archive
else
  echo "Archiving project $PROJ"
  xcodebuild -project "$PROJ" "${ARCHIVE_ARGS[@]}" archive
fi

echo "Exporting IPA"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportPath "$IPA_DIR" \
  -exportOptionsPlist "$EXPORT"

echo "IPA output:"
ls -lh "$IPA_DIR"
