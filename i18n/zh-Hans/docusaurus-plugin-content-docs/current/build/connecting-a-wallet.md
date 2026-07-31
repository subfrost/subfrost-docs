---
title: 连接钱包
sidebar_label: 连接钱包
sidebar_position: 6
description: 让 Web 应用通过注入式 provider 或远程签名，向 SUBFROST 钱包请求签名。
---

# 连接钱包

Web 应用永远不会持有用户的私钥。要做任何涉及花费或转移资产的操作，它都需要请求钱包进行签名。在 SUBFROST 上，根据用户所处的环境，有两种方式可以联系到该钱包。

## 两种连接路径

- **注入式 provider（Injected provider）。** 当用户安装了 SUBFROST 浏览器扩展时，它会向页面注入一个 provider 对象，供你的页面直接调用。只要该路径可用，就是最顺畅的一种。
- **远程签名（Remote signing）。** 当用户使用没有钱包存在的桌面浏览器时，应用会通过加密中继与用户手机上的钱包配对。应用显示一个二维码，手机扫描后，此后应用就会向手机发送签名请求，手机会针对每一次请求提示用户确认。这一流程完整记录在 [WalletConnect](../api-reference/guides/walletconnect) 参考页面中。

这两条路径都暴露出同样两个关键操作：**签署 PSBT**（用于授权一笔 Bitcoin 交易）和**签署消息**（用于证明对某地址的控制权）。应用构建交易或消息，钱包批准并签名，应用负责广播。

## 注入式 provider

当 SUBFROST 浏览器扩展安装后，它会在每个页面上定义 `window.subfrost`。该对象是只读的，其结构遵循与其他 Bitcoin 钱包 provider 相同的约定，因此如果你之前集成过 Bitcoin 钱包，这些方法名会显得很眼熟。

### 检测钱包

扩展会在页面加载时注入 provider，因此运行得很早的脚本可能会在 `window.subfrost` 存在之前就执行。这两种情况都要处理：检查该对象是否存在，同时监听扩展在 provider 就绪后触发的 `subfrost:initialized` 事件。

```javascript
function getProvider() {
  return typeof window !== 'undefined' ? window.subfrost : undefined;
}

// 已经注入的常见情况
let subfrost = getProvider();

// 稍后才注入，适用于在扩展之前运行的脚本
window.addEventListener('subfrost:initialized', (event) => {
  subfrost = getProvider();
  // event.detail: { id: 'subfrost', name: 'Subfrost', icon: '/icons/icon-128.png' }
});

if (!subfrost) {
  // 此上下文中没有扩展。回退到远程签名（二维码配对）。
}
```

### 连接并读取账户状态

`requestAccounts` 是连接调用：它会提示用户批准你的站点，并返回用户选择分享的地址。`getAccounts` 则返回一个已连接站点的地址。

```javascript
// 提示用户连接，返回已批准的地址
const accounts = await subfrost.requestAccounts();

// 钱包当前所在的网络
const network = await subfrost.getNetwork();

// 某个地址的公钥（默认为当前激活账户）
const pubkey = await subfrost.getPublicKey(accounts[0]);
```

### 签名

```javascript
// 签署一个 PSBT。用户在钱包中批准它。
const signedPsbtHex = await subfrost.signPsbt(unsignedPsbtHex);

// 可选：让钱包为你最终确定（finalize）该 PSBT
const finalized = await subfrost.signPsbt(unsignedPsbtHex, { autoFinalized: true });

// 证明对某个地址的控制权
const signature = await subfrost.signMessage('Authorize this action', accounts[0]);
```

`signMessage` 接受一个可选的第三个参数，用于选择签名格式：

| `protocol` | 产生的签名 |
| --- | --- |
| `'bip322'` 或 `'bip322-simple'` | BIP-322 witness 签名，适用于 segwit 和 taproot 地址 |
| 省略、`'bsm'` 或 `'ecdsa'` | 旧版 BIP-137 Bitcoin Signed Message |

### 签署多个 PSBT

有两个调用都接受一个 PSBT 数组作为参数，区别在于用户需要批准的次数：

