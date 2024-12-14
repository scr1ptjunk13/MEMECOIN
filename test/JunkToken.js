const { expect } = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;

describe("JunkToken contract", function(){
    // Designate global variables
    let Token;
    let junkToken;
    let owner;
    let addr1;
    let addr2;
    let tokenCap = 10000000n; // Use BigInt
    let tokenBlockReward = 50n; // Use BigInt

    // Deploy the contract before each test
    beforeEach(async function () {
        // Get the contract factory and signers
        Token = await ethers.getContractFactory("JunkToken");
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy the token with specified cap and block reward
        junkToken = await Token.deploy(tokenCap, tokenBlockReward);
        await junkToken.waitForDeployment();
    });

    // Test suite for deployment
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await junkToken.owner()).to.equal(owner.address);
        });

        it("Should have correct token name and symbol", async function () {
            expect(await junkToken.name()).to.equal("JunkToken");
            expect(await junkToken.symbol()).to.equal("JNK");
        });

        it("Should set the correct cap", async function () {
            const decimals = await junkToken.decimals();
            const expectedCap = tokenCap * (10n ** BigInt(decimals));
            const cap = await junkToken.cap();
            expect(cap).to.equal(expectedCap);
        });

        it("Should mint initial supply to owner", async function () {
            const decimals = await junkToken.decimals();
            const expectedInitialSupply = 7000000n * (10n ** BigInt(decimals));
            const ownerBalance = await junkToken.balanceOf(owner.address);
            expect(ownerBalance).to.equal(expectedInitialSupply);
        });
    });

    // Test suite for transfers
    describe("Transfers", function () {
        it("Should transfer tokens between accounts", async function () {
            const transferAmount = 50n;
            await junkToken.transfer(addr1.address, transferAmount);
            const addr1Balance = await junkToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(transferAmount);
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            // Transfer more tokens than balance from addr1 (which has no tokens)
            await expect(
                junkToken.connect(addr1).transfer(owner.address, 1n)
            ).to.be.reverted; // Just checks that the transaction fails
        });
    });

    // Test suite for burning tokens
    describe("Burning", function () {
        it("Should allow token burning", async function () {
            const decimals = await junkToken.decimals();
            const initialBalance = await junkToken.balanceOf(owner.address);
            const burnAmount = 100n;
            await junkToken.burn(burnAmount);
            const finalBalance = await junkToken.balanceOf(owner.address);
            expect(finalBalance).to.equal(initialBalance - burnAmount);
        });
    });

    // Test suite for block reward
    describe("Block Reward", function () {
        it("Should allow owner to set block reward", async function () {
            const decimals = await junkToken.decimals();
            const newReward = 100n;
            await junkToken.setBlockReward(newReward);
            const currentReward = await junkToken.blockReward();
            expect(currentReward).to.equal(newReward * (10n ** BigInt(decimals)));
        });

        it("Should prevent non-owner from setting block reward", async function () {
            await expect(
                junkToken.connect(addr1).setBlockReward(100n)
            ).to.be.revertedWith("Only the owner can call this function");
        });
    });

    // Test suite for contract destruction
    describe("Contract Destruction", function () {
        it("Should allow owner to destroy contract", async function () {
            // Modify destroy function in contract to work with current Solidity version

            // Expect contract destruction event
            await expect(junkToken.destroy())
                .to.emit(junkToken, "ContractDestroyed")
                .withArgs(owner.address);

            // Verify owner is reset
            const contractOwner = await junkToken.owner();
            expect(contractOwner).to.equal(ethers.ZeroAddress);
        });

        it("Should prevent non-owner from destroying contract", async function () {
            await expect(
                junkToken.connect(addr1).destroy()
            ).to.be.revertedWith("Only the owner can call this function");
        });
    });

    
});