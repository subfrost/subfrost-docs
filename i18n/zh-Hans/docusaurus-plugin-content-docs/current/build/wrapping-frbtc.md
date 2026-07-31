---
title: 包装 frBTC
sidebar_label: 包装 frBTC
sidebar_position: 4
description: 从 CLI 和 TypeScript 中把 BTC 包装为 frBTC，并将其解包回来。
---

# 包装 frBTC

**frBTC** 是 Alkanes 内部由 Bitcoin 支持的价值，与真实 BTC 保持 1:1 锚定（参见 [frBTC 锚定与托管](../protocol/frbtc-peg-and-custody)）。本页说明如何以编程方式对其进行包装与解包。frBTC 合约位于 Alkane ID `[32, 0]`。

## 工作原理

**包装（Wrapping）** 将 BTC 发送到签名者地址，并铸造等量的 frBTC（扣除少量溢价）：

1. 你将 BTC 发送到签名者的 Taproot 地址。
2. 你在 frBTC 合约上调用 **wrap**（opcode 77）。
3. 合约验证 BTC 已到账，并向你铸造 frBTC。

**解包（Unwrapping）** 销毁 frBTC，并要求签名者组释放 BTC：

1. 你调用 **unwrap**（opcode 78），传入想要赎回的 frBTC 数量。
2. 合约销毁这部分 frBTC，并为签名者组记录一笔待付款。
3. 签名者在之后的一笔交易中释放 BTC。

包装是即时完成的。解包则要等签名者组处理完该笔付款才算结算完成。

## 从 CLI 包装

CLI 将整个流程封装进一条命令：

```bash
# 将 1 BTC（100,000,000 sats）包装为 frBTC
alkanes-cli -p regtest \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  alkanes wrap-btc \
  100000000 \
  --to p2tr:0 \
  --from p2tr:0 \
  --change p2tr:0 \
  --mine \
  -y

# 查看你的 frBTC 余额
alkanes-cli -p regtest \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  alkanes getbalance
```

`wrap-btc` 会构建将 BTC 发送给签名者的交易，附加在 `[32, 0]` 上的 wrap 调用，并将 frBTC 返还到你的地址。在 regtest 上，`--mine` 会立即挖出该区块。

## 从 CLI 解包

解包是一次直接的合约调用，因此你需要使用带 cellpack 的 `execute`：

```bash
# 解包价值 0.5 BTC 的 frBTC（opcode 78）
alkanes-cli -p regtest \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  alkanes execute "[32,0,78,0,50000000]:v0:v0" \
  --inputs "32:0:50000000" \
  --from p2tr:0 \
  --fee-rate 1 \
  --mine \
  -y
```

cellpack `[32,0,78,0,50000000]` 在 `[32,0]` 上调用 opcode 78，传入 vout 索引 `0` 和数额 `50000000` sats。`--inputs "32:0:50000000"` 将这部分 frBTC 送入合约进行销毁。BTC 本身之后由签名者组释放，而不是在这笔交易中完成。

## 查询 frBTC 状态

只读的 opcode 通过 `simulate` 免费查询：

```bash
# 总供应量（opcode 105）
alkanes-cli -p regtest alkanes simulate "32:0:105"

# 签名者公钥（opcode 103）
alkanes-cli -p regtest alkanes simulate "32:0:103"

# 当前溢价（opcode 104）
alkanes-cli -p regtest alkanes simulate "32:0:104"
```

## 关于溢价

包装会收取少量溢价，以每 100,000,000 份计（即每 BTC 对应的 sats 数）。默认值为 `100000`，即 0.1%。以 0.1% 包装 1 BTC，会铸造 99,900,000 sats 的 frBTC。

## frBTC 的 opcode

| Opcode | 名称 | 说明 |
|--------|------|-------------|
| 77 | Wrap | 为发送给签名者的 BTC 铸造 frBTC |
| 78 | Unwrap | 销毁 frBTC 并记录一笔付款 |
| 99 | GetName | 返回 `frBTC` |
| 100 | GetSymbol | 返回 `frBTC` |
| 101 | GetPendingPayments | 待处理的付款记录 |
| 103 | GetSigner | 签名者公钥 |
| 104 | GetPremium | 当前溢价 |
| 105 | GetTotalSupply | 总供应量 |

## 从 TypeScript

SDK 提供了一个带类型的 wrap 方法，因此你无需手动构建 cellpack：

```typescript
import { AlkanesProvider } from '@alkanes/ts-sdk';

const provider = new AlkanesProvider({
  network: 'mainnet',   // 本地开发时使用 'regtest'
  rpcUrl: 'https://mainnet.subfrost.io/v4/jsonrpc',
});
await provider.initialize();

// 加载钱包以签署交易
provider.walletLoadMnemonic('your twelve word mnemonic ...');
const [{ address }] = provider.walletGetAddresses('p2tr', 0, 1);

// 将 1 BTC 包装为 frBTC
const wrap = await provider.frbtcWrapTyped({
  amount: BigInt(100000000),
  toAddress: address,
  fromAddress: address,
  feeRate: 1,
  mineEnabled: true,    // 在 regtest 上自动挖矿
  autoConfirm: true,
});
console.log('Wrap TXID:', wrap.reveal_txid);

// 读取你的 frBTC 余额
const balances = await provider.alkanes.getBalance(address);
const frbtc = balances.find(b => b.alkane_id?.block === 32 && b.alkane_id?.tx === 0);
console.log('frBTC balance:', frbtc?.balance);
```

## 接下来去哪里

- [frBTC 锚定与托管](../protocol/frbtc-peg-and-custody)：其背后的资产支持如何得到保障。
- [通过 CLI 交互](./interacting-via-cli)：其余的命令集合。
- [CLI 与 SDK 参考](../api-reference/cli-sdk/overview)：完整的 SDK 方法列表。
