---
title: 关键概念
sidebar_label: 关键概念
sidebar_position: 3
description: SUBFROST 的速查表，涵盖 frBTC、DIESEL、FIRE、FUEL、dxBTC、AMM，以及底层技术。
---

# 关键概念

一份简短的术语表，帮你快速了解概况。每个条目都会链接到更深入的页面（如果存在的话）。这些资产分为今天**已上线**和**规划中**两组。

## 资产

### 已上线

- **frBTC。** 让你的 Bitcoin 变得可编程。frBTC 是将 BTC 按 1:1 原子化包装成的代币，可与链上应用交互，并原生结算在 Bitcoin 上。

- **DIESEL。** 协议的原生发行代币。每个 Bitcoin 区块发行的 DIESEL 数量，与该区块新发行的比特币数量相同（今天是 3.125），并遵循相同的减半时间表。具体数字与领取对象见 [DIESEL](../tokens-economics/diesel)。

- **FIRE。** Alkanes 治理代币，奖励为 DIESEL/frBTC 资金池提供流动性的人，并由质押（staking）与债券（bonding）机制驱动。这是活跃参与者获得协议份额、并随时间推移参与治理的方式。

- **frUSD。** 终极的 Bitcoin 原生稳定币：一种稳定的美元代币，结算在 Bitcoin 上，没有任何实体能够将其关闭或审查。它已在主网上与 frBTC 组成资金池进行交易，也可以通过从 Ethereum 跨链存入 USDC 或 USDT 来铸造。

### 规划中

- **dxBTC。** 生息 Bitcoin。你质押 BTC 并收到 dxBTC；在后台，你的 Bitcoin 会被投入市场中性的收益策略中运作，且始终不会离开 Bitcoin 区块链。

- **FUEL。** subfrost 协议国库与参数（例如铸造/赎回费用和协议升级）的治理代币。其代币经济学尚未公开。

:::note[说明]
大小写区分了你会在这些文档中遇到的两个"fuel"：大写的 **FUEL** 始终指这个代币，而小写的 **fuel** 指一次 Alkanes 合约调用被允许消耗的计算预算，相当于其他链上的 gas。

与 gas 的相似之处仅止于"计算预算"这一点。与 gas 不同，**fuel 是免费的**：你无需购买，无法充值，也不会有任何费用从中扣除。每个区块的固定 fuel 预算，只在真正调用合约的交易之间按大小分配。交易时你支付的唯一费用，是普通的 Bitcoin 矿工费，以**原生 BTC** 支付，与一笔完全不运行合约的交易完全相同。详见 [Alkanes](../protocol/alkanes)。
:::

## 如何交易资产

- **AMM（自动做市商）。** 兑换是针对一个共享的流动性池进行的，而不是与另一个交易者撮合。这种效率始终为你提供交易对手方，价格会随供需变化。这正是应用中兑换功能背后的驱动力。

以下两项手续费值得了解，两者都是当前费率，而非永久保证：

| 操作 | 手续费 | 去向 |
| --- | --- | --- |
| 交换 | 默认 1% | 0.8% 给流动性提供者，0.2% 永久归 AMM 协议所有 |
| 包装或解包 BTC | 0.1% | 归 SUBFROST 协议所有 |

表中的「交换」一行描述的是标准 AMM 资金池。frUSD/frBTC 资金池的收费方式不同，其流动性提供者的收益方式也不同，详见 [Pools & Liquidity（资金池与流动性）](../using-subfrost/pools-liquidity)。

参见 [Swap（交换）](../using-subfrost/swap)、[Pools & Liquidity（资金池与流动性）](../using-subfrost/pools-liquidity) 和 [Wrap & Unwrap（包装与解包）](../using-subfrost/wrap-unwrap-frbtc)。

- **PSBT 市场（部分签名比特币交易）。** 在 Alkanes 生态中，有多个 PSBT 市场，买卖双方可以选择成交彼此的订单。SUBFROST 目前尚未托管此类市场。

## 这一切运行在什么之上

- **Alkanes。** 这些代币所依托的智能合约协议。Alkanes 让开发者可以直接在 Bitcoin 上运行可编程合约（合约用 Rust 编写并编译为 WebAssembly），继承 Bitcoin 的安全性，而不必依赖另一条独立的链。frBTC、DIESEL 和 FIRE 都是 Alkanes 代币。完整模型见 [Technical Overview](../protocol/alkanes) 章节。

- **Metashrew 索引器。** Bitcoin 区块本身并不会"运行"合约。Metashrew 索引器会读取每个新区块，并执行嵌入在区块中的合约代码（具体来说是在 OP_RETURN 中）。当你看到自己的 Alkanes 余额时，它就来自 Metashrew 索引器。

:::note[更深一层]
本节刻意保持简单。protostone、cellpack 等术语，以及具体的合约模型，会在 [Technical Overview](../protocol/alkanes) 章节中介绍；开发者工具（CLI、SDK、JSON-RPC）则在 [Build on SUBFROST](../build/overview) 和 [API & SDK Docs](../api-reference/getting-started/overview) 中介绍。
:::

## 今天已经上线的内容

诚实面对现状很重要。快速一览：

- **已上线：** frBTC 的原子化包装与解包回 BTC、Bitcoin 资产与 BTC 之间在 AMM 资金池中的兑换、向这些 AMM 资金池提供流动性以赚取收益，以及在进阶 DeFi "FIRE" vault 中的质押与债券。
- **规划中：** 生息 Bitcoin 金库代币（dxBTC）、FUEL 治理代币，以及完全无许可的签名者网络。

## 接下来去哪里

- **[5 分钟快速上手](./get-started)：** 如果你还没完成第一笔兑换。
- **[代币与经济学](../tokens-economics/overview)：** frBTC、DIESEL、FIRE、dxBTC 和 FUEL 的完整故事。
- **[Technical Overview](../protocol/alkanes)：** 托管、签名和 Alkanes 模型的实际运作方式。
