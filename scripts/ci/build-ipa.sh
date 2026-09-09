#!/usr/bin/env bash
# Archive and export the App Store IPA. Used by GitHub Actions and Codemagic.
set -euo pipefail

ROOT="${CM_BUILD_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
APP_DIR="$ROOT/ios/App"
WS="$APP_DIR/App.xcworkspace"
PROJ="$APP_DIR/App.xcodeproj"
ARCHIVE="$ROOT/build/ios/xcarchive/App.xcarchive"
IPA_DIR="$ROOT/build/ios/ipa"
EXPORT="$ROOT/ios/ExportOptions.plist"
SCHEME_SRC="$PROJ/xcshareddata/xcschemes/App.xcscheme"
SCHEME_WS="$WS/xcshareddata/xcschemes/App.xcscheme"

mkdir -p "$(dirname "$ARCHIVE")" "$IPA_DIR" "$(dirname "$SCHEME_WS")"
if [ -f "$SCHEME_SRC" ]; then
  cp "$SCHEME_SRC" "$SCHEME_WS"
fi

cd "$APP_DIR"

echo "Xcode $(xcodebuild -version | tr '\n' ' ')"
echo "Working directory: $PWD"
ls -la App.xcworkspace App.xcodeproj/xcshareddata/xcschemes App.xcworkspace/xcshareddata/xcschemes 2>/dev/null || true
echo "--- identities ---"
security find-identity -v -p codesigning || true
echo "--- schemes ---"
xcodebuild -workspace App.xcworkspace -list || xcodebuild -project App.xcodeproj -list

echo "Archiving App (Release) for iOS"
xcodebuild \
  -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -destination "generic/platform=iOS" \
  -archivePath "$ARCHIVE" \
  DEVELOPMENT_TEAM=VPT9SWM94A \
  CODE_SIGN_STYLE=Manual \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  PROVISIONING_PROFILE_SPECIFIER="Ahmed App Store Codemagic" \
  COMPILER_INDEX_STORE_ENABLE=NO \
  archive

echo "Exporting IPA"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportPath "$IPA_DIR" \
  -exportOptionsPlist "$EXPORT"

echo "IPA output:"
ls -lh "$IPA_DIR"
