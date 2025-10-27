#!/usr/bin/env python3
"""
Builds portraits/portraits.json from files named <Name>-YYYY-MM-DD.<ext>.

- Groups by lowercase pet name ("ava", "winston", ...)
- Keeps multiple entries per pet (sorted by date)
- Outputs: portraits/portraits.json

Run: python3 generate_portraits_manifest.py
Optional:
  --portraits-dir PATH   (default: ./portraits)
  --output PATH          (default: ./portraits/portraits.json)
  --dry-run              (show what would be written, don't modify file)
  --verbose              (print per-file parsing info)
"""

import argparse
import json
import os
import re
from datetime import datetime
from typing import Dict, List

FNAME_RE = re.compile(
    r"^(?P<name>[A-Za-z0-9]+)-(?P<date>\d{4}-\d{2}-\d{2})$"
)
ALLOWED_EXTS = {"jpg", "jpeg", "png", "webp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate portraits manifest.")
    parser.add_argument(
        "--portraits-dir",
        default=os.path.join(os.getcwd(), "portraits"),
        help="Directory containing portrait images.",
    )
    parser.add_argument(
        "--output",
        default=os.path.join(os.getcwd(), "portraits", "portraits.json"),
        help="Output manifest path.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print resulting JSON but do not write file.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print per-file parse details.",
    )
    return parser.parse_args()


def is_allowed_file(filename: str) -> bool:
    ext = os.path.splitext(filename)[1][1:].lower()
    return ext in ALLOWED_EXTS


def parse_filename(filename: str):
    """
    Return (name_key, date_str) from '<Name>-YYYY-MM-DD.ext'
    or (None, None) if not matching.
    """
    stem, _ext = os.path.splitext(filename)
    m = FNAME_RE.match(stem)
    if not m:
        return None, None
    pet_raw = m.group("name")             # e.g. "Ava", "Winston2"
    date_str = m.group("date")            # e.g. "2025-08-03"
    # Validate date
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return None, None
    # Key is lowercase pet name
    key = pet_raw.lower()
    return key, date_str


def main():
    args = parse_args()
    portraits_dir = args.portraits_dir
    output_path = args.output
    verbose = args.verbose

    if not os.path.isdir(portraits_dir):
        raise SystemExit(f"Portraits directory not found: {portraits_dir}")

    manifest: Dict[str, List[Dict[str, str]]] = {}
    total = 0
    skipped = 0

    for fname in sorted(os.listdir(portraits_dir)):
        if fname.startswith("."):
            continue
        fpath = os.path.join(portraits_dir, fname)
        if not os.path.isfile(fpath):
            continue
        if not is_allowed_file(fname):
            if verbose:
                print(f"SKIP (ext): {fname}")
            skipped += 1
            continue

        key, date_str = parse_filename(fname)
        if key is None:
            if verbose:
                print(f"SKIP (pattern): {fname}")
            skipped += 1
            continue

        entry = {
            "date": date_str,
            "file": fname,
            "url": f"/portraits/{fname}",
            "previewUrl": f"/portraits/previews/{os.path.splitext(fname)[0]}-thumb.jpg"
        }
        
        manifest.setdefault(key, []).append(entry)
        total += 1
        if verbose:
            print(f"OK   {fname} -> key={key}, date={date_str}")

    # Sort each pet's entries by date ascending
    for k in manifest:
        manifest[k].sort(key=lambda e: e["date"])

    # Ensure output directory exists
    out_dir = os.path.dirname(output_path)
    os.makedirs(out_dir, exist_ok=True)

    if args.dry_run:
        print(json.dumps(manifest, indent=2))
        print(f"(dry-run) Would write {output_path} with {total} entries across {len(manifest)} pets.")
        return

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Wrote {output_path} with {total} entries across {len(manifest)} pets.")
    if skipped and verbose:
        print(f"Skipped {skipped} files (wrong pattern or extension).")


if __name__ == "__main__":
    main()
