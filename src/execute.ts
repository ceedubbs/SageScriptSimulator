import { createCallScript } from './lib/aragon';
import { ethers } from 'ethers';

const PK = '73f7579c4aec05e460e0178503c35dde339609fe5f14227bfdc697e1c329f766';
const tokenManager = '0x431e3e54450f74bcc99693ec40d039f8fe2f80c5';
const voting = '0x8955e3ce528516bea867b0b153b8ffc7d4159793';
const transaction = {
  to: tokenManager,
  signature: 'mint(address,uint256)',
  args: ['0x75FAA463C11E97304770b06F3A798776315b8C6f', 1],
};

async function run() {
  // 0. create a signer from seed
  const network = 'goerli';
  const provider = new ethers.providers.AlchemyProvider(network, 'lKgwM_sdXm2V2f8xAyc4pby_cjzDdpR1');
  const wallet = new ethers.Wallet(PK).connect(provider);

  const tx = await executeVoteScript(wallet, voting, tokenManager, 'Mint tokens', transaction);
  console.log(tx.hash);
  console.log(`https://goerli.etherscan.io/tx/${tx.hash}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 *
 * @param wallet Ethers wallet
 * @param votingAddress Address of the voting app
 * @param tokenManagerAddress Address of the token manager app
 * @param metadata Any metadata to be passed to the voting app
 * @param txSettings Object containing the transaction to be executed
 * @returns {Promise<*>}
 */
async function executeVoteScript(wallet, votingAddress, tokenManagerAddress, metadata, txSettings) {
  // 1. create the transaction to be executed on the target contract
  // this can be any external contract or a contract in the DAO as
  // long as the voting app has permissions to execute it
  const targetScript = createCallScript(txSettings);

  // 2. create the transaction to be executed on the voting app.
  // this transaction will execute the target transaction
  const voteScript = createCallScript({
    to: votingAddress,
    signature: 'newVote(bytes,string,bool,bool)',
    args: [targetScript, metadata, true, false],
  });

  // 3. create the token manager contract
  const tokenManagerContract = new ethers.Contract(
    tokenManagerAddress,
    ['function forward(bytes _evmScript)'],
    wallet,
  );

  // 4. call forward on the token manager contract
  return await tokenManagerContract.forward(voteScript);
}
