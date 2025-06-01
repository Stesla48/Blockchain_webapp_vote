const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting, voting, owner, voter1, voter2, voter3, voter4, voter5, nonVoter;

  beforeEach(async () => {
    [owner, voter1, voter2, voter3, voter4, voter5, nonVoter] = await ethers.getSigners();

    const voterAddresses = [
      voter1.address,
      voter2.address,
      voter3.address,
      voter4.address,
      voter5.address,
    ];

    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(voterAddresses);

    // NOT: Node 21'de deployed() çalışmazsa bu satırı YORUMDA bırak!
    // await voting.deployed();  ❌ sadece Node 18 veya 20'de çalışır

    console.log("Voting deployed to:", voting.address);
  });

  it("1 - Sözleşme başarıyla deploy edildi", async () => {
    expect(await voting.owner()).to.equal(owner.address);
  });

  it("2 - Kayıtlı seçmen oy verebiliyor", async () => {
    await voting.connect(voter1).vote(1);
    const [c1Votes, c2Votes] = await voting.getVotes();
    expect(c1Votes).to.equal(1);
    expect(c2Votes).to.equal(0);
  });

  it("3 - Kayıtlı olmayan seçmen oy veremez", async () => {
    await expect(voting.connect(nonVoter).vote(1)).to.be.revertedWith("Not a registered voter.");
  });

  it("4 - Aynı seçmen iki kez oy veremez", async () => {
    await voting.connect(voter2).vote(2);
    await expect(voting.connect(voter2).vote(1)).to.be.revertedWith("Already voted.");
  });

  it("5 - Başarılı oy işlemi sonrası sayaç artar", async () => {
    await voting.connect(voter3).vote(1);
    const [c1Votes, c2Votes] = await voting.getVotes();
    expect(c1Votes).to.equal(1);
    expect(c2Votes).to.equal(0);
  });

  it("6 - İki kişi aynı adaya oy verirse sayaç 2 olur", async () => {
    await voting.connect(voter4).vote(2);
    await voting.connect(voter5).vote(2);
    const [, c2Votes] = await voting.getVotes();
    expect(c2Votes).to.equal(2);
  });

  it("7 - Admin olmayan kişi oylamayı bitiremez", async () => {
    await expect(voting.connect(voter1).endVoting()).to.be.revertedWith("Only owner can call this.");
  });

  it("8 - Oylama bitince seçmen oy veremez", async () => {
    await voting.connect(owner).endVoting();
    await expect(voting.connect(voter1).vote(1)).to.be.revertedWith("Voting has ended.");
  });
});
