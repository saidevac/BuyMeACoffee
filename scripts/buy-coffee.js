// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { id } = require("ethers/lib/utils");
const hre = require("hardhat");

//Returns the Ethers balance of a given address
async function getBalance(address){
   const balanceBigInt =  await hre.waffle.provider.getBalance(address);
   return hre.ethers.utils.formatEther(balanceBigInt);
}


//Logs the Ether balance for a list of addresses
async function printBalance(addresses){
  let idx = 0;
  for (const address of addresses){
    console.log(`Address ${idx} balance`,await getBalance(address));
    idx++;
  }
}

//Logs the Memos stored on-chain from coffee purchases
async function printMemos(memos){
  for(const memo of memos){
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp},${tipper},(${tipperAddress}) said "${message}"`);
  }

}



async function main() {

  //Get example accounts we will be working with
  const [owner, tipper, tipper2, tipper3,newOwner] = await hre.ethers.getSigners(); 
  
  //Get the contract to deploy.
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();
  await buyMeACoffee.deployed();

  //Deploy the contract
  console.log("BuyMeACoffee deployed at ",buyMeACoffee.address);
  
  //Check balances before the coffee purchase
  const addresses  = [owner.address,tipper.address,tipper2.address,tipper3.address,buyMeACoffee.address];
  console.log("Starting balances");
  console.log(await printBalance(addresses));  

  //Buy the Owner a few coffee
  const tip = {value: hre.ethers.utils.parseEther("0.001")};
  await buyMeACoffee.connect(tipper).buyCoffee("Sarah","Have a coffee on me",tip);
  await buyMeACoffee.connect(tipper2).buyCoffee("Adel","Cuppa on me",tip);
  await buyMeACoffee.connect(tipper3).buyCoffee("Alexis","Tea party",tip);



  //Check balances after coffee purchase
  console.log("== bought coffee");
   console.log(await printBalance(addresses));

   //Withdraw funds
  await buyMeACoffee.connect(owner).withdrawTips();
  console.log("== after withdraw tips");

  //Check balance after withdraw
  console.log(await printBalance(addresses));
  
  //Read all the memos left for the owner
  const memos = await buyMeACoffee.getMemos();
   console.log(printMemos(memos));

  //change owner
  await buyMeACoffee.changeOwner(newOwner.address);
  console.log("==owner changed to "+newOwner.address);
  
  //Buy the new Owner a coffee
  await buyMeACoffee.connect(tipper).buyCoffee("sai","Here's coffee to new owner",tip);
  
  //check balances after new owner
  console.log("== new owner got a tip");
  console.log(await printBalance(addresses));

  //try changing owner as a tipper
  console.log("==tipper trying to change ownership to self");
  await buyMeACoffee.connect(tipper).changeOwner(tipper.address);
  

 }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
