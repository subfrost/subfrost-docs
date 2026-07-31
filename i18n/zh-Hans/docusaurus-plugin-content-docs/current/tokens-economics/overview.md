---
title: 概览
sidebar_label: 概览
sidebar_position: 1
description: 构成 SUBFROST 经济体系的资产，以及它们是如何组合在一起的。
---

# 代币与经济

SUBFROST 经济体系建立在几种相互增强的原生资产之上。本页是一份地图，每种资产的详细内容都有各自的页面或指南。

## 这些资产

- **frBTC** 是基础资产。它是你的 Bitcoin 以 1:1 比例包装成的可编程链上形式。其他一切都以它计价。参见 [包装与解包 BTC](../using-subfrost/wrap-unwrap-frbtc) 和 [frBTC 锚定与托管](../protocol/frbtc-peg-and-custody)。
- **DIESEL** 是协议的原生发行代币，随真实的 Bitcoin 出块过程在链上发行。参见 [DIESEL](./diesel)。
- **FIRE** 是奖励与治理代币。它通过质押（staking）和债券（bonds），奖励那些为 DIESEL / frBTC 资金池提供流动性的人。参见 [FIRE Vault](../using-subfrost/fire-vault)。
- **dxBTC**（规划中）是一种生息（yield-bearing）形式的 Bitcoin。
- **FUEL**（规划中）是协议的治理代币。

## 它们如何组合在一起

这一经济体系的核心是 **DIESEL / frBTC** 流动性池：

- **frBTC** 将真实的 Bitcoin 引入系统，并以 1:1 比例提供支撑。
- **DIESEL** 在链上铸造，并与 frBTC 在该资金池中配对，因此两者互相交易，为协议提供了一个原生的计价单位。
- **FIRE** 将激励精准地指向这一资金池：为 DIESEL / frBTC 提供流动性的用户将赚取 FIRE，从而保持资金池的深度和市场的流动性。

由于 DIESEL 的发行锚定于 Bitcoin 自身的出块过程（参见 [DIESEL](./diesel)），这一经济体系的供给端与 Bitcoin 绑定，而非依赖任意的通胀机制。

## 已上线 vs. 规划中

- **已上线：** frBTC（包装/解包、兑换）、DIESEL（链上发行）、FIRE（质押与债券）。
- **规划中：** dxBTC（收益金库）、FUEL（治理代币）、原生于 Bitcoin 的稳定币（frUSD）。

## 接下来可以看看

- [DIESEL](./diesel)：原生发行代币。
- [FIRE Vault](../using-subfrost/fire-vault)：赚取 FIRE。
- [frBTC 锚定与托管](../protocol/frbtc-peg-and-custody)：底层的运行机制。
