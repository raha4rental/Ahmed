#!/usr/bin/env python3
"""Turn APP_STORE_CONNECT_PRIVATE_KEY into a PEM .p8 file.

Codemagic's Developer Portal integration often injects the uploaded .p8 as
a file path or as base64, not as PEM text. The CLI still needs PEM.
"""

from __future__ import annotations

import base64
import os
import re
import sys
import textwrap
from pathlib import Path


def _log(message: str) -> None:
    print(message, flush=True)


def _safe_prefix(value: str) -> str:
    chunk = value[:12].replace("\n", " ").replace("\r", " ")
    return "".join(ch if ch.isalnum() or ch in "-_./" else "." for ch in chunk)


def _read_if_path(value: str) -> str | None:
    candidate = value.strip()
    if not candidate or "\n" in candidate or len(candidate) > 512:
        return None
    if not candidate.startswith(("/", "~", "./")):
        return None
    path = Path(candidate).expanduser()
    try:
        if path.is_file() and path.stat().st_size > 0:
            _log(f"private key source: file ({path})")
            return path.read_text()
    except OSError:
        return None
    return None


def _b64_decode(value: str) -> bytes | None:
    compact = re.sub(r"\s+", "", value)
    if len(compact) < 80 or not re.fullmatch(r"[A-Za-z0-9+/_-]+=*", compact):
        return None
    pad = "=" * ((4 - len(compact) % 4) % 4)
    for decoder in (base64.b64decode, base64.urlsafe_b64decode):
        try:
            return decoder(compact + pad)
        except Exception:
            continue
    return None


def _wrap_der(der: bytes) -> str:
    body = base64.b64encode(der).decode("ascii")
    return (
        "-----BEGIN PRIVATE KEY-----\n"
        + "\n".join(textwrap.wrap(body, 64))
        + "\n-----END PRIVATE KEY-----\n"
    )


def _wrap_body(body: str) -> str:
    compact = re.sub(r"\s+", "", body)
    return (
        "-----BEGIN PRIVATE KEY-----\n"
        + "\n".join(textwrap.wrap(compact, 64))
        + "\n-----END PRIVATE KEY-----\n"
    )


def load_key_material(raw: str, *, allow_existing_asc: bool = True) -> str:
    raw = raw.strip().strip("\ufeff").strip('"').strip("'")
    raw = raw.replace("\r\n", "\n").replace("\\n", "\n").replace("\\r", "")

    from_file = _read_if_path(raw)
    if from_file is not None:
        raw = from_file.strip().replace("\r\n", "\n")

    if "BEGIN" in raw:
        _log("private key format: PEM")
        return raw if raw.endswith("\n") else raw + "\n"

    decoded = _b64_decode(raw)
    if decoded is not None:
        try:
            text = decoded.decode("utf-8")
        except UnicodeDecodeError:
            _log("private key format: base64 DER")
            return _wrap_der(decoded)
        text = text.strip().replace("\r\n", "\n").replace("\\n", "\n")
        if "BEGIN" in text:
            _log("private key format: base64 PEM")
            return text if text.endswith("\n") else text + "\n"
        compact = re.sub(r"\s+", "", text)
        if compact.startswith(("MIG", "MII")):
            _log("private key format: base64 PEM body")
            return _wrap_body(compact)

    compact = re.sub(r"\s+", "", raw)
    if compact.startswith(("MIG", "MII")) and len(compact) >= 80:
        _log("private key format: PEM body without headers")
        return _wrap_body(compact)

    if allow_existing_asc:
        key_id = os.environ.get("APP_STORE_CONNECT_KEY_IDENTIFIER", "").strip()
        for folder in (
            Path.home() / ".appstoreconnect/private_keys",
            Path.home() / "private_keys",
            Path("private_keys"),
        ):
            if not key_id:
                break
            existing = folder / f"AuthKey_{key_id}.p8"
            if existing.is_file() and existing.stat().st_size > 0:
                text = existing.read_text()
                if "BEGIN" in text:
                    _log(f"private key source: existing {existing}")
                    return text if text.endswith("\n") else text + "\n"

    _log(f"private key length: {len(raw)}")
    _log(f"private key prefix: {_safe_prefix(raw)}")
    raise SystemExit(
        "APP_STORE_CONNECT_PRIVATE_KEY is not a PEM .p8 key, file path, or base64 p8. "
        "Re-upload AuthKey_R46D76UXCH.p8 (or AuthKey_8LM6C7D787.p8) in Codemagic → "
        "Team integrations → Developer Portal → key name Ahmed."
    )


