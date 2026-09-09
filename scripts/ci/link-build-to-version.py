#!/usr/bin/env python3
"""Wait for the uploaded IPA, then attach it to App Store version 1.0.1."""

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
VERSION_ID = os.environ.get(
    "APP_STORE_VERSION_ID", "5e020bab-0b6e-4012-951b-ff789f26be72"
).strip()
ISSUER = os.environ.get(
    "APP_STORE_CONNECT_ISSUER_ID", "c46c0b74-7d00-42b2-9786-333b76dacf91"
).strip()
KEY_ID = os.environ.get("APP_STORE_CONNECT_KEY_IDENTIFIER", "8LM6C7D787").strip()
WAIT_SECONDS = int(os.environ.get("APPLE_BUILD_WAIT_SECONDS", "1500"))
POLL_SECONDS = 30


def _key_pem() -> str:
    env_file = os.environ.get("APP_STORE_CONNECT_PRIVATE_KEY_FILE", "").strip()
    candidates = []
    if env_file:
        candidates.append(Path(env_file))
    candidates.extend(
        [
            Path.home() / ".appstoreconnect/private_keys" / f"AuthKey_{KEY_ID}.p8",
            Path.home() / "private_keys" / f"AuthKey_{KEY_ID}.p8",
            Path(__file__).resolve().parent / "AuthKey_8LM6C7D787.key",
        ]
    )
    for path in candidates:
        try:
            if path.is_file() and path.stat().st_size > 0:
                text = path.read_text().strip()
                if "BEGIN" in text:
                    return text if text.endswith("\n") else text + "\n"
        except OSError:
            continue
    raw = os.environ.get("APP_STORE_CONNECT_PRIVATE_KEY", "").strip()
    if "BEGIN" in raw:
        return raw if raw.endswith("\n") else raw + "\n"
    raise SystemExit("No App Store Connect .p8 key found")


def _token(pem: str) -> str:
    import jwt

    now = int(time.time())
    token = jwt.encode(
        {"iss": ISSUER, "iat": now, "exp": now + 19 * 60, "aud": "appstoreconnect-v1"},
        pem,
        algorithm="ES256",
        headers={"kid": KEY_ID, "typ": "JWT"},
    )
    return token.decode() if isinstance(token, bytes) else token


def _request(method: str, path: str, body: dict | None = None) -> dict:
    pem = _key_pem()
    token = _token(pem)
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        "https://api.appstoreconnect.apple.com" + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            raw = resp.read()
            return json.loads(raw.decode()) if raw else {}
    except urllib.error.HTTPError as exc:
        err = exc.read().decode("utf-8", "replace")
        raise SystemExit(f"Apple API {exc.code} {method} {path}: {err[:1200]}") from exc


def _builds() -> list[dict]:
    query = urllib.parse.urlencode(
        {
            "filter[app]": APP_ID,
            "sort": "-uploadedDate",
            "limit": "20",
        }
    )
    by_id: dict[str, dict] = {}
    payload = _request("GET", f"/v1/builds?{query}")
    for build in payload.get("data") or []:
        by_id[str(build.get("id"))] = build

    # Processing IPAs often show up on the pre-release version before /v1/builds.
    versions = _request("GET", f"/v1/apps/{APP_ID}/preReleaseVersions?limit=10")
    for version in versions.get("data") or []:
        vid = version.get("id")
        if not vid:
            continue
        related = _request("GET", f"/v1/preReleaseVersions/{vid}/builds")
        for build in related.get("data") or []:
            by_id[str(build.get("id"))] = build

    builds = list(by_id.values())
    builds.sort(
        key=lambda item: str((item.get("attributes") or {}).get("uploadedDate") or ""),
        reverse=True,
    )
    return builds


def _pick(builds: list[dict]) -> dict | None:
    """Newest uploaded build, even if Apple is still processing it."""
    return builds[0] if builds else None


def _link(build_id: str) -> None:
    _request(
        "PATCH",
        f"/v1/appStoreVersions/{VERSION_ID}/relationships/build",
        {"data": {"type": "builds", "id": build_id}},
    )


def main() -> int:
    deadline = time.time() + WAIT_SECONDS
    chosen = None
    while time.time() < deadline:
        builds = _builds()
        print(f"App Store Connect builds: {len(builds)}")
        for build in builds:
            attrs = build.get("attributes") or {}
            print(
                " ",
                build.get("id"),
                "version",
                attrs.get("version"),
                attrs.get("processingState"),
                attrs.get("uploadedDate"),
            )
        chosen = _pick(builds)
        if chosen and (chosen.get("attributes") or {}).get("processingState") == "VALID":
            break
        if not builds:
            print("No IPA on Apple yet. Waiting for processing…")
        else:
            print("Build is not VALID yet. Waiting…")
        time.sleep(POLL_SECONDS)

    if not chosen:
        print("Apple still has no iOS build. The IPA did not upload or is still invisible.")
        print("Check Codemagic / GitHub Actions for a failed archive or upload step.")
        return 1

    build_id = chosen["id"]
    attrs = chosen.get("attributes") or {}
    state = attrs.get("processingState")
    print(f"Using build {build_id} ({state}, CFBundleVersion={attrs.get('version')})")
    if state != "VALID":
        print("Build is not processed yet, so it cannot be attached to version 1.0.1.")
        print("It should still appear under TestFlight after Apple finishes processing:")
        print(f"  https://appstoreconnect.apple.com/apps/{APP_ID}/testflight/ios")
        return 0

    _link(build_id)
    print(f"Linked build {build_id} to App Store version 1.0.1")
    print(f"  https://appstoreconnect.apple.com/apps/{APP_ID}/appstore/ios/version/inflight")
    print(f"  https://appstoreconnect.apple.com/apps/{APP_ID}/testflight/ios")
    return 0


if __name__ == "__main__":
    sys.exit(main())
