---
title: 通过 CLI 交互
sidebar_label: 通过 CLI 交互
sidebar_position: 3
description: 使用 alkanes-cli 管理钱包、部署与调用合约，并查询链上数据。
---

# 通过 CLI 交互

`alkanes-cli` 是用于操作 Alkanes 元协议的命令行工具：钱包管理、部署、合约调用与链上查询。本页是一次以任务为导向的导览。要查阅详尽的命令列表，参见 [CLI 与 SDK 参考](../api-reference/cli-sdk/overview)。

安装方法请参见 [快速开始](./quickstart)。

## 选择网络

每条命令都通过 `-p`（provider）参数指定网络：`regtest`、`signet` 或 `mainnet`。

```bash
alkanes-cli -p signet <command>
```

常用的全局选项：

| 选项 | 说明 |
|--------|-------------|
| `--wallet-file <PATH>` | 钱包文件路径 |
| `--passphrase <PHRASE>` | 用于签名的口令 |
| `--wallet-address <ADDR>` | 仅观察、只读模式 |
| `--jsonrpc-url <URL>` | 自定义 JSON-RPC 端点 |

## 钱包基础操作

```bash
# 创建或导入钱包
alkanes-cli wallet create
alkanes-cli wallet import

# 列出地址（range 为 起始:结束）
alkanes-cli wallet addresses --range 0:5

# 余额与未花费输出
alkanes-cli wallet balance
alkanes-cli wallet utxos
```

## 部署与调用合约

合约相关操作位于 `alkanes` 命名空间下。合约通过其 `[block, tx]` 形式的 Alkane ID 寻址，而一次调用就是一个 **cellpack**，即以目标 ID 和 opcode 开头的一个列表（参见 [Alkanes 元协议](../protocol/alkanes)）。

```bash
# 执行调用：合约 [2,1]，opcode 1
alkanes-cli -p signet alkanes execute "[2,1,1]" --fee-rate 10 -y

# 通过免费的 view 调用读取状态：合约 [2,1]，opcode 2
alkanes-cli -p signet alkanes view "[2,1]" "2"

# 在不广播的情况下模拟一次调用
alkanes-cli -p signet alkanes simulate "2:1:2"

# 检查合约的字节码与元数据
alkanes-cli -p signet alkanes inspect "2:1" --meta
```

`-y` 参数用于自动确认。`execute` 会产生一笔 Bitcoin 交易并支付费用；`view` 和 `simulate` 读取索引器状态，不产生任何花费。

## 直接查询 Bitcoin

CLI 还代理了 Bitcoin Core 和 Esplora，因此你无需借助第二个工具即可检查底层链：

```bash
# Bitcoin Core RPC
alkanes-cli bitcoind getblockcount
alkanes-cli bitcoind getrawtransaction <TXID>

# Esplora
alkanes-cli esplora address <ADDRESS>
alkanes-cli esplora tx <TXID>
alkanes-cli esplora fee-estimates
```

## 广播选项

默认情况下，一笔交易会被发往公共内存池（mempool）。对于价值较高或对 MEV 敏感的交易，CLI 可以改为通过私有中继来路由：

| 选项 | 说明 |
|--------|-------------|
|（默认）| 标准内存池广播 |
| `--use-slipstream` | 通过 MARA Slipstream 提交（绕过公共内存池） |
| `--use-rebar` | 通过 Rebar Shield（私有中继）提交 |
| `--mine` | 立即挖矿（仅限 regtest） |

## 获取帮助

```bash
alkanes-cli --help
alkanes-cli <command> --help
```

## 接下来去哪里

- [包装 frBTC](./wrapping-frbtc)：完整的包装与解包演练。
- [CLI 与 SDK 参考](../api-reference/cli-sdk/overview)：每一个命令与标志位。