def write_key_files(pem: str, key_id: str) -> Path:
    folders = (
        Path.home() / ".appstoreconnect/private_keys",
        Path.home() / "private_keys",
        Path("private_keys"),
    )
    primary: Path | None = None
    for folder in folders:
        folder.mkdir(parents=True, exist_ok=True)
        path = folder / f"AuthKey_{key_id}.p8"
        path.write_text(pem)
        path.chmod(0o600)
        _log(f"wrote {path}")
        if primary is None:
            primary = path
    assert primary is not None
    return primary


def persist_env(asc_file: Path, cert_file: Path | None) -> None:
    cm_env = os.environ.get("CM_ENV")
    if not cm_env:
        return
    with open(cm_env, "a", encoding="utf-8") as handle:
        handle.write(f"APP_STORE_CONNECT_PRIVATE_KEY_FILE={asc_file}\n")
        if cert_file is not None:
            handle.write(f"CERTIFICATE_PRIVATE_KEY_FILE={cert_file}\n")
    _log(f"persisted key file path to {cm_env}")


def _cert_env() -> str:
    for name in (
        "CERTIFICATE_PRIVATE_KEY",
        "IOS_CERTIFICATE_PRIVATE_KEY",
        "CERTIFICATE_KEY",
        "APP_STORE_CONNECT_CERTIFICATE_PRIVATE_KEY",
    ):
        value = os.environ.get(name, "").strip()
        if value:
            _log(f"certificate private key source: ${name}")
            return value
    return ""


def generate_distribution_key() -> str:
    try:
        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.primitives.asymmetric import rsa

        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        pem = key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        ).decode("ascii")
    except Exception:
        import subprocess
        import tempfile

        with tempfile.TemporaryDirectory() as tmp:
            key_path = Path(tmp) / "key.pem"
            subprocess.run(
                ["openssl", "genpkey", "-algorithm", "RSA", "-pkeyopt", "rsa_keygen_bits:2048", "-out", str(key_path)],
                check=True,
                capture_output=True,
            )
            pem = key_path.read_text()
    _log("generated ephemeral Apple Distribution private key for this build")
    return pem if pem.endswith("\n") else pem + "\n"


def _asc_token(pem: str, key_id: str, issuer: str) -> str:
    import time

    import jwt

    now = int(time.time())
    token = jwt.encode(
        {"iss": issuer, "iat": now, "exp": now + 19 * 60, "aud": "appstoreconnect-v1"},
        pem,
        algorithm="ES256",
        headers={"kid": key_id, "typ": "JWT"},
    )
    return token.decode() if isinstance(token, bytes) else token


