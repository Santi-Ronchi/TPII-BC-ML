import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

let owner: any, addr1: any , addr2: any;

describe("YourContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let yourContract: YourContract;
  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = (await yourContractFactory.deploy(owner.address,0)) as YourContract;
    await yourContract.waitForDeployment();
  });

  describe("Contract creation", function () {
    it("On creation, a new contract exists", async function () {
	  await yourContract.createContract(1000, 777, addr2.address, 10, 10, 12);
	  expect(await yourContract.contractExists(777)).to.equal(true);
    });
	
	it("On creation, a contract is ready to be accepted by a client", async function (){
		expect(await yourContract.contractExists(777)).to.equal(true);
	});
		
  });

  describe("Contract access", function () {
    it("On creation, another contract with the same id cannot be created", async function () {
		await expect(yourContract.createContract(1000, 777, '0x0000000000000000000000000000000000000000', 10, 10, 12)).to.be.revertedWith('A contract for the required property already exists');
	});	
    it("Once a contract is created, only the client specified by the owner can accept it", async function () {
        await expect(yourContract.connect(addr1).acceptContract(777)).to.be.revertedWith('Only the address specified by the owner can accept the contract');
    });
	it("The client specified by the owner can accept the contract", async function (){
		let depositAmount = await yourContract.getContractBaseMonthlyAmountToBePaid(777) * 2n;
		await expect(yourContract.connect(addr2).acceptContract(777,{value: depositAmount})).to.not.be.reverted;
	});
	it("Once a contract has been accepted, it cannot be re-accepted", async function (){
		await expect(yourContract.connect(addr2).acceptContract(777)).to.be.revertedWith('The specified contract cannot be accepted');
	});
  });
  
  describe("Contract Payments", function () {
	  it("Should the current date exceed the grace period for payment, the amount to be paid is equal to: base amount + percentage * n° of days not paid", async function () {
		const currentDay = new Date(Date.now()).getDate();
		let penaltyAmount = 0;
		if (currentDay - 10 > 0){
			penaltyAmount = (currentDay - 10) * (100);
		};
		let finalAmount = penaltyAmount + 1000;
		expect(await yourContract.getTotalAmountToBePaid(777)).to.equal(finalAmount);
	  });
	  
	  it("Only the lessee can make payments for the lease contract", async function () {
		  await expect(yourContract.connect(addr1).payRent(777)).to.be.revertedWith('You are not the lessee');
	  });
	  
	it("The amount paid by the lessee must be the exact value ", async function (){
		const currentDay = new Date(Date.now()).getDate();
		let penaltyAmount = 0;
		if (currentDay - 10 > 0){
			penaltyAmount = (currentDay - 10) * (100);
		};
		let finalAmount = penaltyAmount + 1000;
		await expect(yourContract.connect(addr2).payRent( 777, {value: finalAmount})).to.not.be.reverted;
	});
	
	it("Once paid, the lease contract shows an increased ether amount" , async function () {
		let amount_expected_to_be_paid = 
		expect(await yourContract.getCollectedEtherAmount(777)).not.to.equal(0);
	});
	
	it("Only the owner may extract the ether contained in the lease contract", async function () {
		await expect(yourContract.connect(addr1).withdraw(777)).to.be.revertedWith("Only the owner may extract the ether contained in the contract") ;
	});
	it("When withdrawing, the lease owner extracts all the ether held in the contract", async function () {
		await yourContract.connect(owner).withdraw(777);
		expect(await yourContract.getCollectedEtherAmount(777)).to.equal(0);
	});
	it("Only one payment may be permited for the current month",async function () {
		expect(await yourContract.rentPaidThisMonth(777)).to.equal(true);
	});
	
  });
  
  describe("Contract conditions negotiation", function(){
	  it("Once the contract has been accepted, the lessee cannot propose changes to it", async function() {
		await expect(yourContract.connect(addr2).proposeChanges(777,100,10,10)).to.be.revertedWith('The specified contract cannot be accepted');
	  });
	  
	  it("Only the potential client may propose changes to the contract", async function () {
		await yourContract.connect(owner).createContract(1000, 778, addr2.address, 10, 10, 12);
		await expect(yourContract.connect(addr2).proposeChanges(778,100,10,10)).to.not.be.reverted;
	  });
	  
	  it("Once the counter-proposal is made, the client cannot accept the contract", async function () {
		await expect(yourContract.connect(addr2).acceptContract(778)).to.be.revertedWith('The specified contract cannot be accepted');
	  });
	  
	  it("Once a counter-proposal is made, the original contract values are replaced with the proposed changes", async function () {
		expect(await yourContract.getContractBaseMonthlyAmountToBePaid(778)).to.equal(100);
	  });
	  it("Once a counter-proposal is made, the owner must answer by setting the new base amount for the contract", async function () {
		await expect(yourContract.connect(owner).reviewProposedChanges(778,100,10,10)).to.not.be.reverted;
	  });
	  it("After the owner reviews the propsal, the contract can be once again accepted", async function () {
		expect(await yourContract.getContractCurrentState(778)).to.equal(0);
	  });  
  });
  
  describe("Calculating debt", function(){
	  it("A lease was paid last two months ago. The amount of full months owed is 1", async function (){
		//we are creating a contract two months before the current date. At day number 1
		const currentDate = new Date();
		const targetMonth = currentDate.getMonth() - 2;
		const targetDate = new Date(currentDate.getFullYear(), targetMonth, 1);
		const epoch = Math.floor(targetDate.getTime() / 1000);
		await yourContract.connect(owner).createRawContract(1000, 779, addr2.address, 10, 10, 12, epoch);
		expect(await yourContract.getNumberOfOwedMonths(779)).to.equal(1);
	  })
	  it("A lease was paid last month. The amount of full months owed is 0", async function () {
		const currentDate = new Date();
		const targetMonth = currentDate.getMonth() - 1;
		const targetDate = new Date(currentDate.getFullYear(), targetMonth, 1);
		const epoch = Math.floor(targetDate.getTime() / 1000);
		await yourContract.connect(owner).createRawContract(1000, 780, addr2.address, 10, 10, 12, epoch);
		expect(await yourContract.getNumberOfOwedMonths(780)).to.equal(0); 
	  });
	  it("A lease was last paid two months ago. As a result, the total amount of debt equals the base amount plus the interes for the remaining days outside of the grace period in a month with 30 days",
		async function () {
			const currentDay = new Date(Date.now()).getDate();
			let penaltyAmount = 0;
			if (currentDay - 10 > 0){
				penaltyAmount = BigInt(currentDay - 10) * 100n;
			};
			let currentMonthAmountToPay = penaltyAmount + 1000n;
			let debt = await yourContract.getTotalAmountToBePaid(779) - currentMonthAmountToPay;
			expect(debt).to.equal(3000n);
		})
	  
  });
  
});
