const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3') // construct func
const web3 = new Web3(ganache.provider())
const { abi, evm } = require('../compile')

let accounts
let lottery

beforeEach(async () => {
  // * get a list of ganache  test account
  accounts = await web3.eth.getAccounts()

  // * use test account deploy contract to eth
  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ from: accounts[0], gas: '1000000' })
})

describe('lottery', () => {
  it('deploy a contract', () => {
    assert.ok(lottery.options.address)
  })

  it('allow player enter contract', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    })

    const currentPlayers = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], currentPlayers[0]);
    assert.equal(1, currentPlayers.length);
  })

  it('allow multi player enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.03', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.04', 'ether')
    });

    const currentPlayers = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], currentPlayers[0]);
    assert.equal(accounts[1], currentPlayers[1]);
    assert.equal(accounts[2], currentPlayers[2]);
    assert.equal(3, currentPlayers.length);
  })

  it('require minimum ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  })

  it('only manager can pick winner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  })

  it('sends money to the winner & resets players', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    const initWallet = await web3.eth.getBalance(accounts[0]);

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const beforeTradeWallet = await web3.eth.getBalance(accounts[0]);

    assert(beforeTradeWallet - initWallet > web3.utils.toWei('1.9', 'ether'));

    const currentPlayers = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(0, currentPlayers.length);
  })
})