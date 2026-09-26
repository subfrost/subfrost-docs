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
- **远程签名（Remote signing）。** 当用户使用没有钱包存在的桌面浏览器时，应用会通过 SUBFROST 配对桥（pair bridge）与用户手机上的钱包配对，全程端到端加密。应用显示一个二维码，手机扫描后，此后应用就会向手机发送签名请求，手机会针对每一次请求提示用户确认。这一流程完整记录在 [WalletConnect](../api-reference/guides/walletconnect) 参考页面中。

这两条路径都暴露出同样两个关键操作：**签署 PSBT**（用于授权一笔 Bitcoin 交易）和**签署消息**（用于证明对某地址的控制权）。应用构建交易或消息，钱包批准并签名，应用负责广播。

## 注入式 provider

当 SUBFROST 浏览器扩展安装后，它会在每个页面上定义 `window.subfrost`。该对象是只读的，其结构遵循与其他 Bitcoin 钱包 provider 相同的约定，因此如果你之前集成过 Bitcoin 钱包，这些方法名会显得很眼熟。

### 检测钱包

扩展会在页面加载时注入 provider，因此运行得很早的脚本可能会在 `window.subfrost` 存在之前就执行。这两种情况都要处理：检查该对象是否存在，同时监听扩展在 provider 就绪后触发的 `subfrost:initialized` 事件。

```javascript
function getProvider() {
  return typeof window !== 'undefined' ? window.subfrost : undefined;
}

// Already injected, the common case
let subfrost = getProvider();

// Injected later, for scripts that run before the extension
window.addEventListener('subfrost:initialized', (event) => {
  subfrost = getProvider();
  // event.detail: { id: 'subfrost', name: 'Subfrost', icon: '/icons/icon-128.png' }
});

if (!subfrost) {
  // No extension in this context. Fall back to remote signing (QR pairing).
}
```

### 连接并读取账户状态

`requestAccounts` 是连接调用。对于用户尚未连接过的站点，无论调用的是哪个方法，第一个请求都会在钱包中弹出连接提示；用户批准后请求继续执行，拒绝则请求失败。`getAccounts` 发送的请求与 `requestAccounts` 完全相同，因此在尚未连接的站点上它同样会弹出提示。

两者都会返回一个只包含一个地址的数组：即钱包中当前选中的地址（当前激活的账户与地址类型）。钱包处于锁定状态时，请求会等待用户解锁，而不是直接失败，此时页面自身的 60 秒超时依然生效。

```javascript
// Prompts the user to connect, returns the selected address
const accounts = await subfrost.requestAccounts();

// The network the wallet is on. The extension currently always answers 'mainnet'.
const network = await subfrost.getNetwork();

// Taproot x-only public key of the active account, 64 hex characters
const pubkey = await subfrost.getPublicKey();
```

`getPublicKey` 接受一个地址参数，但会忽略它：它总是返回当前激活账户的 x-only taproot 公钥。它需要钱包处于解锁状态，并且与 `getAccounts` 一样会等待用户解锁。

### 签名

```javascript
// Sign one PSBT (hex). The user approves it in the wallet.
const signedPsbtHex = await subfrost.signPsbt(unsignedPsbtHex);

// Keep the signed PSBT unfinalized, for example when another party still has to sign
const partial = await subfrost.signPsbt(unsignedPsbtHex, { autoFinalized: false });

// Request a sighash type for a specific input (0x83 = SIGHASH_SINGLE | ANYONECANPAY)
const listing = await subfrost.signPsbt(unsignedPsbtHex, {
  autoFinalized: false,
  toSignInputs: [{ index: 0, sighashTypes: [0x83] }],
});

// Prove control of an address
const signature = await subfrost.signMessage('Authorize this action', accounts[0]);
```

`signPsbt(psbtHex, options?)` 的选项：

| 选项 | 作用 |
| --- | --- |
| `autoFinalized` | 省略时，钱包会最终确定（finalize）它所签名的输入。传入 `false` 可以拿回一个已签名但未最终确定的 PSBT。 |
| `toSignInputs` | 由 `{ index, sighashTypes? }` 条目组成的数组，用于为某个输入请求 sighash 类型。它不决定哪些输入会被签名。 |

`signMessage(message, address)` 会按地址类型选择签名格式：taproot 地址使用 BIP-322，其他地址使用 BIP-137（旧版 Bitcoin Signed Message）。

### 为扩展构建 PSBT

- **输入。** 钱包会签署所有属于它的输入，其余输入保持不变。它通过 `witness_utxo` 的脚本识别自己的输入，因此请为每个输入设置 `witness_utxo`。对于 p2wpkh 输入，还需设置包含钱包公钥的 `bip32_derivation`。
- **其他方的输入。** 默认情况下钱包会最终确定 PSBT，如果有任何输入未被签名，它会拒绝。当 PSBT 中有由他人签名的输入时，请传入 `autoFinalized: false`。
- **选币由你负责。** 钱包不会为你的 PSBT 挑选输入。请自行选择输入，并排除携带 Alkanes 的 UTXO，否则这些资产会随交易一起转移。
- **手续费。** 如果你的 PSBT 支付的费率低于钱包当前的费率，钱包可能会在签名前提高手续费，方式是减少你的找零输出，或添加它自己的一个输入和找零输出。请从返回的 PSBT 中重新读取交易内容。
- **广播。** provider 没有广播方法。由你的应用广播已签名的交易。

