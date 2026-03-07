# NerveSwap JS SDK

### Start

```
import nerveswap, { mainnet, testnet } from 'nerveswap-sdk
mainnet() // set up the network, default is mainnet
```

### EVM to NERVE

#### Check token allowance

```
const needAuth = await nerveswap.evm.checkAuth({
  provider: 'ethereum', // the wallet collected to the dapp, ex: ethereum/NaboxWallet
  tokenContract: '',
  multySignContract: '',
  address: '', // your evm address
  amount: '' // transfer amount, ex: 1000000000000000000
})
```

#### Approve token

```
nerveswap.evm.approve({
  provider: 'ethereum',
  tokenContract: '',
  multySignContract: '',
  address: ''
});
```

#### Cross to NERVE

```
nerveswap.evm.crossIn({
  provider: 'ethereum',
  multySignContract: '',
  nerveAddress: '', // your nerve address
  amount: '',
  from: '', // your evm address
  tokenContract: ''
})
```

### Get address and pub

```
/**
 * @param {object} param
 * @param {string} param.provider the wallet collected to the dapp, ex: ethereum/NaboxWallet
 * @param {string} param.address the collected address
 * @param {string} [param.message] the sign message, default is Generate Multi-chain Address
 * @returns {Promise<{address: { NERVE: string, NULS: string, EVM: string, TRON: string }, pub: string}>}
 */
nerveswap.getAccount(param)
```

### NERVE Transfer

#### Transfer transaction

```
/**
 * @param {object} param
 * @param {string} param.provider
 * @param {string} param.from
 * @param {string} param.to
 * @param {number} param.assetChainId
 * @param {number} param.assetId
 * @param {string} param.amount
 * @param {string} [param.remark]
 * @param {number} param.type  -2|10  transfer type, default is 2. set to 10 when the target address 
 * @param {string} param.EVMAddress the sign address
 * @param {string} param.pub the pub of the sign address
 * @returns {Promise<{hash: string} | {error: {code: number, message: string}}>}
 */
nerveswap.transfer.transfer(param)
```

#### Withdrawal to L1, add withdrawal fee

```
/**
 * @param {object} param
 * @param {string} param.provider
 * @param {string} param.from
 * @param {number} param.assetChainId
 * @param {number} param.assetId
 * @param {string} param.amount
 * @param {object} param.feeInfo the withdrawal fee info
 * @param {string} param.feeInfo.amount
 * @param {number} param.feeInfo.assetChainId
 * @param {number} param.feeInfo.assetId
 * @param {string} param.heterogeneousAddress // L1 target address
 * @param {number} param.heterogeneousChainId
 * @param {string} [param.remark]
 * @param {string} param.EVMAddress
 * @param {string} param.pub
 * @returns {Promise<{hash: string} | {error: {code: number, message: string}}>}
 */
nerveswap.transfer.withdrawal(param)

/**
 * @param {object} param
 * @param {string} param.provider
 * @param {string} param.from
 * @param {string} param.amount
 * @param {number} param.assetChainId
 * @param {number} param.assetId
 * @param {string} param.txHash the hash of the withdrawal tx
 * @param {string} [param.remark]
 * @param {string} param.EVMAddress
 * @param {string} param.pub
 * @returns {Promise<{hash: string} | {error: {code: number, message: string}}>}
 */
nerveswap.transfer.addFee(param)
```

### Nerve Swap

```
const swap = new nerveswap.swap()
```

#### Calculate the number of swaps

```
/**
 * @param {object} param
 * @param {string} param.fromAssetKey
 * @param {string} param.toAssetKey
 * @param {string} param.amount
 * @param {string} [param.direction = from | to] default is from
 * @returns {Promise<{amount: string, priceImpact: string, routes: string[], fee: string}>}
 */
swap.getSwapInfo(param)
```

#### Send swap tx

```
/**
 * @param {object} param
 * @param {string} param.provider
 * @param {string} param.from
 * @param {string} param.fromAssetKey
 * @param {string} param.toAssetKey
 * @param {string} param.amount
 * @param {string} [param.slippage='0.5']
 * @param {string} [param.remark]
 * @param {string} param.EVMAddress
 * @param {string} param.pub
 * @returns {Promise<{hash: string} | {error: {code: number, message: string}}>}
 */
swap.swapTrade(param)
```

### Nerve Liquidity

#### Send create liquidity pair tx

