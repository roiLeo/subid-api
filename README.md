# Subsocial SubId services by [DappForce](https://github.com/dappforce)

## Api

### Main endpoint

```
api/v1/
```

### Account info

**Get balances from all network by account:**

```
GET /:acccount/balances`
```

Example:

```sh
curl --location --request GET 'http://localhost:3001/api/v1/5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty/balances'

Result:
{
    "subsocial": {
        "accountId": "3rGZ2cUTaCHWgG6z3UL8nFsWvUBt1K5CEeoMXTUVFL2GCZ9q",
        "additional": [],
        "lockedBreakdown": [],
        "isVesting": false,
        "accountNonce": "0",
        "freeBalance": "0",
        "frozenFee": "0",
        "frozenMisc": "0",
        "reservedBalance": "0",
        "votingBalance": "0",
        "availableBalance": "0",
        "lockedBalance": "0",
        "vestingLocked": "0",
        "vestedBalance": "0",
        "vestedClaimable": "0",
        "vestingEndBlock": "0",
        "vestingPerBlock": "0",
        "vestingTotal": "0"
    }
    "kusama": { ... }
    ...
}
```

### Chains info

**Get properties from all supported networks**

```
GET /chains/properties
```

Example:

```sh
curl --location --request GET 'http://localhost:3001/api/v1/chains/properties'

Result:
{
    "subsocial": {
        "ss58Format": 28,
        "tokenDecimals": [
            11
        ],
        "tokenSymbol": [
            "SUB"
        ]
    },
    "kusama": {
        "ss58Format": 2,
        "tokenDecimals": [
            12
        ],
        "tokenSymbol": [
            "KSM"
        ]
    },
    "polkadot": {
        "ss58Format": 0,
        "tokenDecimals": [
            10
        ],
        "tokenSymbol": [
            "DOT"
        ]
    }
}
```

### On-chain identies

**Get Polkadot/Kusama identity and Subsocial profile**
```
GET /:account/identities
```

Example:

```sh
curl --location --request GET 'http://localhost:3001/api/v1/12hAtDZJGt4of3m2GqZcUCVAjZPALfvPwvtUTFZPQUbdX1Ud/identities'

Result:
{
    "kusama": {
        "isVerify": true,
        "info": {
            "additional": [],
            "pgpFingerprint": null,
            "display": "Shawn Tabrizi",
            "legal": "Shawn Tabrizi",
            "web": "shawntabrizi.com",
            "riot": "@shawntabrizi:matrix.parity.io",
            "email": "shawntabrizi@gmail.com",
            "twitter": "@shawntabrizi"
        }
    },
    "polkadot": {
        "isVerify": true,
        "info": {
            "additional": [],
            "pgpFingerprint": null,
            "display": "Shawn Tabrizi",
            "legal": "Shawn Tabrizi",
            "web": "https://shawntabrizi.com",
            "riot": "@shawntabrizi:matrix.parity.io",
            "email": "shawntabrizi@gmail.com",
            "twitter": "@shawntabrizi"
        }
    },
    "subsocial": {
        "id": "3pje7zib32ZA2h61dkCH3Rw4q9PPsoYyEGQ9gPZpNRFHQFnq",
        "struct": {
            "id": "3pje7zib32ZA2h61dkCH3Rw4q9PPsoYyEGQ9gPZpNRFHQFnq",
            "followersCount": 6,
            "followingAccountsCount": 0,
            "followingSpacesCount": 13,
            "reputation": 1,
            "hasProfile": true,
            "createdByAccount": "3pje7zib32ZA2h61dkCH3Rw4q9PPsoYyEGQ9gPZpNRFHQFnq",
            "createdAtBlock": 1174851,
            "createdAtTime": 1603970334000,
            "isUpdated": false,
            "contentId": "bafyreihkuf7fh54qxcoqk33bfrwup5frq44qdolkvckmxk7stk3znjagrm"
        },
        "content": {
            "about": "I am a developer at Parity Technologies working on Substrate!",
            "avatar": "QmUBw1ZyV8P4jkbnhBMU734Cks7bXnRo8gQzwzyvDMbNBz",
            "name": "Shawn Tabrizi",
            "summary": "I am a developer at Parity Technologies working on Substrate!",
            "isShowMore": false
        }
    }
}
```

### Crowdloans by relay chain (polkadot or kusama)

```
GET /crowdloans/:relayChain
```

Example:

```sh
curl --location --request GET 'https://app.subsocial.network/subid/api/v1/crowdloans/kusama'

Result:
[
    {
        "depositor": "DQd4dJJs3hiEMAguTQQ9YGCH8Z6Pq8kxpTRMGHMGbWPcMRi",
        "verifier": null,
        "deposit": 9999999900000,
        "raised": "0x00000000000000000015d476ef8dbe91",
        "end": 10224000,
        "cap": "0x0000000000000000016345da277d6800",
        "lastContribution": {
            "preEnding": 52
        },
        "firstPeriod": 17,
        "lastPeriod": 24,
        "trieIndex": 47,
        "isCapped": false,
        "isEnded": false,
        "isWinner": false,
        "paraId": 2100
    }
]
```

### Crowdloan contributions

```
GET /:account/crowdloans/contributions
```

Example:

```sh
curl --location --request GET 'http://localhost:3001/api/v1/12hAtDZJGt4of3m2GqZcUCVAjZPALfvPwvtUTFZPQUbdX1Ud/crowdloan/contributions'

Result:
{
    "bifrost": "2000000000000",
    "karura": "200000000000000",
    "khala": "200000000000000",
    "moonriver": "200000000000000",
    "shiden": "200000000000000"
}
```

### Supported Statemine assets

```
GET /statemine/assets
```

Example:

```sh
curl --location --request GET 'http://localhost:3001/api/v1/statemine/assetss'

Result:
[
    {
        "assetId": 8,
        "name": "RMRK.app",
        "symbol": "RMRK",
        "icon": "rmrk.png",
        "deposit": 1000000000000,
        "decimals": 10,
        "isFrozen": true,
        "owner": "HKKT5DjFaUE339m7ZWS2yutjecbUpBcDQZHw2EF7SFqSFJH",
        "issuer": "CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp",
        "admin": "CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp",
        "freezer": "CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp",
        "supply": "0x0000000000000000016345785d8a0000",
        "minBalance": 100000,
        "isSufficient": false,
        "accounts": 1711,
        "sufficients": 0,
        "approvals": 0
    },
    ...
]
```

### Get balances from Statemine assets by account

```
GET /statemine/assets/:account
```

Example:

```sh
curl --location --request GET 'http://localhost:3001/api/v1/statemine/assetss/CpjsLDC1JFyrhm3ftC9Gs4QoyrkHKhZKtK7YqGTRFtTafgp'

Result:
{
    "8": {
        "balance": 336569579288025,
        "isFrozen": false,
        "isSufficient": false
    },
    ...
}
```

## Development

```sh
# Install Node.js dependencies
yarn

# Compile TypeScript
yarn build

# Run
yarn start
```

## Available scripts

+ `clean` - remove coverage data, Jest cache and transpiled files,
+ `build` - transpile TypeScript to ES6,
+ `start` - run server,

### Build your own docker image

```sh
docker build . -f docker/Dockerfile -t subsocial-sub-id-servisec:latest
```

## License

Subsocial is [GPL 3.0](./LICENSE) licensed.