### 签署多个 PSBT

有两个调用都接受一个 PSBT hex 字符串数组作为参数，区别在于用户需要批准的次数：

- **`signPsbts(psbts, options?)`** 会为每个 PSBT 各发送一个请求，每个请求都使用与 `signPsbt` 相同的 `options`。用户需要逐一批准。
- **`signPsbtBundle(psbts, options?)`** 会把整个数组作为一个单独的请求发送，用户只需对整个 bundle 批准一次。批准界面会展示 bundle 中的每一笔交易；当钱包能够将该 bundle 识别为一个已知操作时，还会在批准界面上标注该操作。`options` 会被接受但不会被应用：bundle 中的每个 PSBT 都以默认设置签名（最终确定、默认 sighash）。

两者都会按照与输入相同的顺序返回已签名的 PSBT；传入空数组时，两者都会返回空数组。如果用户拒绝，整个调用都会被拒绝，且不会返回任何结果，因此应重新提交尚未签名的剩余部分，而不要指望得到部分结果。

```javascript
// One approval per PSBT
const signed = await subfrost.signPsbts([psbtA, psbtB, psbtC]);

// One approval for the whole bundle
const signedBundle = await subfrost.signPsbtBundle([psbtA, psbtB, psbtC]);
```

### 响应钱包变化

该 provider 是一个事件发射器（event emitter）。使用 `on` 订阅，使用 `off` 取消订阅。

| 事件 | 处理函数参数 | 触发时机 |
| --- | --- | --- |
| `accountsChanged` | `(accounts)`，一个包含新选中地址的数组，或空数组 | 钱包解锁，或用户切换钱包、账户或地址类型，或添加、删除账户。空数组表示钱包已被锁定。 |
| `disconnect` | 无 | 用户在 Connected Sites 中撤销了对你站点的授权 |

```javascript
const onAccountsChanged = (accounts) => {
  // Re-read state, or treat an empty list as "locked"
};

subfrost.on('accountsChanged', onAccountsChanged);
subfrost.on('disconnect', () => {
  // Drop the session and show your connect button again
});

// Later, when your component unmounts
subfrost.off('accountsChanged', onAccountsChanged);
```

目前没有 network-changed 事件。需要获取当前网络时，请调用 `getNetwork()`。

### 错误与超时

每个方法在失败时都会以一个 `Error` 拒绝，该 Error 的 message 以方括号中的代码作为前缀，后面跟着一段人类可读的说明：

```
[REQUEST_TIMEOUT] subfrost: request timed out
```

你的应用需要处理的是这两个代码：

| 代码 | 含义 |
| --- | --- |
| `REQUEST_TIMEOUT` | 已经过去 60 秒，钱包仍未响应。用户很可能根本没有看到这个提示，或者钱包一直处于锁定状态。 |
| `UNKNOWN_ERROR` | 请求未能完成，包括用户拒绝了该请求或拒绝了连接提示。 |

其他任何代码都请当作无法连接到扩展来处理。

一个未得到回应的请求会在 60 秒后被拒绝。请把这种情况当作"没有回应"来处理，而不是当作用户拒绝，并引导用户打开钱包后重试。

:::warning[目前无法区分用户拒绝与其他失败]
当用户拒绝某个提示时，钱包会回复一条消息，但不带任何代码，因此它到达你的页面时会表现为 `UNKNOWN_ERROR`。附带的消息是本地化的，也就是说它会随用户的语言而变化，因此不能用它来做安全的匹配判断。在专门的拒绝代码出现之前，请把签名调用返回的任何 `UNKNOWN_ERROR` 都当作"请求未能完成"处理，并让用户重试，而不是展示一个针对拒绝场景的专门错误提示。
:::

```javascript
try {
  const signed = await subfrost.signPsbt(psbtHex);
} catch (err) {
  if (err.message.startsWith('[REQUEST_TIMEOUT]')) {
    // No answer. Ask the user to open the wallet and try again.
  } else {
    // The user rejected, or the wallet reported an error. Let them retry.
  }
}
```

## 远程签名（二维码配对）

当没有注入式 provider 时，就通过 SUBFROST 配对桥（pair bridge）与移动端钱包配对。应用渲染一个配对二维码，手机扫描后通过配对桥连接到应用，随后建立会话。请求与响应是端到端加密的：配对桥从不接触配对码或应用的公钥，因此无法读取或篡改请求，并且每一次签名请求都需要在手机端得到批准。

完整协议（配对 URI、配对桥帧、密钥派生、分帧、消息格式、安全模型）以及参考客户端都在 [WalletConnect](../api-reference/guides/walletconnect) 页面中。

## 接下来去哪里

- [WalletConnect](../api-reference/guides/walletconnect)：远程签名协议详解。
- [包装 frBTC](./wrapping-frbtc)：一次值得签署的首笔交易。
- [安全须知](../using-subfrost/safety)：Alkanes 场景下使用全新钱包的习惯。
