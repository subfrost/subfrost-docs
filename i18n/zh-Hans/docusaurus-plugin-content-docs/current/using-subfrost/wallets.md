---
title: 钱包
sidebar_label: 钱包
sidebar_position: 1
description: 创建或连接一个用于 SUBFROST 的 Bitcoin 钱包，管理你的余额与 UTXO，并发送和接收 BTC。
---

# 钱包

要使用 SUBFROST，你需要一个 Bitcoin 钱包。目前**网页应用（web app）**是主要入口，移动应用和浏览器扩展也即将推出。

你的钱包是你查看资产、与智能合约交互、管理 UTXO、追踪交易记录，以及发送和接收 BTC 的地方。

## 创建新钱包

要创建新钱包，请查看**[五分钟快速入门](../start-here/get-started)**中的第 2 步。

## 恢复现有钱包

从 **Connect Wallet** 菜单中选择 **Restore Wallet（恢复钱包）**。你可以通过三种方式恢复：

- 你的 **12 词助记词（seed phrase）**。
- 你之前导出的 **keystore 文件**。
- 一份 **Google Drive 备份**（如果你曾经创建过）。

接下来设置一个新密码，你的钱包及其所有地址就会恢复回来。

## 保护你的钱包安全

浏览器钱包会使用你的密码加密，每次会话解锁都需要这个密码。备份方面你有三种选择：

- 导出一份**加密备份文件**。
- **显示你的助记词**（需要输入密码才能进行此操作）。
- 备份到 **Google Drive**。

:::warning[妥善保管你的助记词]
你的 12 词助记词是你钱包的主密钥。任何得到它的人都可以拿走你的资金。绝不要分享它，绝不要以数字形式存储它，也绝不要在 SUBFROST 以外的任何网站上输入它。
:::

## 你的两个地址

SUBFROST 会给你两种地址类型，因为不同的资产和不同的应用需要不同的格式。

| 地址类型 | 格式 | 用途 |
|---|---|---|
| **Taproot** | `bc1p...` | Alkanes、Runes、BRC20、Ordinals |
| **Native SegWit** | `bc1q...` | 发送和接收 BTC |

这两种地址都会显示在钱包页头，并配有复制按钮。有些交易所和应用只接受其中一种格式，因此同时拥有两种地址意味着你总能接收到资金。

## Your Portfolio

钱包页面标题为 **Your Portfolio（你的投资组合）**。页面顶部的汇总卡片以 BTC 显示你的 **Est. Total Value（估计总价值）**，下方附有约合美元的数值，以及 **Send** 和 **Receive** 按钮。

:::note[总价值包含什么，不包含什么]
Est. Total Value 是你所有资产**不含轨道体（orbitals）**的累计估计价值。如果你持有轨道体，这张卡片上的数字会低于你实际持有的全部资产。
:::

你持有的一切随后会分布在多个标签页中：

| Tab | 显示内容 |
|---|---|
| **Tokens** | 你的可替代余额：BTC 以及 Alkanes 代币，例如 frBTC 和 DIESEL |
| **Positions** | LP tokens and staked positions（LP 代币与质押仓位） |
| **NFTs** | Your Alkanes NFTs（你的 Alkanes NFT） |
| **Activity** | 你的交易历史 |
| **UTXOs** | 构成你余额的各个 coin，以及管理它们的工具 |

空标签页会明确提示为空，而不是什么都不显示，因此 "No positions found" 意味着你确实没有持仓，而不是加载失败。

第六个标签页 **FUEL** 只有在你的地址符合 FUEL 分配资格时才会出现。如果你没有看到它，说明你不符合资格。

### Tokens

每一行代表一项资产，共有四列：

- **Token。** 名称，Alkanes 代币下方还会显示其 id（例如 `frBTC · 32:0` 或 `DIESEL · 2:0`）。
- **Balance。** 你持有的数量，下方附有美元价值。
- **Available。** 你当前可用于支出的部分。任何处于未确认交易中的部分会在下方以 **Mempool** 显示。
- **Unit price。** 该资产单位的当前价格。

Token 和 Balance 两列支持排序。

## UTXO 管理

Bitcoin 的运作方式不像银行余额。你的资金是一组被称为 UTXO（未花费交易输出，Unspent Transaction Outputs）的独立 coin，这个标签页可以让你精确控制要花费哪些 UTXO。

你可以按地址类型（Native SegWit 或 Taproot）或按资产类型（Runes、代币或铭文）筛选你的 UTXO，并对其执行操作：

| 操作 | 作用 |
|---|---|
| **冻结（Freeze）** | 将某个 UTXO 标记为禁止使用，避免它被意外花费 |
| **解冻（Unfreeze）** | 让已冻结的 UTXO 重新变为可支配 |
| **拆分（Split）** | 将 Alkanes 资产与附着在其上的 BTC 分离，让你可以花费这部分 BTC 同时保留 Alkanes 资产 |

:::tip[保护你的珍藏]
如果你在用 Taproot 地址存放收藏品，请将持有稀有铭文的 UTXO 冻结，这样就不会不小心把它们当作交易手续费花掉。完整内容参见 [Safety（安全须知）](./safety)。
:::

## Activity

你钱包中的每一笔交易，包括：

- **状态。** 已确认或待确认。
- **交易 ID。** 链接到区块浏览器查看完整记录。
- **日期与区块确认信息。**
- **已支付的手续费。**
- **可展开的详情。** 该交易的所有输入与输出。

## 设置（Settings）

- **网络（Network）。** 你的钱包指向 Bitcoin Mainnet。
- **HD 钱包派生。** 查看你的活跃地址，并配置它们的派生方式。
- **安全与备份。** 导出备份并管理你的助记词。

## 发送 Bitcoin

发送 BTC 时你需要提供：

1. **收款地址。** 支持所有 Bitcoin 地址格式。
2. **金额**，以 BTC 计。
3. **手续费率**：Slow（慢）、Medium（中）、Fast（快）或 Custom（自定义）。

核对详情后确认。你的钱包会对交易签名并广播出去。

:::warning[留意异常偏高的手续费]
当你的手续费看起来异常偏高时，应用会提示你。在确认一笔大额交易前，请务必再三核对。
:::

## 接收 Bitcoin 或 Alkanes

接收界面会提供一个可供任意移动钱包扫描的**二维码**，以及带有复制按钮的**完整地址**。

:::warning[分享地址前请注意]
只向此地址发送 Bitcoin 或 Alkanes 代币。发送任何资产前请先核实地址是否正确。
:::

## 移动端与浏览器扩展（即将推出）

SUBFROST 采用移动优先（mobile-first）的设计理念，原生客户端也正在开发中。

- **Android。** 即将推出。
- **iOS。** 正在 App Store 审核中。
- **Chrome 浏览器扩展。** 正在积极开发中，力求实现与移动应用相同的功能。

这些客户端正式上线后，我们会为每一个发布完整的设置指南。在此之前，请使用上述网页应用。

## 下一步

- [Wrap and Unwrap BTC（包装与解包 BTC）](./wrap-unwrap-frbtc)：将你的 Bitcoin 转换为 frBTC。
- [Swap（交换）](./swap)：交易 Bitcoin 资产。
- [Safety（安全须知）](./safety)：保护好你的 Ordinals。
