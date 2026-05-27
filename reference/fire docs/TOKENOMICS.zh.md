# FIRE 代币经济学（完整中文版）

## 概览

FIRE 是构建在 ALKANES 元协议（比特币）上的实用型代币。它通过 oyl-amm 上 **DIESEL/frBTC LP 池**的**时间锁仓 LP 头寸**来计量产出。

- **0% 预挖**，100% 通过释放进入流通
- 三大机制相互啮合：
  1. **LP 质押（带锁仓）** — 抵押 DIESEL/frBTC LP 赚取 FIRE
  2. **债券（Bonding）** — 用 LP 折价买入 FIRE，LP 永久进入协议金库（POL）
  3. **赎回地板（Redemption Floor）** — 销毁 FIRE 换取金库背书的 LP，构成硬性价格地板

---

## 一、代币供应

| 指标 | 数值 |
|---|---|
| 最大供应量 | **2,100,000 FIRE** |
| 小数位 | 8（与比特币一致） |
| 预挖 | **0%** |
| 释放方式 | 100%（质押 + 债券） |

### 供应分配

```
最大供应量：2,100,000 FIRE
├── 质押释放池 (85%)：1,785,000 FIRE
└── 债券释放池 (15%):    315,000 FIRE
```

创世时 FIRE 总供应 = 0。所有代币只能通过质押奖励和债券进入流通。

---

## 二、释放（Emission）计划

FIRE 减半周期为 **每 105,000 个区块**，与比特币区块高度对齐。
减半网格锚定在区块 0 上（每 105,000 倍数处）。
**第一次 FIRE 减半 = 下一次比特币减半（区块 1,050,000）**。此后每隔一次 FIRE 减半都与比特币减半重合（每 210,000 块）。

### 每个 Epoch 的释放速率

| Epoch | 区块范围 | 质押/天 | 债券/天 | 总计/天 | 累计供应 |
|---|---|---|---|---|---|
| 0 | 0–104,999 | ~1,224 FIRE | ~216 FIRE | ~1,440 FIRE | 1,050,000 |
| 1 | 105,000–209,999 | ~576 | ~144 | ~720 | 1,575,000 |
| 2 | 210,000–314,999 | ~216 | ~72 | ~360 | 1,837,500 |
| 3 | 315,000–419,999 | ~144 | ~36 | ~180 | 1,968,750 |
| … | … | … | … | … | 2,100,000（上限） |

### 每区块释放速率

| 池 | 速率（基本单位/块） | 每日（FIRE） | 每年（FIRE） |
|---|---|---|---|
| 质押池 (85%) | 850,000,000 | ~1,224 | ~446,250 |
| 债券池 (15%) | 150,000,000 | ~216 | ~78,750 |
| **合计** | **1,000,000,000** | **~1,440** | **~525,000** |

### 几何级数收敛

每个 epoch 释放量为前一 epoch 的一半，几何级数收敛到：

```
total = epoch_0 × Σ(1/2^i), i=0..∞
      = 1,050,000 × 2
      = 2,100,000 FIRE = MAX_SUPPLY
```

---

## 三、质押（Staking）

用户将 **DIESEL/frBTC LP 代币**存入 `fire-staking` 合约，可选锁仓期，按 Synthetix 累加器方式获得 FIRE 奖励。

### 锁仓乘数

锁仓时间越长，权重越高：

| 锁仓时长 | 区块数 | 乘数 | 有效速率 |
|---|---|---|---|
| 不锁仓 | 0 | 1.0× | base |
| 1 周 | 1,050 | 1.25× | 1.25 × base |
| 1 月 | 4,375 | 1.5× | 1.5 × base |
| 3 月 | 13,125 | 2.0× | 2.0 × base |
| 6 月 | 26,250 | 2.5× | 2.5 × base |
| 1 年 | 52,500 | 3.0× | 3.0 × base |

锁仓时长均派生自 `HALVING_INTERVAL = 105,000` 区块。
**锁仓结束时间不得超过当前 epoch 的结束时间**。

### 加权计算（Synthetix 累加器）

```
reward_per_token += emission_rate × blocks × PRECISION / total_weighted_stake
user_fire_earned = weighted_amount × (reward_per_token − user_checkpoint) / PRECISION
```

