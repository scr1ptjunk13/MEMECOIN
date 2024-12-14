require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    rinkeby: {
      url: process.env.INFURA_RINKBY_ENDPOINT,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
