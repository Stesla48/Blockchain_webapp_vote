const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Voting = await hre.ethers.getContractFactory("Voting");

  const voters = [
    "0x556AdC1Ce977661Fe79071d8E95edfC0063C8EaD",
    "0xF8821c95f60671BbB47f44A66c78B87b41bFc2aB",
    "0x9f412835efeD665C6192ff686ffe7F587A0A7617",
    "0xA0ac9c957E15f0526C8Bcde9a48962eFcfc1569b",
    "0x580BcB4c85dd6225282f99D07ABaC4A6Ed145607"
  ];

  const voting = await Voting.deploy(voters);
  await voting.deployTransaction.wait(); // ✅ ethers v5.x + hardhat 2.23.0

  console.log("Voting contract deployed to:", voting.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