```
/**
 * @param {object} param
 * @param {string} param.provider
 * @param {string} param.from
 * @param {object} param.tokenA
 * @param {number} param.tokenA.assetChainId
 * @param {number} param.tokenA.assetId
 * @param {object} param.tokenB
 * @param {number} param.tokenB.assetChainId
 * @param {number} param.tokenB.assetId
 * @param {string} [param.remark]
 * @param {string} param.EVMAddress
 * @param {string} param.pub
 * @returns {Promise<{hash: string} | {error: {code: number, message: string}}>}
 */
nerveswap.liquidity.createPair(param)
```

#### Cal the amount of add liquidity

```
/**
 * @param {object} param
 * @param {string} param.tokenAKey ex: 5-1
 * @param {string} param.tokenBKey ex: 2-1
 * @param {string} param.amount
 * @param {string} [param.direction= from | to]
 * @param {boolean} [param.refresh] force to refresh
 * @returns {Promise<string>}
 */
nerveswap.liquidity.calAddLiquidity(param)
```

#### Send add liquidity tx

```
/**
 * @param {object} param
 * @param {string} param.provider
 * @param {string} param.from
 * @param {object} param.tokenA
 * @param {number} param.tokenA.assetChainId
 * @param {number} param.tokenA.assetId
 * @param {string} param.tokenA.amount
 * @param {object} param.tokenB
 * @param {number} param.tokenB.assetChainId
 * @param {number} param.tokenB.assetId
 * @param {string} param.tokenB.amount
 * @param {string} [param.remark]
 * @param {string} param.EVMAddress
 * @param {string} param.pub
 * @returns {Promise<{hash: string} | {error: {code: number, message: string}}>}
 */
nerveswap.liquidity.addLiquidity(param)
```

#### Cal the amount of remove liquidity

```
/**
 * @param {object} param
 * @param {string} param.tokenAKey
 * @param {string} param.tokenBKey
 * @param {string} param.amount
 * @param {boolean} [param.refresh]
 * @returns {Promise<{tokenAAmount: string, tokenBAmount: string}>}
 */
nerveswap.liquidity.calRemoveLiquidity(param)
```

#### Send remove liquidity tx

```
/**
 * @param {object} param
 * @param {string} param.provider
 * @param {string} param.from
 * @param {string} param.removeAmount
 * @param {object} param.tokenA
 * @param {number} param.tokenA.assetChainId
 * @param {number} param.tokenA.assetId
 * @param {object} param.tokenB
 * @param {number} param.tokenB.assetChainId
 * @param {number} param.tokenB.assetId
 * @param {object} param.tokenLP the liquidity pair info
 * @param {number} param.tokenLP.assetChainId
 * @param {number} param.tokenLP.assetId
 * @param {string} [param.remark]
 * @param {string} param.EVMAddress
 * @param {string} param.pub
 * @returns {Promise<{hash: string} | {error: {code: number, message: string}}>}
 */
nerveswap.liquidity.removeLiquidity(param)
```

### Farm

#### Send farm stake tx

```
/**
 * @param {object} param
 * @param {string} param.provider
 * @param {string} param.from
 * @param {string} param.amount
 * @param {numbrt} param.assetChainId
 * @param {numbrt} param.assetId
 * @param {string} param.farmHash
 * @param {string} [param.remark]
 * @param {string} param.EVMAddress
 * @param {string} param.pub
 * @returns {Promise<{hash: string} | {error: {code: number, message: string}}>}
 */
nerveswap.farm.stake(param)
```

#### Claim

```
/**
 * @param {object} param
 * @param {string} param.provider
 * @param {string} param.from
 * @param {numbrt} param.assetChainId
 * @param {numbrt} param.assetId
 * @param {string} param.farmHash
 * @param {string} [param.remark]
 * @param {string} param.EVMAddress
 * @param {string} param.pub
 * @returns {Promise<{hash: string} | {error: {code: number, message: string}}>}
 */
nerveswap.farm.claim(param)
```

#### Unstake

```
/**
 * @param {object} param
 * @param {string} param.provider
 * @param {string} param.from
 * @param {string} param.amount
 * @param {numbrt} param.assetChainId
 * @param {numbrt} param.assetId
 * @param {string} param.farmHash
 * @param {string} [param.remark]
 * @param {string} param.EVMAddress
 * @param {string} param.pub
 * @returns {Promise<{hash: string} | {error: {code: number, message: string}}>}
 */
nerveswap.farm.withdrawal(param)
```

### Readme

<br>