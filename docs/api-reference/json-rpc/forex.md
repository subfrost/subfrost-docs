---
title: Foreign Exchange (Fiat)
sidebar_label: Foreign Exchange
sidebar_position: 9
description: forex_* methods for fiat exchange rates and conversions, returned as decimal strings with explicit missing currencies.
---

# Foreign Exchange (Fiat)

Fiat exchange rates, so you can price and compare things quoted in different
currencies against one unit, e.g. rank a listing priced in **BRL** against one
priced in **USD**. Rates are returned as **decimal strings**, and any currency
the service cannot price right now is reported explicitly rather than guessed.

## Endpoint

```
POST https://mainnet.subfrost.io/v4/YOUR_API_KEY/forex
```

Authentication is the same as the rest of the platform: the API key is a path
segment (see [Authentication](../getting-started/authentication)). It is JSON-RPC 2.0 over
`POST`, like the other `/v4/YOUR_API_KEY` methods.

## Rates are decimal strings: do not parse them as numbers

Every rate, amount and result is a JSON **string** holding a decimal value:

```json
{ "EUR": "0.8604", "JPY": "154.324", "VND": "25914.61415083" }
```

This is deliberate. If you `JSON.parse` a rate straight into a float you have
already lost precision before you do any math with it. **Keep rates as strings
and feed them to a decimal library** (`BigDecimal`, `decimal.js`, Python
`Decimal`, Rust `rust_decimal`, …). Do your multiplication, division and
rounding there. On the way in, `amount` may be sent as a decimal string (a plain
JSON number is also accepted); on the way out everything is a string.

## Methods

| Method | Purpose |
|--------|---------|
| `forex_rates` | Rates for one base currency against a set of quote currencies |
| `forex_convert` | Convert an amount from one currency to another |
| `forex_status` | How fresh the data is and which currencies are covered |
| `forex_currencies` | The currencies this deployment covers |

### `forex_rates`

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "forex_rates",
  "params": {
    "base": "USD",
    "quotes": ["EUR", "GBP", "JPY", "BRL", "NGN"],
    "provenance": true
  }
}
```

- **`base`**: the currency the rates are expressed *per*. Defaults to `USD`.
- **`quotes`**: the currencies you want a rate for. Omit to get everything covered.
- **`provenance`**: optional; set `true` to include a per-currency provenance
  block. Off by default.

Response (`result`):

```json
{
  "base": "USD",
  "rates": { "EUR": "0.8604", "GBP": "0.7395", "JPY": "154.324", "BRL": "5.0969" },
  "missing": ["NGN"],
  "missing_reasons": { "NGN": "no_quotes" },
  "age_seconds_by_currency": { "EUR": 64, "GBP": 64, "JPY": 20, "BRL": 21 },
  "as_of": "2026-09-10T16:57:19Z",
  "as_of_unix": 1789059439,
  "stale": false
}
```

What each field means for pricing:

- **`rates`**: `{ CCY: "decimal" }`, the amount of `CCY` per **1 unit of `base`**.
  With `base: "USD"`, `EUR: "0.8604"` means 0.8604 EUR buys per 1 USD. To go the
  other way (USD per 1 EUR) invert it (`1 / 0.8604`) **in your decimal
  library**, not as a float. The base's own rate is `"1"`.
- **`missing`**: currencies that could **not** be priced right now. A currency
  here is **absent from `rates`** and you should treat it as *no price
  available*: surface that to the user, do **not** substitute a stale value or
  invent one. This is the whole contract: a rate you get back is one the service
  stands behind; anything it is unsure about is named in `missing` instead.
- **`missing_reasons`**: optional short reason per missing currency.
- **`age_seconds_by_currency`**: how old each returned rate is, in seconds.
  Apply your own staleness policy **per currency** with this, because different
  currencies can have different ages, so a single global age is the wrong thing
  to gate on. (The base currency has no entry: its rate is the constant `"1"`.)
- **`as_of` / `as_of_unix`**: timestamp of the freshest rate in the response.
- **`stale`**: `true` if even the freshest rate is older than the deployment's
  staleness threshold. A quick "should I trust this at all" flag.
- **`provenance`**: present only when you asked for it; a per-currency block you
  can log or display for transparency. Not needed to consume the rates.

### `forex_convert`

Convert a specific amount between two currencies in one call:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "forex_convert",
  "params": { "from": "USD", "to": "BRL", "amount": "100" }
}
```

Returns a `result` decimal string plus the same freshness fields. Unlike
`forex_rates`, `forex_convert` **errors** if it cannot price the pair. A
conversion has no partial answer, so there is no `missing` list here; handle the
JSON-RPC error and show "price unavailable".

### `forex_status` and `forex_currencies`

`forex_status` reports overall freshness (`age_seconds`, `stale`, `as_of`) and
which currencies are `available`; it does not error on data state, so it is safe
to poll as a health check. `forex_currencies` returns the coverage lists
(`available`, `currencies`, `default_base`, `missing`); call it to discover what
a deployment can price before you request rates.

## Currencies covered

This deployment covers:

```
USD  EUR  GBP  JPY  CNY  INR  CAD  AUD  CHF  BRL
MXN  ARS  NGN  ZAR  TRY  RUB  KRW  IDR  PHP  VND
```

Anything outside this set comes back in `missing` rather than as a rate. Use
`forex_currencies` if you want to read the list programmatically instead of
hard-coding it.

## Pricing checklist

- Keep every rate/amount/result as a **decimal string**; do the math in a decimal
  library; never round-trip through a float.
- Treat a currency in **`missing`** as *no price*; never fill it in yourself.
- Rates are **units per base**; invert (in decimal) if you need the other
  direction.
- Gate on **`age_seconds_by_currency`** (and `stale`) before trusting a rate for
  a quote, and decide freshness per currency, not globally.
