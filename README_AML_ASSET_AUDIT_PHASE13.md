# AML 3.3 Phase 13 — Asset Reference & Orphan Audit

This phase does not change any page layout, typography, responsive behavior, or article content.

## Changes

- Extended `audit-aml-assets.mjs` to report exact duplicates, large assets, PNG originals that have matching WebP runtime copies, and zero-direct-reference candidates.
- Added 21 manually verified publication-source PNG files to `build-dist.mjs` exclusions. Both AML Publications and Sera.Phina Publications currently load the matching WebP versions.
- Updated `DELETE_FILES.txt` with the same source-original candidates for optional repository cleanup.

## Safety rule

The audit is intentionally read-only. Assets with zero direct references are **not** auto-deleted because some URLs can be constructed dynamically or used externally.
