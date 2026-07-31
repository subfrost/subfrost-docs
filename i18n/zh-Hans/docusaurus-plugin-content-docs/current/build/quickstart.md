---
title: 快速开始
sidebar_label: 快速开始
sidebar_position: 2
description: 安装工具链、编写一个最小的 Alkanes 合约，并将其部署到 Bitcoin 上。
---

# 快速开始

本指南带你从一台空机器走到在 Bitcoin 上部署一个 Alkanes 合约。目标网络是 **signet**（一个公共测试网络），这样你在学习过程中不会花掉真实的 BTC。

## 前置条件

- **Rust 1.70 或更高版本**（从 rustup.rs 安装）
- **wasm-pack**（`cargo install wasm-pack`）
- **Node.js 18 或更高版本**（用于 CLI 工具链）

## 1. 安装 CLI

CLI 需要从源码构建。它没有发布到任何包注册表，因此从仓库构建是官方支持的方式。

```bash
# 克隆 alkanes-rs（develop 分支）
git clone https://github.com/kungfuflex/alkanes-rs.git -b develop
cd alkanes-rs

# 构建 CLI
cargo build --release -p alkanes-cli

# 将其加入 PATH（可选）
export PATH="$PWD/target/release:$PATH"
```

## 2. 创建钱包

```bash
# 创建一个新钱包
alkanes-cli wallet create

# 或导入已有的助记词
alkanes-cli wallet import

# 显示你的地址以便充值
alkanes-cli wallet receive
```

在部署前，从 signet 水龙头给该地址充值。

## 3. 编写合约

创建一个 Rust 库项目：

```bash
cargo new --lib my-alkane
cd my-alkane
```

在 `Cargo.toml` 中将该 crate 配置为编译到 WebAssembly：

```toml
[package]
name = "my-alkane"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
alkanes-std = { git = "https://github.com/kungfuflex/alkanes-rs" }
alkanes-support = { git = "https://github.com/kungfuflex/alkanes-rs" }

[profile.release]
opt-level = "z"
lto = true
```

在 `src/lib.rs` 中编写一个最小的合约：

```rust
use alkanes_std::prelude::*;
use alkanes_support::context::Context;

#[derive(Default)]
pub struct MyAlkane {
    counter: u64,
}

impl MyAlkane {
    pub fn new() -> Self {
        Self { counter: 0 }
    }

    pub fn increment(&mut self) {
        self.counter += 1;
    }

    pub fn get_count(&self) -> u64 {
        self.counter
    }
}

// 导出该合约
alkane!(MyAlkane);
```

## 4. 编译为 WebAssembly

```bash
wasm-pack build --target web --release
# 输出：pkg/my_alkane_bg.wasm
```

## 5. 部署

部署一个 Alkane，意味着广播一笔携带 WASM 信封（envelope）和 **cellpack** 的 Bitcoin 交易，cellpack 告诉协议要执行什么操作（背后的模型参见 [Alkanes 元协议](../protocol/alkanes)）。

```bash
alkanes-cli -p signet alkanes execute "[3,0,0]" \
  --envelope "./pkg/my_alkane_bg.wasm" \
  --fee-rate 10 \
  -y
```

输出会显示你合约的 **Alkane ID**，一个 `[block, tx]` 数对，例如 `[2, 1]`（区块 2、交易索引 1）。从此以后，你就通过这个 ID 来寻址该合约。

## 6. 交互

```bash
# 在你位于 [2,1] 的合约上调用 increment（opcode 1）
alkanes-cli -p signet alkanes execute "[2,1,1]" \
  --fee-rate 10 \
  -y

# 读取计数器（opcode 2），这是一次不花费任何费用的 view 调用
alkanes-cli -p signet alkanes view "[2,1]" "2"
```

读取调用是免费的，且不会触及链上状态：它们针对索引器状态运行。写入调用是 Bitcoin 交易，需要支付费用。

## 接下来去哪里

- [通过 CLI 交互](./interacting-via-cli)：完整的钱包与合约命令集合。
- [包装 frBTC](./wrapping-frbtc)：将真实的 Bitcoin 支持的价值放入合约。
- [Alkanes 元协议](../protocol/alkanes)：cellpack、opcode 与 view 函数详解。
