#!/usr/bin/env python3
"""Write ios/ExportOptions.plist as a real XML property list.

Codemagic's `xcode-project build-ipa` uses plistlib and rejects files that
are not valid plists. Keep `method` as `app-store` (not `app-store-connect`)
so that parser accepts it; Apple still treats this as an App Store IPA.
"""
from __future__ import annotations

import plistlib
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "ios" / "ExportOptions.plist"

payload = {
    "method": "app-store",
    "signingStyle": "manual",
    "signingCertificate": "Apple Distribution",
    "teamID": "VPT9SWM94A",
    "compileBitcode": False,
    "stripSwiftSymbols": True,
    "uploadSymbols": True,
    "destination": "export",
    "manageAppVersionAndBuildNumber": False,
    "provisioningProfiles": {
        "com.darraha.ahmed": "Ahmed App Store Codemagic",
    },
}

OUT.parent.mkdir(parents=True, exist_ok=True)
with OUT.open("wb") as handle:
    plistlib.dump(payload, handle, fmt=plistlib.FMT_XML)

# Fail fast if Codemagic's parser would reject this file.
with OUT.open("rb") as handle:
    loaded = plistlib.load(handle)
if loaded.get("method") != "app-store":
    sys.exit("ExportOptions.plist method must stay app-store")
print(f"Wrote valid ExportOptions.plist ({OUT})")