def _asc_json(token: str, method: str, path: str):
    import json
    import urllib.error
    import urllib.request

    request = urllib.request.Request(
        "https://api.appstoreconnect.apple.com" + path,
        method=method,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode()
        try:
            body = json.loads(raw)
        except json.JSONDecodeError:
            body = {"raw": raw[:2000]}
        return exc.code, body


def free_distribution_slot(asc_pem: str, key_id: str, issuer: str) -> None:
    """Revoke the Ahmed Codemagic distribution cert if Apple is at the 3-cert cap."""
    token = _asc_token(asc_pem, key_id, issuer)
    status, payload = _asc_json(token, "GET", "/v1/certificates?limit=200")
    if status >= 400:
        _log(f"could not list certificates ({status}); continuing")
        return
    dist = [
        item
        for item in payload.get("data") or []
        if item.get("attributes", {}).get("certificateType") in {"DISTRIBUTION", "IOS_DISTRIBUTION"}
    ]
    _log(f"Apple Distribution certificates on the team: {len(dist)}")
    if len(dist) < 3:
        return

    keep = {"63KM3JAQH9", "ZTM862GWBT"}
    revoke_ids = ["JRU86YL2BU"]
    status, profiles = _asc_json(token, "GET", "/v1/profiles?limit=200")
    if status < 400:
        for profile in profiles.get("data") or []:
            name = profile.get("attributes", {}).get("name") or ""
            if "Ahmed App Store Codemagic" not in name:
                continue
            pid = profile["id"]
            certs_status, certs = _asc_json(token, "GET", f"/v1/profiles/{pid}/certificates")
            if certs_status >= 400:
                continue
            for cert in certs.get("data") or []:
                revoke_ids.append(cert["id"])

    seen: set[str] = set()
    for cert_id in revoke_ids:
        if cert_id in seen or cert_id in keep:
            continue
        seen.add(cert_id)
        del_status, del_body = _asc_json(token, "DELETE", f"/v1/certificates/{cert_id}")
        if del_status in {200, 204}:
            _log(f"revoked distribution certificate {cert_id} to free a signing slot")
        else:
            _log(f"did not revoke {cert_id} ({del_status}): {str(del_body)[:300]}")


def write_named(pem: str, filename: str) -> Path:
    folders = (
        Path.home() / ".appstoreconnect/private_keys",
        Path.home() / "private_keys",
        Path("private_keys"),
    )
    primary: Path | None = None
    for folder in folders:
        folder.mkdir(parents=True, exist_ok=True)
        path = folder / filename
        path.write_text(pem)
        path.chmod(0o600)
        _log(f"wrote {path}")
        if primary is None:
            primary = path
    assert primary is not None
    return primary


def main() -> int:
    raw = os.environ.get("APP_STORE_CONNECT_PRIVATE_KEY", "")
    if not raw.strip():
        _log("App Store Connect .p8 is missing in this build.")
        _log("Codemagic → Team integrations → Developer Portal: key name must be exactly: Ahmed")
        return 1

    key_id = os.environ.get("APP_STORE_CONNECT_KEY_IDENTIFIER", "").strip() or "unknown"
    issuer = os.environ.get("APP_STORE_CONNECT_ISSUER_ID", "").strip() or "missing"
    _log(f"Issuer: {issuer}")
    _log(f"Key ID: {key_id}")
    _log("Private key: present")

    pem = load_key_material(raw)
    if "BEGIN" not in pem:
        raise SystemExit("normalized App Store Connect key is still not PEM")
    key_file = write_key_files(pem, key_id)

    cert_raw = _cert_env()
    generated = False
    if cert_raw:
        _log("Certificate private key: present")
        cert_pem = load_key_material(cert_raw, allow_existing_asc=False)
    else:
        _log("CERTIFICATE_PRIVATE_KEY is not in this build — generating one for signing.")
        _log("Optional later: Codemagic → Ahmed → Environment variables → group appstore_credentials")
        _log("Add secret CERTIFICATE_PRIVATE_KEY to keep the same distribution certificate.")
        cert_pem = generate_distribution_key()
        generated = True
        if key_id != "unknown" and issuer != "missing":
            try:
                free_distribution_slot(pem, key_id, issuer)
            except Exception as exc:
                _log(f"certificate slot cleanup skipped: {exc}")

    if "BEGIN" not in cert_pem:
        raise SystemExit("normalized CERTIFICATE_PRIVATE_KEY is still not PEM")
    cert_file = write_named(cert_pem, "ios_distribution.pem")
    persist_env(key_file, cert_file)
    if generated:
        _log("Ephemeral signing key is ready; fetch-signing-files --create will issue a matching certificate")
    else:
        _log("App Store Connect and signing certificate keys look usable")
    return 0


if __name__ == "__main__":
    sys.exit(main())
