const { expect /* , assert */ } = require("chai");
const { ethers } = require("hardhat");
/* const { utils, BigNumber } = require("ethers"); */

const toWei = (num) => ethers.utils.parseEther(num.toString());
/* const fromWei = (num) => ethers.utils.formatEther(num); */

describe("NftMarketPlace", function () {
  let market;
  let nft;
  let nftContractAddress;
  let marketAddress;
  let dutchAuctionFactory;
  let dutchAuctionFactoryaddress;
  let englishAuctionFactory;
  let englishAuctionFactoryaddress;
  const forwarderAddress = "0xE041608922d06a4F26C0d4c27d8bCD01daf1f792";

  beforeEach(async () => {
    const DutchAuctionFactory = await ethers.getContractFactory(
      "DutchAuctionFactory"
    );
    dutchAuctionFactory = await DutchAuctionFactory.deploy();
    await dutchAuctionFactory.deployed();
    dutchAuctionFactoryaddress = dutchAuctionFactory.address;

    const EnglishAuctionFactory = await ethers.getContractFactory(
      "EngAuctionFactory"
    );
    englishAuctionFactory = await EnglishAuctionFactory.deploy();
    await englishAuctionFactory.deployed();
    englishAuctionFactoryaddress = englishAuctionFactory.address;

    const Market = await ethers.getContractFactory("NftMarketPlaceV2");
    market = await Market.deploy(
      dutchAuctionFactoryaddress,
      englishAuctionFactoryaddress /* ,
      forwarderAddress */
    );
    await market.deployed();
    marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFTV2");
    nft = await NFT.deploy(marketAddress /* , forwarderAddress */);
    await nft.deployed();
    nftContractAddress = nft.address;

    await market.setNftAddress(nftContractAddress);
  });

  // Version 2 with custom error statements -------------------------------------------------------------------------------
  it("Should Mint and trade NFTs", async function () {
    //test to receive listing price and auction price
    let listingPrice = await market.LISTINGPRICE();
    listingPrice = listingPrice.toString();

    // const auctionPrice = ethers.utils.parseUnits("100", "ether");

    const [owner, addr1, addr2] = await ethers.getSigners();
    // mint and create marketItem
    await nft.createNFT("https-1", {
      value: listingPrice,
    });
    /*  await market.mintMarketToken(nftContractAddress, {
      value: listingPrice,
    }); */
    // getting one item from the market and ensuring that every field is correct
    /* let test1 = await market.idToMarketToken(1);
    // nft contract address
    expect(test1[0]).to.be.equal(nftContractAddress);
    // tokenId
    expect(test1[1]).to.be.equal("1");
    // price (not on sale yet)
    expect(test1[2]).to.be.equal("0");
    // onSale
    expect(test1[3]).to.be.equal(false);
    // owner
    expect(test1[4]).to.be.equal("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    // make sure the owner is picked up correctly
    expect(test1[4]).to.be.equal(owner.address);
    // seller
    expect(test1[5]).to.be.equal("0x0000000000000000000000000000000000000000");
    // original minter of the nft
    expect(test1[6]).to.be.equal("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"); */
    /* console.log(await nft.ownerOf(0)); */

    // testing if nft contract is saving right owner
    expect(await nft.ownerOf(1)).to.be.equal(owner.address);

    // minting 3 extra NFT's and marketItems (makes a total of 4)
    await nft.createNFT("https-2", {
      value: listingPrice,
    });
    /*  await market.mintMarketToken(nftContractAddress, {
      value: listingPrice,
    }); */
    await nft.createNFT("https-3", {
      value: listingPrice,
    });
    /*   await market.mintMarketToken(nftContractAddress, {
      value: listingPrice,
    }); */
    await nft.createNFT("https-4", {
      value: listingPrice,
    });
    /*  await market.mintMarketToken(nftContractAddress, {
      value: listingPrice,
    }); */
    // paying wrong listingPrice
    // 1.

    await expect(
      nft.createNFT("https-3", {
        value: toWei(0.001),
      })
    ).to.be.revertedWith("NftMarketPlace__DidNotPayLISTINGPRICE");
    // 2.
    await expect(
      nft.createNFT("https-3", {
        value: toWei(0.003),
      })
    ).to.be.revertedWith("NftMarketPlace__DidNotPayLISTINGPRICE");
    await nft.approve(marketAddress, 1);
    // putting up 3 nft's for sale
    await market.sellMarketToken(
      1,
      200 // , nftContractAddress
    );
    await nft.approve(marketAddress, 2);
    await market.sellMarketToken(
      2,
      200 // , nftContractAddress
    );
    await nft.approve(marketAddress, 3);
    await market.sellMarketToken(
      3,
      200 // , nftContractAddress
    );

    // trying to sell a token which is already on sale
    await expect(
      market.sellMarketToken(
        3,
        200 // , nftContractAddress
      )
    ).to.be.revertedWith("NftMarketPlace__TokenAlreadyOnSale");
    // trying to a token of yourself

    await expect(
      market.buyMarketToken(
        1, // , nftContractAddress
        {
          value: 200,
        }
      )
    ).to.be.revertedWith("NftMarketPlace__CallerIsOwnerOfToken");

    // connecting with a different address buying a token
    await market.connect(addr2).buyMarketToken(
      1, // , nftContractAddress
      {
        value: 200,
      }
    );
    expect(await nft.ownerOf(1)).to.be.equal(addr2.address);
    // trying to buy a token under the selling price
    await expect(
      market.connect(addr1).buyMarketToken(
        3, // , nftContractAddress
        {
          value: 100,
        }
      )
    ).to.be.revertedWith("NftMarketPlace__UnequalToSellPrice");
    // buying a token
    await market.connect(addr1).buyMarketToken(
      3, // , nftContractAddress
      {
        value: 200,
      }
    );
    expect(await nft.ownerOf(3)).to.be.equal(addr1.address);
    // trying to sell a token which we do not own
    await expect(
      market.connect(addr2).sellMarketToken(
        3,
        300 // , nftContractAddress
      )
    ).to.be.revertedWith("NftMarketPlace__NotOwnerOfToken");

    // https://ethereum.stackexchange.com/questions/117944/why-do-i-keep-receiving-this-error-revert-erc721-transfer-caller-is-not-owner
    /* await nft.connect(addr2).setApprovalForAll(marketAddress, true); */
    await nft.connect(addr2).approve(marketAddress, 1);
    await market.connect(addr2).sellMarketToken(
      1,
      420 // , nftContractAddress
    );

    await expect(
      market.buyMarketToken(
        1, // , nftContractAddress
        {
          value: 420,
        }
      )
    );
    /* console.log(await market.fetchAllTokensOnSale()); */
    console.log(await market.fetchAllMyTokens());
    /* console.log(await nft.getMintedTokens()); */
  });
});