- **`signPsbts(psbts, options?)`** 会为每个 PSBT 排队一次批准。用户需要逐一确认。
- **`signPsbtBundle(psbts, options?)`** 会把整个数组作为一个单独的信封（envelope）发送。当钱包能够将该 bundle 识别为一个已知操作时，会渲染一次覆盖所有交易的批准界面，用户只需批准一次。当钱包无法识别该 bundle 时，则会回退到与 `signPsbts` 相同的、每个 PSBT 一次批准的流程。

两者都会按照与输入相同的顺序，返回已签名的 PSBT。如果用户拒绝了其中任意一个 PSBT，整个调用都会被拒绝，且不会返回任何结果，因此应重新提交尚未签名的剩余部分，而不要指望得到部分结果。

```javascript
// 每个 PSBT 一次批准
const signed = await subfrost.signPsbts([psbtA, psbtB, psbtC]);

// 当钱包识别该 bundle 时，整个 bundle 只需一次批准
const signedBundle = await subfrost.signPsbtBundle([psbtA, psbtB, psbtC]);
```

### 响应钱包变化

该 provider 是一个事件发射器（event emitter）。使用 `on` 订阅，使用 `off` 取消订阅。

| 事件 | 触发时机 |
| --- | --- |
| `accountsChanged` | 钱包锁定或解锁，导致可见账户发生变化 |
| `disconnect` | 用户在 Connected Sites 中撤销了对你站点的授权 |

```javascript
const onAccountsChanged = (accounts) => {
  // 重新读取状态，或将空列表视为"已锁定"
};

subfrost.on('accountsChanged', onAccountsChanged);
subfrost.on('disconnect', () => {
  // 丢弃会话，并重新显示你的连接按钮
});

// 之后，在你的组件卸载时
subfrost.off('accountsChanged', onAccountsChanged);
```

目前没有 network-changed 事件。需要获取当前网络时，请调用 `getNetwork()`。

### 错误与超时

每个方法在失败时都会以一个 `Error` 拒绝，该 Error 的 message 以方括号中的代码作为前缀，后面跟着一段人类可读的说明：

```
[REQUEST_TIMEOUT] subfrost: request timed out
```

目前有两种代码会传达到页面：

| 代码 | 含义 |
| --- | --- |
| `REQUEST_TIMEOUT` | 已经过去 60 秒，钱包仍未响应。用户很可能根本没有看到这个提示。 |
| `UNKNOWN_ERROR` | 其他所有情况，包括用户拒绝了该请求。 |

一个未得到回应的请求会在 60 秒后被拒绝。请把这种情况当作"没有回应"来处理，而不是当作用户拒绝，并引导用户打开钱包后重试。

:::warning[目前无法区分用户拒绝与其他失败]
当用户拒绝某个提示时，钱包会回复一条消息，但不带任何代码，因此它到达你的页面时会表现为 `UNKNOWN_ERROR`。附带的消息是本地化的，也就是说它会随用户的语言而变化，因此不能用它来做安全的匹配判断。在专门的拒绝代码出现之前，请把签名调用返回的任何 `UNKNOWN_ERROR` 都当作"请求未能完成"处理，并让用户重试，而不是展示一个针对拒绝场景的专门错误提示。
:::

```javascript
try {
  const signed = await subfrost.signPsbt(psbtHex);
} catch (err) {
  if (err.message.startsWith('[REQUEST_TIMEOUT]')) {
    // 没有回应。让用户打开钱包并重试。
  } else {
    // 用户拒绝了，或钱包报告了一个错误。让用户重试。
  }
}
```

## 远程签名（二维码配对）

当没有注入式 provider 时，就通过中继与移动端钱包配对。应用渲染一个配对二维码，手机扫描后建立会话。请求与响应是端到端加密的，中继只转发密文，且每一次请求都在手机端得到批准。

客户端库以及完整协议（配对 URI、信封格式、安全模型）都在 [WalletConnect](../api-reference/guides/walletconnect) 页面中。

## 接下来去哪里

- [WalletConnect](../api-reference/guides/walletconnect)：远程签名协议详解。
- [包装 frBTC](./wrapping-frbtc)：一次值得签署的首笔交易。
- [安全须知](../using-subfrost/safety)：Alkanes 场景下使用全新钱包的习惯。
