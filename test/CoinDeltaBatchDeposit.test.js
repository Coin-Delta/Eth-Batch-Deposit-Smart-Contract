const CoinDeltaBatchDeposit = artifacts.require("CoinDeltaBatchDepsoit"); 

contract("CoinDeltaBatchDeposit", (accounts) => {
  let coinDeltaDeposit;

  before(async () => {
    coinDeltaDeposit = await CoinDeltaBatchDeposit.new(true, "0x0000000000000000000000000000000000000000");
  });

  it("should not allow depositing more than 100 nodes at once", async () => {
    // Creating data for 101 nodes
    const pubkeys = Array.from({ length: 101 }, (_, i) => web3.utils.fromAscii(`pubkey${i}`));
    const withdrawalCredentials = Array.from({ length: 101 }, (_, i) => web3.utils.fromAscii(`cred${i}`));
    const signatures = Array.from({ length: 101 }, (_, i) => web3.utils.fromAscii(`sig${i}`));
    const depositDataRoots = Array.from({ length: 101 }, (_, i) => web3.utils.keccak256(`data${i}`));

    try {
      await coinDeltaDeposit.deposit(pubkeys, withdrawalCredentials, signatures, depositDataRoots, {
        from: "0x7842534cc4861352ed6cdd4532e9216804362bdd", 
        value: web3.utils.toWei("6400", "ether"), 
      });
      assert.fail("Expected an error");
    } catch (error) {
      assert.include(error.message, "you can deposit only 1 to 100 nodes per transaction");
    }
  });

  it("should not allow depositing with insufficient ETH", async () => {
    const pubkeys = [web3.utils.fromAscii("0xa9cdf02e162e55e4b0ecf0b6fd3db35bcab54d6c390be44fddab31f9de7b9b42edd9ac30768fd47f042cf13302a98703")];
    const withdrawalCredentials = [web3.utils.fromAscii("cred1")];
    const signatures = [web3.utils.fromAscii("sig1")];
    const depositDataRoots = [web3.utils.keccak256("data1")];

    try {
      await coinDeltaDeposit.deposit(pubkeys, withdrawalCredentials, signatures, depositDataRoots, {
        from: "0x7842534cc4861352ed6cdd4532e9216804362bdd", 
        value: web3.utils.toWei("31", "ether"),
      });
      assert.fail("Expected an error");
    } catch (error) {
      assert.include(error.message, "the amount of ETH does not match the amount of nodes");
    }
  });

  it('should allow pausing and resuming the contract', async () => {
    await coinDeltaDeposit.pause({ from: accounts[0] });
    const isPaused = await coinDeltaDeposit.paused.call();
    assert.isTrue(isPaused, 'Contract should be paused');
  
    await coinDeltaDeposit.unpause({ from: accounts[0] });
    const isUnpaused = await coinDeltaDeposit.paused.call();
    assert.isFalse(isUnpaused, 'Contract should be unpaused');
  });

  it('should not allow direct ETH transactions', async () => {
    try {
      await coinDeltaDeposit.sendTransaction({ from: accounts[0], value: web3.utils.toWei('1', 'ether') });
      assert.fail('Transaction should have reverted');
    } catch (error) {
      assert.include(error.message, 'revert', 'Transaction should revert');
    }
  });

  it('should reject deposit with incorrect parameters length', async () => {
    const pubkeys = ['0xa06601a7b9e2d0b4b4c6437f65bb554e566eacb40eebf37f47fb72db40d0e93a6b6b9b31786788b0c1ed1e2807bd6111']; 
    const withdrawalCredentials = ['0x010000000000000000000000bfed634db643ba48cc1ba454eaa09cbfbf5e6601']; 
    const signatures = ['0xa0fa89a44acd4256f9586399bf5d922427e4a39e267e8e01bd8fb4467a7c12b7a509be7c6d30fbb649ad3fd918325295188763639d5fa192e8d9e44891b7ab7ced4db2a1f70e370f5210cc31fc2ccfd15355c92b941ec7d777611c85333ec987']; 
    const depositDataRoots = ['0xbacf047f7f9a99d930c4d1d5c9b34cd8fcf932444f9856bb909dc7466443569e']; 

    // Removing one item from `withdrawalCredentials` to simulate incorrect parameters length
    withdrawalCredentials.pop();
    const nodesAmount = pubkeys.length;
    try {
      await coinDeltaDeposit.deposit(
        pubkeys,
        withdrawalCredentials,
        signatures,
        depositDataRoots,
        { from: accounts[0], value: web3.utils.toWei((nodesAmount * 32).toString(), 'ether') }
      );
      assert.fail('Deposit should have reverted');
    } catch (error) {
      assert.include(error.message, 'CoinDeltaBatchDepsoit: amount of parameters do no match', 'Deposit should revert');
    }
  });

  it('should reject deposit if amount of ETH does not match the amount of nodes', async () => {

    const pubkeys = ['0xa06601a7b9e2d0b4b4c6437f65bb554e566eacb40eebf37f47fb72db40d0e93a6b6b9b31786788b0c1ed1e2807bd6111']; 
    const withdrawalCredentials = ['0x010000000000000000000000bfed634db643ba48cc1ba454eaa09cbfbf5e6601']; 
    const signatures = ['0xa0fa89a44acd4256f9586399bf5d922427e4a39e267e8e01bd8fb4467a7c12b7a509be7c6d30fbb649ad3fd918325295188763639d5fa192e8d9e44891b7ab7ced4db2a1f70e370f5210cc31fc2ccfd15355c92b941ec7d777611c85333ec987']; 
    const depositDataRoots = ['0xbacf047f7f9a99d930c4d1d5c9b34cd8fcf932444f9856bb909dc7466443569e']; 
  
    // Sending incorrect nodesAmount
    const nodesAmount = pubkeys.length +1;
    try {
      await coinDeltaDeposit.deposit(
        pubkeys,
        withdrawalCredentials,
        signatures,
        depositDataRoots,
        { from: accounts[0], value: web3.utils.toWei((nodesAmount * 32).toString(), 'ether') }
      );
      assert.fail('Deposit should have reverted');
    } catch (error) {
      assert.include(error.message, 'CoinDeltaBatchDepsoit: the amount of ETH does not match the amount of nodes', 'Deposit should revert');
    }
  });

  it('should not allow deposit after contract is paused', async () => {
    await coinDeltaDeposit.pause({ from: accounts[0] });
  
    const pubkeys = ['0xa06601a7b9e2d0b4b4c6437f65bb554e566eacb40eebf37f47fb72db40d0e93a6b6b9b31786788b0c1ed1e2807bd6111']; 
    const withdrawalCredentials = ['0x010000000000000000000000bfed634db643ba48cc1ba454eaa09cbfbf5e6601']; 
    const signatures = ['0xa0fa89a44acd4256f9586399bf5d922427e4a39e267e8e01bd8fb4467a7c12b7a509be7c6d30fbb649ad3fd918325295188763639d5fa192e8d9e44891b7ab7ced4db2a1f70e370f5210cc31fc2ccfd15355c92b941ec7d777611c85333ec987']; 
    const depositDataRoots = ['0xbacf047f7f9a99d930c4d1d5c9b34cd8fcf932444f9856bb909dc7466443569e']; 
    const nodesAmount = pubkeys.length;
    try {
      await coinDeltaDeposit.deposit(
        pubkeys,
        withdrawalCredentials,
        signatures,
        depositDataRoots,
        { from: accounts[0], value: web3.utils.toWei((nodesAmount * 32).toString(), 'ether') }
      );
      assert.fail('Deposit should have reverted');
    } catch (error) {
      assert.include(error.message, 'Pausable: paused', 'Deposit should revert');
    }
  });
});