其中：
- `weighted_amount = deposit × multiplier / 100`（multiplier 以基点存储）
- `reward_per_token` 为全局累加器
- 使用 U256 算术，避免高速率下溢出

### Position NFT 架构

`fire-staking` **不使用按 caller 索引的存储**，而是给每次 `stake()` 创建一个 **Position NFT**（`fire-position-token`），通过工厂 cellpack 实例化。

Position NFT 内部记录：
- `deposit_amount`（存入的 LP 量）
- `weighted_amount`（乘数加权后的量）
- `lock_end`（锁仓结束区块）
- `multiplier`（锁仓乘数）
- `reward_checkpoint`（用户 checkpoint）
- `deposit_token_id`（精确退回相同的代币）

操作（`unstake`、`claim_rewards`、`split`、`merge`）接受 `target_position: AlkaneId` 参数：当同一 UTXO 持有多个 NFT 时选定目标，`{0,0}` 等于「找到的第一个」（向后兼容）。

只有金库（即 staking 合约本身，作为 `context.caller`）有权修改 NFT 的 checkpoint / pending 字段。

### wLP（Wrapped LP）—— LP 流动性与质押头寸分离

质押会产生一个 **包含 FIRE 收益权 + wLP 索取权**的完整 NFT 头寸。用户可以选择拆分（Split），把 wLP 单独抽出，作为**同质化代币流通**：

```
Stake(LP)            → NFT（完整头寸）
Split(NFT)           → NFT（仅 FIRE 收益）+ wLP（同质化的 LP 索取权）
Merge(NFT + wLP)     → NFT（完整头寸）
```

- **作用**：在不放弃质押头寸（仍可吃 FIRE 排放）的前提下，让被锁的 LP 重新具备流动性 —— wLP 可在二级市场流通、抵押、组队。
- **过期处理**：epoch 到期后，wLP 可**直接赎回 LP**，不再需要原始 NFT。
- 客户端可通过 `GetPositionSplitStatus`（opcode 37）查询某个 NFT 是否已 Split。

---

## 四、债券（Bonding）

`fire-bonding` 让用户用 LP **折价**买入 FIRE（带 vesting）。LP 永久进入金库，**直接从债券释放池铸造 FIRE**（不占用质押池额度）。

### 核心特性

- **定价**：基于质押的价格预言机（locked LP / 年化质押释放量）
- **默认 vesting 周期**：`1,050` 区块（≈ 7 天，WEEK = HALVING_INTERVAL / 100），**部署时确定，不可改**
- **LP 去向**：金库（协议拥有的流动性 POL）
- **铸造路径**：opcode 78（`MintFromBondingPool`，仅 bonding 合约可调用）
- **价格地板保护**：`bond_price = max(oracle_discounted, floor_price)`

### 定价公式

```
oracle_price    = max(total_locked_lp, 1 LP) × DECIMAL / annual_staking_emission
effective_price = oracle_price × (10000 − discount_bps) / 10000
bond_price      = max(effective_price, floor_price)
```

- `total_locked_lp` 仅统计 **≥ 6 个月锁仓**的 LP（来自当前活跃 staking clone）
- `floor_price` 来自金库 `GetRedemptionRate`（opcode 23）
- `discount_bps` 默认 `1000`（10%）

**经济直觉**：长期质押者越多 → FIRE 价格越高 → 同样 LP 能换到的 FIRE 越少 → 金库以更高效率积累 LP。债券大致等价于「1 年基础速率质押 + 10% 奖励」，但 LP 永远归属协议。

### 防套利

- **地板保护**：定价不会跌破赎回地板，避免「债券 → 赎回」无风险套利
- **vesting**：默认 1,050 块 vesting 防闪电套利
- **`epoch_start = 部署高度`**：避免创世位于过去时容量瞬间解锁
- **`total_claimed_fire`**：opcode 33 追踪实际已领取量，用于精准计算流通供应

### 关键 Opcode

