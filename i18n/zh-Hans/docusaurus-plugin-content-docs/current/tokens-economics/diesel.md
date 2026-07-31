---
title: DIESEL
sidebar_label: DIESEL
sidebar_position: 2
description: DIESEL 是 SUBFROST 的原生发行代币，随 Bitcoin 自身的出块节奏在链上发行。
---

# DIESEL

**DIESEL** 是该协议的原生代币。与由锁定的 Bitcoin 提供支撑的 frBTC 不同，DIESEL 是**在链上发行（emitted）**的：它随着新区块的产生而铸造，发行节奏与 Bitcoin 本身挂钩。

## DIESEL 是如何发行的

每一个 Bitcoin 区块发行的 DIESEL 数量，与它发行的新比特币数量**相同**。目前是**每个区块 3.125 枚**，并且**与 Bitcoin 同步减半**，遵循相同的 210,000 个区块周期。当 Bitcoin 的区块补贴降至 1.5625 时，DIESEL 的发行量也会随之降低。

| | |
| --- | --- |
| 每个区块 | 3.125 DIESEL |
| 每天 | 约 450 DIESEL |
| 每年 | 约 164,000 DIESEL |
| 减半 | 每 210,000 个区块，与 Bitcoin 同步 |

DIESEL 不会按需印发。没有水龙头（faucet），也没有任何方式能让发行加快：它只会随着 Bitcoin 区块的产生而出现，这使 SUBFROST 经济体系的供给端，直接与 Bitcoin 自身的货币发行节奏绑定在一起。

### 谁能收到它

一个区块产出的 DIESEL 会分成两部分：

- 一部分归**协议**所有，其数量与该区块的矿工手续费保持等量，并**以该区块 DIESEL 总量的一半为上限**。手续费活动越活跃的区块，分给协议的份额就越多，但不会超过这个上限。
- **剩下的部分，由在该区块中铸造的所有人平分。**

因此，你能拿到多少取决于同一高度还有多少人一起铸造。这一点值得在铸造之前就想清楚：区块的发行总量是固定的，参与铸造的人越多，每个人按比例能分到的就越少。

## DIESEL 的用途

- **它是核心 AMM 资金池的锚点。** DIESEL 与 frBTC 在协议的核心流动性池中配对，为 SUBFROST 提供了一个原生的计价单位。为该资金池提供流动性同时也是赚取 [FIRE](../using-subfrost/fire-vault) 的方式。
- **它通过参与来获得。** 由于 DIESEL 是随着区块产生而分发的，与协议交互的参与者可以获得一部分发行份额。
- **它被用于路由（routing）。** 当一笔兑换没有直接对应的资金池时，DIESEL 通常作为中间跳转（intermediate hop）（参见 [Swap](../using-subfrost/swap)）。

## 接下来可以看看

- [代币与经济](./overview)：DIESEL 如何与 frBTC 和 FIRE 相互配合。
- [FIRE Vault](../using-subfrost/fire-vault)：通过提供 DIESEL / frBTC 流动性赚取 FIRE。
- [Alkanes 元协议](../protocol/alkanes)：DIESEL 是一种 Alkanes 代币。
