const config = {
  agent: '0xdd720d1f98a2d661bda2422b4384a2df0722aaf8', //Changed
  voting: '0x0a690f5e089cff1c707f3348a468cd2d4ec35dbc', //Changed
  networkId: 5,
  transactions: [ //dissect and figure out this part
    {
      to: '0xda63076f958d664c6e2cced7435a47f0122ace97', //contract you're interacting with, if interacting with tokens, 
      signature: 'mint(address,uint256)', //Changed to mint function
      args: ['0x75FAA463C11E97304770b06F3A798776315b8C6f', '1'], //Set to take my address, and to mint 1 token
    },
  ],
};
//This scripts allows, if you have a token, allows you to command agent to do something
export default config;
