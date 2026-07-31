---
title: BRC2.0 集成
sidebar_label: BRC2.0 集成
sidebar_position: 5
description: 通过 BRC2.0 在 Bitcoin 上部署并调用 EVM 风格的 Solidity 合约。
---

# BRC2.0 集成

[BRC2.0](../protocol/brc20) 在 Bitcoin 上运行兼容 EVM 的智能合约。如果你会写 Solidity，就可以用你已经熟悉的工具在这里部署并调用合约，还能从合约内部触及由 Bitcoin 支持的 frBTC。本页介绍通过 `alkanes-cli` 完成的开发者工作流。相关概念参见 [BRC2.0](../protocol/brc20)；完整命令列表参见 [CLI 与 SDK 参考](../api-reference/cli-sdk/brc20-prog)。

## 端点

BRC2.0 有自己的 JSON-RPC 端点，与 Alkanes 的端点是分开的。通过 `--brc20-prog-rpc-url` 传入：

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog block-number
```

它使用标准的以太坊 JSON-RPC 协议（`eth_call`、`eth_getBalance`、`eth_getCode`、`eth_getLogs`、`eth_chainId` 等），外加少量用于铭文感知查询的 `brc20_*` 方法。

## 部署合约

用 Foundry 编译你的合约，然后部署构建产物的 JSON 文件：

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  brc20-prog deploy ./out/MyContract.sol/MyContract.json \
  --fee-rate 10
```

常用标志位：

| 标志位 | 说明 |
|------|-------------|
| `--from <addresses>` | 用于获取 UTXO 的来源地址 |
| `--change <address>` | 找零地址 |
| `--use-activation` | 使用三笔交易的激活模式 |
| `--mempool-indexer` | 在内存池中追踪待处理的 UTXO |
| `--trace` | 启用交易追踪 |
| `--mine` | 广播后挖出一个区块（仅限 regtest） |

一次部署是通过一次采用先提交后揭示（commit-then-reveal）流程的 Bitcoin 铭文来完成的。可选的 `--use-activation` 会额外增加第三笔激活交易。如果你的某些 UTXO 携带铭文，工具链会自动先插入一笔拆分交易，将带铭文的聪（sats）移到一个安全的输出中，然后再用干净的聪来支付 commit 交易，并将整个交易组作为一个整体原子广播。

## 调用合约

状态变更类调用使用 `transact`；只读调用使用 `call`：

```bash
# 状态变更：transfer(address, uint256)
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  brc20-prog transact 0xYourContract "transfer(address,uint256)" 0xRecipient,1000 \
  --fee-rate 10

# 只读调用（eth_call）：原始 calldata
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  brc20-prog call --to 0xYourContract --data 0x70a08231...
```

`transact` 接受一个人类可读的函数签名和以逗号分隔的参数，因此你无需手动编码 calldata。`call` 接受原始的 ABI 编码数据，与 `eth_call` 的行为一致。

## 将 BTC 包装进一次合约调用

`wrap-btc` 会在同一个流程中将 BTC 包装为 frBTC 并调用目标合约，让用户可以一步之内从原生 BTC 直接完成一次合约交互：

```bash
alkanes-cli -p mainnet \
  --brc20-prog-rpc-url https://mainnet.subfrost.io/v4/jsonrpc/brc20-prog \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  brc20-prog wrap-btc 100000 \
  --target 0xYourContract \
  --signature "deposit()" \
  --calldata "" \
  --fee-rate 10 \
  -y
```

## 读取状态

```bash
# 某地址的 frBTC 余额（eth_getBalance）
brc20-prog get-balance 0xYourAddress

# 合约字节码（eth_getCode）
brc20-prog get-code 0xYourContract

# 事件日志（eth_getLogs）
brc20-prog get-logs --address 0xYourContract --from-block 840000 --to-block latest
```

## 接下来去哪里

- [BRC2.0](../protocol/brc20)：该协议的工作原理。
- [CLI 与 SDK 参考](../api-reference/cli-sdk/brc20-prog)：每一个 `brc20-prog` 命令与标志位。
- [包装 frBTC](./wrapping-frbtc)：Alkanes 一侧的包装流程。
