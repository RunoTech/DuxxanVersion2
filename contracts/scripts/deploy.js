const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DuxxanPlatform contract to BSC...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address || await deployer.getAddress();
  console.log("Deploying contracts with the account:", deployerAddress);
  
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log("Account balance:", balance.toString());

  // BSC Mainnet USDT address
  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
  
  // Commission wallet address (should be provided via environment variable)
  const COMMISSION_WALLET = process.env.COMMISSION_WALLET || deployerAddress;

  console.log("USDT Token Address:", USDT_ADDRESS);
  console.log("Commission Wallet:", COMMISSION_WALLET);

  // Deploy the contract
  const DuxxanPlatform = await ethers.getContractFactory("DuxxanPlatform");
  const duxxanPlatform = await DuxxanPlatform.deploy(USDT_ADDRESS, COMMISSION_WALLET);

  // Wait for deployment
  const deploymentReceipt = await duxxanPlatform.deployTransaction?.wait();
  const contractAddress = duxxanPlatform.address || await duxxanPlatform.getAddress();
  
  console.log("DuxxanPlatform deployed to:", contractAddress);
  
  // Verify contract configuration
  console.log("\n=== Contract Configuration ===");
  console.log("Raffle Creation Fee:", await duxxanPlatform.RAFFLE_CREATION_FEE());
  console.log("Donation Creation Fee:", await duxxanPlatform.DONATION_CREATION_FEE());
  console.log("Raffle Commission Rate:", await duxxanPlatform.RAFFLE_COMMISSION_RATE(), "%");
  console.log("Donation Commission Rate:", await duxxanPlatform.DONATION_COMMISSION_RATE(), "%");
  console.log("Platform Share:", await duxxanPlatform.PLATFORM_SHARE(), "%");
  console.log("Creator Share:", await duxxanPlatform.CREATOR_SHARE(), "%");
  
  // Save deployment info
  const deploymentInfo = {
    network: "bsc",
    contractAddress: contractAddress,
    usdtAddress: USDT_ADDRESS,
    commissionWallet: COMMISSION_WALLET,
    deployer: deployerAddress,
    deploymentTime: new Date().toISOString(),
    transactionHash: duxxanPlatform.deployTransaction?.hash || deploymentReceipt?.transactionHash,
  };

  console.log("\n=== Deployment Info ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verification command for BSCScan
  console.log("\n=== Verification Command ===");
  console.log(`npx hardhat verify --network bsc ${contractAddress} "${USDT_ADDRESS}" "${COMMISSION_WALLET}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });