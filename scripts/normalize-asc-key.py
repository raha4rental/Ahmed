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
        "Re-upload AuthKey_8LM6C7D787.p8 in Codemagic → "
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


def bundled_distribution_key() -> str | None:
    for path in (
        Path(__file__).resolve().parent / "ci" / "ios_distribution.key",
        Path("scripts/ci/ios_distribution.key"),
    ):
        try:
            if path.is_file() and path.stat().st_size > 0:
                text = path.read_text().strip().replace("\r\n", "\n")
                if "BEGIN" in text:
                    _log(f"certificate private key source: bundled {path}")
                    return text if text.endswith("\n") else text + "\n"
        except OSError:
            continue
    return None


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
    if cert_raw:
        cert_pem = load_key_material(cert_raw, allow_existing_asc=False)
    else:
        bundled = bundled_distribution_key()
        if not bundled:
            _log("CERTIFICATE_PRIVATE_KEY is missing and scripts/ci/ios_distribution.key was not found.")
            return 1
        cert_pem = bundled

    if "BEGIN" not in cert_pem:
        raise SystemExit("signing certificate private key is still not PEM")
    cert_file = write_named(cert_pem, "ios_distribution.pem")
    persist_env(key_file, cert_file)
    _log("App Store Connect and signing certificate keys look usable")
    return 0


if __name__ == "__main__":
    sys.exit(main())