| Opcode | 功能 |
|---|---|
| 0 | Initialize |
| 1 | Bond（用 LP 换债券头寸） |
| 2 | ClaimVested（领取已 vest 的 FIRE，按 `target_position` 选 NFT） |
| 4 | SetDiscount（admin） |
| 6 | SetPaused（admin） |
| 7 | SetPriceOracle（admin 替换价格预言机） |
| 23–31 | View（折扣、价格、债券信息） |

---

## 五、赎回（Redemption / 价格地板）

`fire-redemption` 允许销毁 FIRE 换取金库中按比例的 LP 背书，是 FIRE 的**硬性价格地板**。

### 机制

- **默认手续费**：1%（最大可调至 10%）
- **无冷却期** — 手续费本身就有抑制作用
- **按比例分摊**：用户得到 `(burn_amount × treasury_lp) / total_supply × (1 − fee)`
- **先 call 金库再 burn**：防止「先 burn 抬高每股价值再赎回」的套利

### 地板价公式

```
floor_price = treasury_backing / total_fire_supply
```

例：金库 100,000 LP，FIRE 流通 1,000,000 → 地板 = 0.1 LP / FIRE。
当市价跌破地板，套利者买入 FIRE 并赎回 LP，将价格推回地板。

### 关键 Opcode

| Opcode | 功能 |
|---|---|
| 0 | Initialize |
| 1 | Redeem（销毁 FIRE 换取 LP） |
| 2 | SetFee（admin，最多 10%） |
| 20–24 | View（费率、地板、预览） |

---

## 六、金库（Treasury）

`fire-treasury` 是一个**极简、被动**的合约：

- **唯一职责**：持有 DIESEL LP 作为赎回背书
- **无 admin 提款**、无分配、无 vesting
- **来源**：通过债券存入 LP **有机积累**
- 仅在初始化时绑定 bonding/redemption 地址，部署后不可改

### Opcode

| Opcode | 功能 |
|---|---|
| 0 | Initialize（绑定 FIRE token + diesel LP token） |
| 10 | Deposit（任何人可存入，非 LP 部分原路退回） |
| 11 | RedeemBacking（仅 redemption 合约可调） |
| 23 | GetRedemptionRate（每 FIRE 对应的 LP，按 1e8 缩放） |
| 24 | GetTotalBacking（总 LP 持仓） |

---

## 七、价格预言机（fire-price-oracle）

完全链上、**部署后不可调参**。

- 价格公式：`price = max(total_locked_lp, 1 LP) × DECIMAL / annual_staking_emission`
- 使用当前 epoch 的减半后释放速率
- 数据源：staking 工厂 → 当前活跃 clone → `total_locked_lp`（仅 ≥ 6 个月锁仓计入）
- **Fail-closed**：工厂/staking 查询失败直接 revert，不返回回退价
- `RecordPurchase` 为 no-op（基于质押，没有虚拟储备）

---

## 八、合约公开 ID（代理地址）

代理 ID 和 beacon ID 由运行时在部署时分配（动态 `2:N`），部署后写入
`.deploy-ids.env`。实现 / 模板 / 不可升级 token 的槽位是固定的。

| 合约 | 公开 ID | 实现 ID | 类型 |
|---|---|---|---|
| **fire-master-auth (FIRE-AUTH)** | **`4:255`** | — | 全系统共享 auth NFT |
| fire-token | 动态 `2:N` | `4:512` | 可升级代理 |
| fire-staking-factory | 动态 `2:N` | `4:513` | 可升级代理 |
| fire-treasury | 动态 `2:N` | `4:514` | 可升级代理 |
| fire-bonding | 动态 `2:N` | `4:515` | 可升级代理 |
| fire-redemption | 动态 `2:N` | `4:516` | 可升级代理 |
| fire-price-oracle | 动态 `2:N` | `4:517` | 可升级代理 |
| fire-staking 克隆（每 epoch） | `2:N` | `4:518` | beacon-proxy 克隆 |
| staking beacon | 动态 `2:N` | — | beacon（master auth 控制）|
| fire-position-token 克隆（每次 stake） | `2:M` | `4:521` | beacon-proxy 克隆 |
| position beacon | 动态 `2:N` | — | beacon（master auth 控制）|
| beacon-proxy 模板（共享） | `4:520` | — | staking 克隆 + position NFT 共用 |
| fire-upgradeable 模板 | `4:530` | — | CREATECHILD 源（6 个代理） |
| fire-upgradeable-beacon 模板 | `4:531` | — | CREATECHILD 源（两个 beacon）|
| fire-bond-token | `4:263` | — | 直接部署（不可升级） |
| fire-series-token（wLP, FIRE-PT-N） | `4:264` | — | 直接部署（不可升级） |

