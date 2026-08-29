# Coupang Review → KFood Queens Research

Purpose: when KFood ingredient research selects a Coupang product, collect public visible review signals by bounded auto-scroll, save a Queens JSON artifact, then promote only analyzed signals into Seed.

## Trigger

Open a Coupang product page with the fragment:

`#kfood-queens-scan`

Example flow:

`ingredient selected → product URL + #kfood-queens-scan → bounded review auto-scroll → JSON download → Drive sync → Queens research → Seed qualification → 53_FOOD_RECIPE_ASSET_MAP`

## Collection rules

- Public visible review UI only.
- No login automation.
- No CAPTCHA/anti-bot bypass.
- No reviewer name/account/profile collection.
- Short review-body snippets only; do not archive full review pages.
- Bounded scroll: max 18 rounds and 120 samples.
- Stop early when no new review samples are observed for 4 rounds.
- Store source URL and captured-at timestamp for freshness/lineage.

## Queens output

The extension downloads:

`KFood_Queens/Coupang/KFOOD_QUEENS_COUPANG_<productId>_<timestamp>.json`

The JSON contains:

- product id/url
- capture time
- sample count
- recurring signal clusters: taste, value, freshness, packaging, delivery, cooking/use cases, texture, repurchase
- short evidence snippets
- policy flags
- next-stage route

## Promotion rule

A review bundle is Queens evidence, not a Seed by itself. Promote to Seed only after:

1. duplicate/advertising/noise filtering,
2. repeated-signal clustering,
3. source freshness check,
4. ingredient/product identity match,
5. practical value extraction such as taste, failures, storage, actual use, price/value, recipe reuse,
6. cross-check against product facts and other sources when a claim is safety- or nutrition-sensitive.

Never promote a single review as fact. Runtime completion requires actual local extension execution + JSON file + Drive readback + Queens ingest twice.
