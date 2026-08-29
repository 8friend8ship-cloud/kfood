# KFood regional commerce routing

Goal: when a visitor opens a food/ingredient tag, compare approved affiliate marketplaces plus nearby local-store discovery, and recommend only an offer whose price and destination delivery are actually verified.

## Account evidence / runtime gates

- Coupang Partners: account evidence shows final approval and API availability. Runtime API credential binding is still a separate server-side step. Payment-information completion is operationally separate from API use.
- Amazon Associates: affiliate linking may use the configured Associate tag. Amazon Creators API is used only if the account is eligible and OAuth credentials are configured. Do not use deprecated PA-API 5.
- AliExpress Affiliate: partner/Portals correspondence confirms affiliate-program participation. API/deep-link credentials must still be verified before automated affiliate-link generation.

No partner secret, OAuth secret, API access key, or account cookie is exposed to the browser.

## Front flow

`food tag open → coarse visitor country → existing granted geolocation (no surprise prompt) → /api/commerce/offers → Coupang/AliExpress/Amazon adapters → nearby Google Maps search → rank only verified-deliverable offers → show recommendation`

If precise geolocation has not already been granted, the UI stays country-level. The visitor can explicitly tap **내 주변으로 다시 비교** to grant location and re-run the comparison.

## Recommendation rule

An offer can receive the **추천** badge only when all are true:

1. price is a live/provider-verified value,
2. destination delivery is `DELIVERABLE`,
3. the comparable total or unit cost is numeric,
4. the source has a fresh verification timestamp.

`UNKNOWN` delivery is never silently treated as deliverable. A stale stored price can remain visible as a fallback but cannot win the recommendation.

## Server environment

### Amazon Creators API

- `AMAZON_ASSOCIATE_TAG`
- `AMAZON_CREATORS_CLIENT_ID`
- `AMAZON_CREATORS_CLIENT_SECRET`
- `AMAZON_CREATORS_TOKEN_ENDPOINT` (optional, defaults to NA endpoint)
- `AMAZON_MARKETPLACE` (optional, defaults to `www.amazon.com`)

### Coupang provider bridge

- `COUPANG_COMMERCE_PROXY_URL`
- `COUPANG_COMMERCE_PROXY_TOKEN` (optional)

The proxy must return normalized `offers[]` with live price and destination delivery evidence. It is the correct place for Coupang Partners access/secret key signing so secrets never enter React.

### AliExpress provider bridge

- `ALIEXPRESS_COMMERCE_PROXY_URL`
- `ALIEXPRESS_COMMERCE_PROXY_TOKEN` (optional)

The proxy should use approved AliExpress Affiliate/Portals API or deep-link facilities only after credential/API access is verified.

## Local map

Nearby-store discovery uses a Google Maps search link and browser-granted coordinates when available. It is discovery evidence only: a map result does not imply a verified price or delivery promise.

## Review research loop

The Coupang review Queens adapter remains separate from commerce ranking:

`selected ingredient/product → bounded public-review collection → Drive JSON → Queens clustering → Seed qualification → recipe/value graph`

Review sentiment may affect suitability/use-case scoring, but never overrides live price/delivery facts and never turns a single review into a product fact.
