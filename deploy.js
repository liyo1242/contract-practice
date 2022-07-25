const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const { abi, evm } = require('./compile')

const provider = new HDWalletProvider(
  env.process.PNEUMONIC,
  env.process.RINKEBY_ADDRESS
)

const web3 = new Web3(provider)

const deploy = async () => {
  const accounts = await web3.eth.getAccounts()
  console.log(accounts)

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: '1000000', from: accounts[0] })
  console.log('success deploy contract to rinkby', result.options.address)
  provider.engine.stop();
}

deploy()