### 升级机制

- **单例合约**用 `fire-upgradeable`（基于 `alkanes-std-upgradeable` 的 FIRE 定制版本）：代理存 `/implementation`，所有调用 `delegatecall`；持有 **master auth (4:255)** 的人调 opcode 32766 即可升级。
- **质押克隆 + position NFT** 用 **beacon + beacon-proxy**：每次调用先 staticcall beacon 查实现再 delegatecall。**升级 beacon = 所有现存克隆/NFT 即时使用新逻辑。**
- 整个系统通过**一个共享 auth NFT**（FIRE-AUTH, 4:255, 1 unit）控制全部升级。这与 alkanes-std-upgradeable 默认行为不同——FIRE 自定义的代理在 init 阶段接收已有 auth 的 AlkaneId 而非铸造新的。

---

## 九、关键常量

```rust
// 减半（与比特币同步）
BITCOIN_HALVING:  210,000 blocks
HALVING_INTERVAL: 105,000 blocks  // BTC / 2

// 区块时长（均派生自 HALVING_INTERVAL）
WEEK:         1,050  blocks
MONTH:        4,375
THREE_MONTHS: 13,125
SIX_MONTHS:   26,250
YEAR:         52,500

// 供应（8 位小数）
MAX_SUPPLY:            210,000,000,000,000  // 2.1M FIRE
STAKING_EMISSION_POOL: 178,500,000,000,000  // 1.785M FIRE（85%）
BONDING_EMISSION_POOL:  31,500,000,000,000  // 315K FIRE（15%）

// 速率（Epoch 0，单位/块）
STAKING_EMISSION_RATE: 850,000,000  // ~1,224 FIRE/天
BONDING_EMISSION_RATE: 150,000,000  // ~216 FIRE/天

// 债券
DEFAULT_DISCOUNT_BPS:   1000   // 10%
DEFAULT_VESTING_PERIOD: 1,050  // ~7 天（部署后不可改）

// 赎回
DEFAULT_REDEMPTION_FEE_BPS: 100   // 1%
MAX_FEE_BPS:                1000  // 10%
MIN_REDEMPTION:             100,000,000  // 1 FIRE
```

---

## 十、经济飞轮

```
                +------------------+
                |  LP 提供者       |
                | (DIESEL/frBTC)   |
                +--------+---------+
                         |
                  抵押 LP / 赚 FIRE
                         v
+----------------+   +----------------+   +----------------+
|   债券 Bond    |-->|   FIRE 供应    |<--|  质押释放      |
|  (折价 + POL)  |   |   (85/15 分配) |   |  (Staking)     |
+--------+-------+   +--------+-------+   +----------------+
         |                    |
         |              价格  v
         |           +----------------+
         |           |   FIRE 市场    |
         |           |  (FIRE/BTC)    |
         |           +--------+-------+
         |                    |
         |             跌破地板时
         v                    v
+----------------+    +----------------+
|   金库 (POL)   |--->|   赎回机制     |
|                |    |   (价格地板)   |
+----------------+    +----------------+
```

---

## 十一、风险提示

1. **定价模型风险**：债券价格依赖质押预言机；启动期 locked LP 很少时 FIRE 价格极低。
2. **空金库启动**：0% 预挖意味着创世时金库为空，地板 = 0，需要债券或质押者主动积累。
3. **锁仓流动性风险**：被锁的 LP 无法响应市场剧变（wLP 缓解了这一点，但 wLP 本身仍受质押头寸约束）。
4. **比特币出块时间方差**：所有「每天 / 每年」估算基于 10 分钟均值，实际会浮动。

---

## 十二、未来方向（待定）

- 治理代币功能
- 支持更多 LP 对
- 动态释放率调整
- DAO 控制的金库参数
- 永久锁仓机制（veFIRE）
