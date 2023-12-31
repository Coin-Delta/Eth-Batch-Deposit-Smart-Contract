CoinDelta Eth2 Depositor
=========

CoinDelta Eth2 Depositor allows convenient way to send 1 to 100 deposits in one transaction to Eth2 Deposit Contract.

Contracts
=========

Below is a list of contracts we use for this service:

<dl>
  <dt>Ownable, Pausable</dt>
  <dd>Openzepellin smart contracts. The first contract allows for managing ownership. The second contract allows for pausing the contract and vice versa.</dd>
</dl>

<dl>
  <dt>CoinDeltaEth2Depositor</dt>
  <dd>A smart contract that accepts up to 3200 ETH and sends up to 100 transactions with required collateral (32 ETH) to Eth2 Deposit Contract.</dd>
</dl>

Installation
------------

To run lockup service, install [Homebrew](https://brew.sh), [Node.js](https://nodejs.org), [Truffle](https://www.trufflesuite.com), [OpenZeppelin](https://openzeppelin.com) and pull the repository from `GitHub`:

    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
    brew install node
    npm install -g truffle
    npm install -g @openzeppelin/contracts
    mkdir projects
    cd projects
    git clone https://github.com/CoinDelta/CoinDelta-eth2depositor
    cd CoinDelta-eth2depositor
    truffle init


Setup your `truffle` environment, write migrations:

    truffle develop
    migrate --reset

Deployment (Mainnet)
------------

Smart contracts should be deployed with such constructor parameters:

1. `CoinDeltaEth2Depositor.sol` _(true, 0x0000000000000000000000000000000000000000)_

How to Use
------------

1. Choose amount of Eth2 validator nodes you want to create.
2. Create array with your pubkeys, withdrawal_credentials, signatures and calldata deposit_data_roots.
3. Use _deposit()_ function on `CoinDeltaEth2Depositor` with required ETH value to make deposits to Eth2 Deposit Contract.

License
=========

MIT
