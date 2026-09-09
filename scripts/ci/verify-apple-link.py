#!/usr/bin/env python3
"""Prove the Codemagic API key can see السعدي in App Store Connect."""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

APP_ID = os.environ.get("APP_STORE_APPLE_ID", "6810042737").strip()
BUNDLE_ID = os.environ.get("BUNDLE_ID", "com.darraha.ahmed").strip()
ISSUER = os.environ.get("APP_STORE_CONNECT_ISSUER_ID", "").strip()
KEY_ID = os.environ.get("APP_STORE_CONNECT_KEY_IDENTIFIER", "").strip()


def _key_pem() -> str:
    env_file = os.environ.get("APP_STORE_CONNECT_PRIVATE_KEY_FILE", "").strip()
    candidates = []
    if env_file:
        candidates.append(Path(env_file))
    if KEY_ID:
        candidates.extend(
            [
                Path.home() / ".appstoreconnect/private_keys" / f"AuthKey_{KEY_ID}.p8",
                Path.home() / "private_keys" / f"AuthKey_{KEY_ID}.p8",
                Path("private_keys") / f"AuthKey_{KEY_ID}.p8",
            ]
        )
    candidates.append(Path(__file__).resolve().parent / "AuthKey_8LM6C7D787.key")
    for path in candidates:
        if path.is_file() and path.stat().st_size > 0:
            text = path.read_text().strip()
            if "BEGIN" in text:
                return text if text.endswith("\n") else text + "\n"
    raw = os.environ.get("APP_STORE_CONNECT_PRIVATE_KEY", "").strip()
    if "BEGIN" in raw:
        return raw if raw.endswith("\n") else raw + "\n"
    raise SystemExit("No App Store Connect .p8 key found")


def _token(pem: str) -> str:
    try:
        import jwt
    except ImportError as exc:
        raise SystemExit("PyJWT is required to talk to App Store Connect") from exc
    now = int(time.time())
    token = jwt.encode(
        {"iss": ISSUER, "iat": now, "exp": now + 19 * 60, "aud": "appstoreconnect-v1"},
        pem,
        algorithm="ES256",
        headers={"kid": KEY_ID, "typ": "JWT"},
    )
    return token.decode() if isinstance(token, bytes) else token


def _get(token: str, path: str) -> dict:
    url = "https://api.appstoreconnect.apple.com" + path
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")
        raise SystemExit(f"Apple API {exc.code} for {path}: {body[:800]}") from exc


def main() -> int:
    if not ISSUER or not KEY_ID:
        raise SystemExit("APP_STORE_CONNECT_ISSUER_ID / KEY_IDENTIFIER are missing")
    pem = _key_pem()
    token = _token(pem)
    query = urllib.parse.urlencode({"filter[bundleId]": BUNDLE_ID})
    apps = _get(token, f"/v1/apps?{query}")
    rows = apps.get("data") or []
    if not rows:
        raise SystemExit(f"API key {KEY_ID} cannot see bundle {BUNDLE_ID}")
    app = rows[0]
    name = (app.get("attributes") or {}).get("name")
    found_id = app.get("id")
    print(f"Apple app: {name} ({found_id})")
    print(f"Bundle: {BUNDLE_ID}")
    print(f"API key: {KEY_ID}")
    if found_id != APP_ID:
        raise SystemExit(f"Expected Apple ID {APP_ID}, got {found_id}")
    builds = _get(token, f"/v1/builds?filter[app]={APP_ID}&limit=5")
    count = len(builds.get("data") or [])
    print(f"Current App Store Connect iOS builds: {count}")
    if count == 0:
        print("No IPA on Apple yet. This workflow will upload the next successful IPA to TestFlight.")
    else:
        for build in builds["data"]:
            attrs = build.get("attributes") or {}
            print(
                "  build",
                attrs.get("version"),
                attrs.get("processingState"),
                attrs.get("uploadedDate"),
            )
    print("Codemagic is linked to App Store Connect for السعدي.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
