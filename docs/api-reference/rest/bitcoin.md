---
title: Bitcoin Data REST Endpoints
sidebar_label: Bitcoin Data
sidebar_position: 4
description: REST endpoints for Bitcoin price data, address balances, UTXOs, and history.
---

# Bitcoin Data REST Endpoints

Query Bitcoin price data, balances, and market information.

## Bitcoin Price Endpoints

These endpoints provide real-time Bitcoin price data from Uniswap V3 WBTC/USDC pool.

### get-bitcoin-price

Get the current Bitcoin price in USD.

**Endpoint:** `POST /get-bitcoin-price`

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-bitcoin-price \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

### get-bitcoin-market-weekly

Get 52-week high/low and current price data.

**Endpoint:** `POST /get-bitcoin-market-weekly`

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-bitcoin-market-weekly \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

### get-bitcoin-markets

Get market summary with volume and trust score.

**Endpoint:** `POST /get-bitcoin-markets`

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-bitcoin-markets \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

### get-bitcoin-market-chart

Get historical price data.

**Endpoint:** `POST /get-bitcoin-market-chart`

**Parameters:**

- `days` (string) - Number of days of data ("1", "7", "30", "365")

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-bitcoin-market-chart \
  -H "Content-Type: application/json" \
  -d '{"days": "30"}'
```

---

## Balance & UTXO Endpoints

### get-address-balance

Get BTC balance for an address.

**Endpoint:** `POST /get-address-balance`

**Parameters:**

- `address` (string) - Bitcoin address

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-address-balance \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p..."}'
```

---

### get-taproot-balance

Get balance for a taproot address.

**Endpoint:** `POST /get-taproot-balance`

**Parameters:**

- `address` (string) - Taproot address (bc1p...)

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-taproot-balance \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p..."}'
```

---

### get-address-utxos

Get UTXOs for an address.

**Endpoint:** `POST /get-address-utxos`

**Parameters:**

- `address` (string) - Bitcoin address

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-address-utxos \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p..."}'
```

---

### get-account-utxos

Get UTXOs for an account (all addresses).

**Endpoint:** `POST /get-account-utxos`

**Parameters:**

- `account` (string) - Account identifier

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-account-utxos \
  -H "Content-Type: application/json" \
  -d '{"account": "your-account-id"}'
```

---

### get-account-balance

Get total balance for an account.

**Endpoint:** `POST /get-account-balance`

**Parameters:**

- `account` (string) - Account identifier

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-account-balance \
  -H "Content-Type: application/json" \
  -d '{"account": "your-account-id"}'
```

---

### get-taproot-history

Get transaction history for a taproot address.

**Endpoint:** `POST /get-taproot-history`

**Parameters:**

- `taprootAddress` (string) - Taproot address
- `totalTxs` (number) - Maximum transactions to return

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-taproot-history \
  -H "Content-Type: application/json" \
  -d '{"taprootAddress": "bc1p...", "totalTxs": 50}'
```

---

### get-intent-history

Get intent history for an address.

**Endpoint:** `POST /get-intent-history`

**Parameters:**

- `address` (string) - Bitcoin address
- `limit` (number, optional) - Maximum results
- `page` (number, optional) - Page number

Example request:

```bash
curl -X POST https://mainnet.subfrost.io/v4/api/get-intent-history \
  -H "Content-Type: application/json" \
  -d '{"address": "bc1p...", "limit": 20}'
```

---

## JavaScript Example

```javascript
class BitcoinClient {
  constructor(network = 'mainnet') {
    this.baseUrl = `https://${network}.subfrost.io/v4/api`;
  }

  async post(endpoint, body = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.statusCode !== 200) throw new Error(data.error);
    return data.data;
  }

  async getPrice() {
    const data = await this.post('/get-bitcoin-price');
    return data.bitcoin.usd;
  }

  async getMarketData() {
    return this.post('/get-bitcoin-market-weekly');
  }

  async getPriceHistory(days = '7') {
    return this.post('/get-bitcoin-market-chart', { days });
  }
}

// Usage
const btc = new BitcoinClient();

const price = await btc.getPrice();
console.log(`Current BTC price: $${price.toLocaleString()}`);

const { market_data } = await btc.getMarketData();
console.log(`52-week high: $${market_data.high_52w.usd.toLocaleString()}`);
console.log(`52-week low: $${market_data.low_52w.usd.toLocaleString()}`);

const history = await btc.getPriceHistory('30');
console.log(`Got ${history.prices.length} price points`);
```

## Response Formats

### get-bitcoin-price Response

```json
{
  "statusCode": 200,
  "data": {
    "bitcoin": {
      "usd": 97500.25
    }
  }
}
```

### get-bitcoin-market-weekly Response

```json
{
  "statusCode": 200,
  "data": {
    "market_data": {
      "current_price": { "usd": 97500.25 },
      "high_52w": { "usd": 135000.00 },
      "low_52w": { "usd": 42000.00 }
    }
  }
}
```

### get-bitcoin-markets Response

```json
{
  "statusCode": 200,
  "data": [
    {
      "base": "BTC",
      "target": "USD",
      "name": "Uniswap V3 (WBTC/USDC)",
      "last": 97500.25,
      "volume": 45000000000,
      "trust_score": "green"
    }
  ]
}
```

### get-bitcoin-market-chart Response

```json
{
  "statusCode": 200,
  "data": {
    "prices": [[1699123456000, 97500.25], ...],
    "market_caps": [[1699123456000, 1900000000000], ...],
    "total_volumes": [[1699123456000, 45000000000], ...]
  }
}
```
