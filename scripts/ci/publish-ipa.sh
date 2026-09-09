#!/usr/bin/env bash
# Upload the IPA to App Store Connect so it appears under TestFlight / iOS Builds.
set -euo pipefail

ROOT="${CM_BUILD_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
KEY_ID="${APP_STORE_CONNECT_KEY_IDENTIFIER:-8LM6C7D787}"
ISSUER="${APP_STORE_CONNECT_ISSUER_ID:-c46c0b74-7d00-42b2-9786-333b76dacf91}"
KEY_FILE="${APP_STORE_CONNECT_PRIVATE_KEY_FILE:-$HOME/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8}"
APPLE_ID="${APP_STORE_APPLE_ID:-6810042737}"

if [ ! -f "$KEY_FILE" ]; then
  echo "Missing App Store Connect key: $KEY_FILE"
  exit 1
fi

IPA=""
for candidate in \
  "$ROOT/build/ios/ipa/"*.ipa \
  "$HOME/build/ios/ipa/"*.ipa \
  "$ROOT/ios/App/build/ios/ipa/"*.ipa
do
  if [ -f "$candidate" ]; then
    IPA="$candidate"
    break
  fi
done

if [ -z "$IPA" ]; then
  IPA="$(find "$ROOT" -name '*.ipa' -type f 2>/dev/null | head -n 1 || true)"
fi

if [ -z "$IPA" ] || [ ! -f "$IPA" ]; then
  echo "No IPA found. Archive/export did not produce a package to upload."
  ls -la "$ROOT/build/ios/ipa" 2>/dev/null || true
  exit 1
fi

echo "Uploading IPA to App Store Connect"
echo "  app: السعدي ($APPLE_ID)"
echo "  ipa: $IPA"
echo "  key: $KEY_ID"
ls -lh "$IPA"

publish_ok=0
for attempt in 1 2 3; do
  echo "Transporter attempt $attempt"
  if app-store-connect publish \
    --path "$IPA" \
    --issuer-id "$ISSUER" \
    --key-id "$KEY_ID" \
    --private-key "@file:$KEY_FILE" \
    --skip-package-validation \
    --altool-retries 3 \
    --max-build-processing-wait 20; then
    publish_ok=1
    break
  fi
  echo "Upload attempt $attempt failed; waiting before retry"
  sleep $((attempt * 20))
done

if [ "$publish_ok" -ne 1 ]; then
  echo "IPA upload failed after retries. Linking any build already on Apple."
fi

# Let yaml publishing run TestFlight Magic Actions without uploading twice.
if [ -n "${CM_ENV:-}" ]; then
  echo "APP_STORE_CONNECT_SKIP_PACKAGE_UPLOAD=true" >> "$CM_ENV"
  echo "Persisted APP_STORE_CONNECT_SKIP_PACKAGE_UPLOAD=true for Codemagic publishing"
fi

python3 "$ROOT/scripts/ci/link-build-to-version.py"

echo "IPA uploaded. After Apple processing the build appears in:"
echo "  https://appstoreconnect.apple.com/apps/${APPLE_ID}/testflight/ios"
echo "  https://appstoreconnect.apple.com/apps/${APPLE_ID}/appstore/ios/version/inflight"
