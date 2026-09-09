#!/usr/bin/env bash
# Import the bundled Apple Distribution identity + App Store profile for Codemagic.
set -euo pipefail

ROOT="${CM_BUILD_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
CI="$ROOT/scripts/ci"
CERT_KEY="${CERTIFICATE_PRIVATE_KEY_FILE:-$HOME/.appstoreconnect/private_keys/ios_distribution.pem}"
if [ ! -f "$CERT_KEY" ]; then
  CERT_KEY="$CI/ios_distribution.key"
fi
CER="$CI/ios_distribution.cer"
PROFILE="$CI/Ahmed_App_Store_Codemagic.mobileprovision"
PASS="${P12_PASSWORD:-ahmed-ios-sign}"
WORK="${TMPDIR:-/tmp}/ahmed-sign-$$"
mkdir -p "$WORK"
trap 'rm -rf "$WORK"' EXIT

if command -v app-store-connect >/dev/null 2>&1 && [ -n "${APP_STORE_CONNECT_KEY_IDENTIFIER:-}" ]; then
  KEY_FILE="${APP_STORE_CONNECT_PRIVATE_KEY_FILE:-$HOME/.appstoreconnect/private_keys/AuthKey_${APP_STORE_CONNECT_KEY_IDENTIFIER}.p8}"
  if [ -f "$KEY_FILE" ] && [ -f "$CERT_KEY" ]; then
    echo "Fetching App Store signing files from Apple"
    app-store-connect fetch-signing-files com.darraha.ahmed \
      --type IOS_APP_STORE \
      --platform IOS \
      --issuer-id "${APP_STORE_CONNECT_ISSUER_ID:-c46c0b74-7d00-42b2-9786-333b76dacf91}" \
      --key-id "$APP_STORE_CONNECT_KEY_IDENTIFIER" \
      --private-key "@file:$KEY_FILE" \
      --certificate-key "@file:$CERT_KEY" \
      || echo "fetch-signing-files skipped; using bundled certificate and profile"
  fi
fi

if [ ! -f "$CERT_KEY" ]; then
  echo "Missing distribution private key: $CERT_KEY"
  exit 1
fi
if [ ! -f "$CER" ]; then
  echo "Missing distribution cert: $CER"
  exit 1
fi
if [ ! -f "$PROFILE" ]; then
  echo "Missing provisioning profile: $PROFILE"
  exit 1
fi

if grep -q "BEGIN CERTIFICATE" "$CER"; then
  cp "$CER" "$WORK/cert.pem"
else
  openssl x509 -inform DER -in "$CER" -out "$WORK/cert.pem"
fi

make_p12() {
  local out="$1"
  local mode="${2:-}"
  if [ "$mode" = "legacy" ]; then
    openssl pkcs12 -export \
      -legacy \
      -inkey "$CERT_KEY" \
      -in "$WORK/cert.pem" \
      -out "$out" \
      -passout "pass:$PASS" \
      -name "Apple Distribution: allaa shaikh (VPT9SWM94A)"
  else
    openssl pkcs12 -export \
      -inkey "$CERT_KEY" \
      -in "$WORK/cert.pem" \
      -out "$out" \
      -passout "pass:$PASS" \
      -name "Apple Distribution: allaa shaikh (VPT9SWM94A)"
  fi
}

P12="$WORK/ios_distribution.p12"
make_p12 "$P12"
if ! make_p12 "$WORK/ios_distribution-legacy.p12" legacy 2>/dev/null; then
  rm -f "$WORK/ios_distribution-legacy.p12"
fi

PROFILE_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
mkdir -p "$PROFILE_DIR"
cp "$PROFILE" "$PROFILE_DIR/93a6a9a2-d293-4e98-98c2-7aa74b08d3a7.mobileprovision"
cp "$PROFILE" "$PROFILE_DIR/Ahmed_App_Store_Codemagic.mobileprovision"
echo "Installed profile Ahmed App Store Codemagic (93a6a9a2-d293-4e98-98c2-7aa74b08d3a7)"

CERT_DIR="$HOME/Library/Developer/Xcode/UserData/Certificates"
mkdir -p "$CERT_DIR"
cp "$P12" "$CERT_DIR/ios_distribution.p12"

imported=0
for candidate in "$P12" "$WORK/ios_distribution-legacy.p12"; do
  [ -f "$candidate" ] || continue
  if keychain add-certificates \
      --certificate "$candidate" \
      --certificate-password "$PASS" \
      --allow-all-applications; then
    echo "Imported signing identity from $candidate"
    imported=1
    break
  fi
done

if [ "$imported" -ne 1 ]; then
  echo "keychain add-certificates failed for the bundled .p12"
  exit 1
fi

echo "--- code signing identities ---"
security find-identity -v -p codesigning || true
keychain list-certificates || true
echo "--- installed profiles ---"
ls -1 "$PROFILE_DIR"
