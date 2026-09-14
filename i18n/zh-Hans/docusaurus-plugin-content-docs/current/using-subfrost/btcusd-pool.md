---
title: BTCUSD 资金池
sidebar_label: BTCUSD 资金池
sidebar_position: 5
description: frUSD/frBTC 资金池，让 BTC 无需离开 Bitcoin 就能与美元交易。
---

# BTCUSD 资金池

BTCUSD 资金池就是 frUSD/frBTC 市场：**BTC 与美元交易的场所，并原生结算在 Bitcoin L1 上**。

长期以来，用 BTC 交易美元都意味着离开 Bitcoin 区块链，直到现在。我们借助 [frUSD](../tokens/frUSD-overview) 和 [frBTC](../tokens/frBTC-overview) 把这个交易对直接带到了 Bitcoin 上，但用户不需要先持有其中任何一种……只需要 BTC 或 USDT/USDC。

## 池中交易的资产

| 一侧 | 资产 | 它是什么 |
| --- | --- | --- |
| 美元 | `frUSD` | Bitcoin 上的美元，全额储备；退出在经过筛查和签名后，可跨链赎回至 Ethereum（[详情](../tokens/frUSD-overview)） |
| BTC | `frBTC` | Bitcoin 上的你的 BTC，全额储备，经过 3 到 7 个区块确认后可赎回为原生 BTC（[详情](../tokens/frBTC-overview)） |

你不需要先持有其中任何一种。从 BTC 发起交换时会在过程中自动为你包装，而从 Ethereum 跨链存入 USDT 或 USDC 时会在到账时铸造 frUSD。

## 发起一笔交易

在这个资金池上交易就是一次普通的交换。在 [Swap（交换）](./swap) 页面选择你要支付的代币和想要接收的代币，应用会为你把交易路由到这个资金池。

在确认之前，有两点值得留意：

- **请按你实际打算交易的规模，看你能收到多少。** 一旦你输入金额，屏幕上的汇率就是根据那笔报价算出来的，其中已经包含了你的交易规模和手续费。
- **核对最小可接收数量。** 如果价格在你签名与交易确认之间发生变动，这就是你的下限，它由你的滑点容忍度设定。

## 一种不同类型的资金池

SUBFROST 上的大多数资金池是标准的恒定乘积 AMM。这一个是 **CryptoSwap 资金池**（Curve V2 设计），它带来两点你能实际感受到的差别。

**流动性是集中的，而不是均匀铺开的。** 恒定乘积资金池会把深度从零到无穷大均匀铺开。CryptoSwap 资金池则把大部分深度集中在它内部维护的一个参考价格附近，并随着市场变动移动这个参考价格。

**手续费是浮动的，而不是固定的。** 目前费率在 **0.2% 到 0.8%** 之间，由你的交易之后资金池的平衡程度决定。让两侧更接近均衡的交易支付较低费率，把两侧推得更开的交易支付较高费率。让资金池恢复平衡的那一笔才是更便宜的，而你看到的报价中已经包含了资金池的手续费。

## 提供流动性

你可以为资金池的两侧提供资金，并赚取它所收取费用的一部分。流程与其他资金池相同，位于兑换页面的 [Liquidity（流动性）](./pools-liquidity) 标签页。

:::info 这个资金池的手续费分配方式不同

这个资金池收取的费用有一半归协议所有，因此流动性提供者大约保留交易量的 **0.1% 到 0.4%**，不同于标准 SUBFROST 资金池支付的 0.8%。[Pools & Liquidity（资金池与流动性）](./pools-liquidity) 页面给出了细节，请在存入前先阅读。

:::

你的仓位由一个 **LP 代币**表示，它就是资金池合约本身（`4:1778`）。它带有 18 位小数。

## 从 Ethereum 进出资金

资金池在 Bitcoin 上，但你可以用 Ethereum 钱包为它注资，也可以按同样的方式把价值取回。

- **进：** 通过 frUSD 跨链桥存入 USDC 或 USDT，在 Bitcoin 上收到 frUSD。你可以要求其中一部分以原生 BTC 的形式到账，如果你的钱包是空的、付不起网络手续费，这一点尤其有用。
- **出：** 把 frUSD 销毁并跨链回到 Ethereum 上的稳定币，也可以选择其中一部分取为 ETH，好让一个全新的地址有 gas 可用。如果网络无法执行 ETH 那一部分，就会把整笔赎回都以稳定币支付。

两个方向都会收取一笔固定费用外加一小部分比例费用，并且有最小金额限制，因此一次较大的往返比多次小额往返更划算。[frUSD 概览](../tokens/frUSD-overview) 给出了当前的具体数字。

:::note 想用 USDT 或 USDC 换取大量 BTC？你可能会收到 frUSD

如果你想换取的 BTC 超过资金池 frUSD 的 10%，整笔存入都会以 frUSD 到账。不会有任何损失，存入仍然成功。如果想要 BTC，请把 BTC 部分设得小一些，或者先跨链再交换。

:::

## 资金池详情

| | |
| --- | --- |
| 资金池 | `4:1778`，同时也是 LP 代币，18 位小数 |
| frUSD | `4:1776`，8 位小数 |
| frBTC | `32:0`，8 位小数 |
| 设计 | CryptoSwap（Curve V2） |
| 交换手续费 | 目前为 0.2% 到 0.8%，取决于交易后的平衡程度。它不是固定不变的：请从 [资金池 API](../api-reference/json-rpc/btcusd) 读取 |

读取资金池、按指定规模获取报价，或在命令行中准备一笔跨链存入，请参阅 [BTC/USD Commands（BTC/USD 命令）](../api-reference/cli-sdk/btcusd)。

## 下一步

- [Swap（交换）](./swap)：交易流程本身，以及路径是如何选择的。
- [Pools & Liquidity（资金池与流动性）](./pools-liquidity)：为这个资金池提供流动性能得到什么。
- [frUSD 概览](../tokens/frUSD-overview)：交易对中美元一侧的那个美元。
- [frBTC 概览](../tokens/frBTC-overview)：交易对中 BTC 一侧的那个 Bitcoin。
- [BTC/USD Commands（BTC/USD 命令）](../api-reference/cli-sdk/btcusd)：从命令行看同一个资金池。
- [BTC/USD Pool API（BTC/USD 资金池 API）](../api-reference/json-rpc/btcusd)：通过 JSON-RPC 读取资金池的实时状态。
