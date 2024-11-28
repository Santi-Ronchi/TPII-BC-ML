//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import "./ContractStates/States.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */

//import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract YourContract {
	address public deployer;

	uint256 constant SECONDS_PER_DAY = 24 * 60 * 60;
    uint256 constant SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY;
    uint256 constant SECONDS_PER_LEAP_YEAR = 366 * SECONDS_PER_DAY;
    uint16 constant ORIGIN_YEAR = 1970;

    // Days in each month for a non-leap year
    uint8[12] daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Days in each month for a leap year
    uint8[12] daysInMonthLeapYear = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	mapping(uint256 => ContratoAlquiler) public contratosAlquiler ;
	mapping(uint256 => bool) public propiedadesAlquiladas;

	event ContratoCreado(
		address Owner,
		address Lessee,
		uint256 Amount,
		uint256 ID,
		uint256 GracePeriod,
		uint256 Penalty_Percentage,
		uint256 Duration
//        uint256 startDate
    );

	struct ContratoAlquiler{
		uint256 timestamp;
		ContractStatus Status;
    	address Owner;
    	address Lessee; 
    	uint256 Amount;
		uint256 PropertyID;
		address AllowedWallet;
		uint256 PenaltyPercentage;
		uint256 GracePeriod;
		uint256 DurationInMonths;
		uint256 TimestampLastPayment; //Cuando se acepta el contrato se toma como el momento del primer timestamp 
		uint256 CollectedAmount;
	}

	function contractExists(uint256 id) public view returns (bool) {
		return propiedadesAlquiladas[id];
	}

	function createContract(uint256 Amount, uint256 _ID, address allowedWallet, uint256 _GracePeriod, uint256 _Penalty_Percentage, uint256 _Duration) public {
		require(!contractExists(_ID),"A contract for the required property already exists");
		contratosAlquiler[_ID] = ContratoAlquiler(block.timestamp,ContractStatus.Draft,msg.sender,address(0),Amount,_ID,allowedWallet,_Penalty_Percentage, _GracePeriod,_Duration,block.timestamp,0);
		propiedadesAlquiladas[_ID] = true;

		emit ContratoCreado(msg.sender,allowedWallet,Amount, _ID,  _GracePeriod,  _Penalty_Percentage,  _Duration);

	}
	

	function rentPaidThisMonth(uint256 _ID) public view returns (bool){
		require(contractExists(_ID),'Property has not contract');
		uint16 year = getYear(contratosAlquiler[_ID].TimestampLastPayment);
        	uint256 daysSinceStartOfYear = (contratosAlquiler[_ID].TimestampLastPayment - getSecondsInYears(year)) / SECONDS_PER_DAY;
        	(uint8 month,) = getMonthAndDay(daysSinceStartOfYear, year);

			uint16 year_now = getYear(block.timestamp);
        	uint256 daysSinceStartOfYear_now = (block.timestamp - getSecondsInYears(year_now)) / SECONDS_PER_DAY;
			(uint8 month_now, ) = getMonthAndDay(daysSinceStartOfYear_now, year_now);

		if (month == month_now && year == year_now){
			return true;
		}
		return false;
	}


	modifier contractCanBeAccepted(uint256 _ID){
		require(contratosAlquiler[_ID].Status == ContractStatus.Draft,'The specified contract cannot be accepted');
		_;
	}

	modifier reviewCanBeAccepted(uint256 _ID){
		require(contratosAlquiler[_ID].Status == ContractStatus.DraftReview,'The specified contract cannot be accepted');
		_;
	}
	
	modifier validLessee(uint256 _ID, address _Lessee){
		require(contratosAlquiler[_ID].Owner != _Lessee, 'The specified lessee is not valid for the current contract');
		_;
	}
	
	modifier activeContract(uint256 _ID){
		require(contratosAlquiler[_ID].Status == ContractStatus.Active);
		_;
	}

	function ownerProposedCancelation(uint256 _Id) public view returns (bool) {
		require(contractExists(_Id),"Contract does not exist");
		return contratosAlquiler[_Id].Status == ContractStatus.CancelationProposedByOwner;
	}

	function haveToPayPenalties(uint256 _Id)public view returns (bool){
		require(contractExists(_Id),"Property is not leasable");
		if(contratosAlquiler[_Id].Status != ContractStatus.Active || 
			contratosAlquiler[_Id].Status != ContractStatus.Draft || 
			contratosAlquiler[_Id].Status != ContractStatus.DraftReview){
			return true;
		}
		return false;
	}

	 function transfer(address payable _to, uint256 _amount) public {
        (bool success,) = _to.call{value: _amount}("");
        require(success, "Failed to send Ether");
    }



	function proposeContractCancelationMutualAgreementOwner(uint256 _Id) public  activeContract(_Id){
		require(contractExists(_Id),"Contract must exist to be cancelled");
		require(isOwner(_Id),"Only the involved parties may propose a contract cancellation");
		contratosAlquiler[_Id].Status = ContractStatus.CancelationProposedByOwner;
	}

	function proposeContractCancelationMutualAgreementLessee(uint256 _Id) public activeContract(_Id) {
		require(contractExists(_Id),"Contract must exist to be cancelled");
		require(isLessee(_Id),"Only the involved parties may propose a contract cancellation");
		contratosAlquiler[_Id].Status = ContractStatus.CancelationPropopsedByLessee;
	}

	function answerContractCancelationPropopsitionLessee(uint256 _ID, bool accept) public {
		require(contractExists(_ID),"Contract must exist to be cancelled");
		require(isLessee(_ID),'Only the current leassee may answer a cancelation propoistion');
		require (ownerProposedCancelation(_ID),'Owner did not propose a contract cancelation');
		if (accept){
			contratosAlquiler[_ID].Status = ContractStatus.Cancelled;
		} else {
			contratosAlquiler[_ID].Status = ContractStatus.Active;
		}
	}

	function answerContractCancelationPropopsitionOwner(uint256 _ID, bool accept) public {
		//Es la respuesta que el owner le responde a quien alquila
		require(isOwner(_ID),'Only the current owner may answer a cancelation propoistion');
		require (contratosAlquiler[_ID].Status == ContractStatus.CancelationPropopsedByLessee,'Tenant did not propose a contract cancelation');
		if (accept){
			contratosAlquiler[_ID].Status = ContractStatus.Cancelled;
		} else {
			contratosAlquiler[_ID].Status = ContractStatus.Active;
		}
	}

	//only usable by owner. Unilateral cancelation of contract
	function cancelContractOwner(uint256 _ID) payable public{
		require(contractExists(_ID),"Property is not leasable");
		require(isOwner(_ID), "Only the owner may cancel the contract");
		uint256 ethPenalty = 10000;
		if(!haveToPayPenalties(_ID)){
			require(msg.value == 0,"No penalty needs to be paid");
		} else {
			//Penalties must be paid
			uint16 year = getYear(contratosAlquiler[_ID].TimestampLastPayment);
        	uint256 daysSinceStartOfYear = (contratosAlquiler[_ID].TimestampLastPayment - getSecondsInYears(year)) / SECONDS_PER_DAY;
        	(uint8 month,) = getMonthAndDay(daysSinceStartOfYear, year);

			uint16 year_now = getYear(block.timestamp);
        	uint256 daysSinceStartOfYear_now = (block.timestamp - getSecondsInYears(year_now)) / SECONDS_PER_DAY;
			(uint8 month_now, ) = getMonthAndDay(daysSinceStartOfYear_now, year_now);
			address payable payableAddress = payable(contratosAlquiler[_ID].Lessee);
			if (year == year_now && month == month_now){
				require(msg.value == ethPenalty + contratosAlquiler[_ID].Amount,'Insuficent funds. You must pay the penalty plus return the amount paid this month');
				transfer(payableAddress, ethPenalty + contratosAlquiler[_ID].Amount);
			} else {
				require(msg.value == ethPenalty,'Insuficent funds. You must pay the penalty for cancelling the contract');
				transfer(payableAddress, ethPenalty);
			}
		}
	}

	function isAllowedWallet(address allowedWallet) public view returns (bool){
		if (msg.sender == allowedWallet){
			return true;
		} return false;
	}
	
	function acceptContract(uint256 propertyID) payable public contractCanBeAccepted(propertyID) {
		require(contractExists(propertyID),"Property is not leasable");
		ContratoAlquiler storage propertyContract = contratosAlquiler[propertyID];
		require(isAllowedWallet(propertyContract.AllowedWallet),'Only the address specified by the owner can accept the contract');
		require(msg.value == propertyContract.Amount * 2,"Tenes que pagar 2 meses por adelantado como deposito");
		propertyContract.Status = ContractStatus.Active;
		propertyContract.Lessee = msg.sender;
		propertyContract.TimestampLastPayment = block.timestamp;
		propertyContract.Amount = msg.value;
	}
	
	function rejectLeaseOffer(uint256 propertyID) public {
		require(contractExists(propertyID) == true, "The specified contract does not exist");
		ContratoAlquiler storage contrato = contratosAlquiler[propertyID];
		require(isAllowedWallet(contrato.AllowedWallet),"Only the client may reject the contract offer");
		contrato.Status = ContractStatus.Cancelled;
	}

	function isLesseeAcceptable(uint256 _ID)public view returns (bool){
		require(contractExists(_ID),"Property is not leasable");
		return contratosAlquiler[_ID].Status == ContractStatus.Draft;
	}

	function isOwnerAcceptable(uint256 _ID)public view returns (bool){
		require(contractExists(_ID),"Property is not leasable");
		return contratosAlquiler[_ID].Status == ContractStatus.DraftReview;
	}

	function proposeChanges(uint256 propertyID, uint256 newAmount, uint256 newPenaltyAmount, uint256 newGracePeriod) public contractCanBeAccepted(propertyID){
		require(contractExists(propertyID),"Property is not leasable");
		ContratoAlquiler storage propertyContract = contratosAlquiler[propertyID];
		require(isAllowedWallet(propertyContract.AllowedWallet),"Only the client may propose a change in the contract");
		propertyContract.Status = ContractStatus.DraftReview;
		propertyContract.Amount = newAmount;
		propertyContract.PenaltyPercentage = newPenaltyAmount;
		propertyContract.GracePeriod = newGracePeriod;
		propertyContract.Lessee = msg.sender;
	}

	function acceptProposedChanges(uint256 propertyID) public {
		require(contractExists(propertyID),"Lease contract does not exist");
		ContratoAlquiler storage propertyContract = contratosAlquiler[propertyID];
		require(isOwner(propertyID),"Only the owner may review the contract");
		require(isOwnerAcceptable(propertyID),"Lessee has not proposed any changes to the existing contract");
		propertyContract.Status = ContractStatus.Draft;
	}

	function reviewProposedChanges(uint256 propertyID, uint256 newAmount, uint256 newPenaltyAmount, uint256 newGracePeriod) public reviewCanBeAccepted(propertyID){
		require(contractExists(propertyID),"Lease contract does not exist");
		ContratoAlquiler storage propertyContract = contratosAlquiler[propertyID];
		require(isOwner(propertyID),"Only the owner may review the contract");
		require(isOwnerAcceptable(propertyID),"Lessee has not proposed any changes to the existing contract");
		propertyContract.Status = ContractStatus.Draft;
		propertyContract.Amount = newAmount;
		propertyContract.PenaltyPercentage = newPenaltyAmount;
		propertyContract.GracePeriod = newGracePeriod;
		propertyContract.Owner = msg.sender;
	}

	function rejectProposedChanges(uint256 propertyID) public {
		require(contractExists(propertyID),"Lease contract does not exist");
		ContratoAlquiler storage propertyContract = contratosAlquiler[propertyID];
		require(isOwner(propertyID),"Only the owner may review the contract");
		require(isOwnerAcceptable(propertyID),"Lessee has not proposed any changes to the existing contract");
		propertyContract.Status = ContractStatus.Cancelled;
	}


	function isOwner(uint256 propertyID)view public returns (bool){
		ContratoAlquiler storage propertyContract = contratosAlquiler[propertyID];
		if(propertyContract.PropertyID == 0){
			return false;
		}
		if(propertyContract.Owner == msg.sender){
			return true;
		}
		return false;
	}

	function isLessee(uint256 propertyID)view public returns (bool){
		ContratoAlquiler storage propertyContract = contratosAlquiler[propertyID];
		if(propertyContract.PropertyID == 0){
			return false;
		}
		if(propertyContract.Lessee == msg.sender){
			return true;
		}
		return false;
	}

	function getTotalAmountToBePaid(uint256 propertyID) view public returns (uint){
		ContratoAlquiler storage contrato = contratosAlquiler[propertyID];
		uint256 fullMonthsOwed = getNumberOfOwedMonths(propertyID);
		uint256 hoy = getDayOfMonthFromEpoch(block.timestamp);
		uint256 thisMonthAmount = 0;
		if (hoy < contrato.GracePeriod){
			thisMonthAmount = contrato.Amount;
		} else {
				//console.log(hoy);
				//console.log(contrato.GracePeriod);
				thisMonthAmount= contrato.Amount + contrato.Amount * contrato.PenaltyPercentage / 100 * (hoy - contrato.GracePeriod) ;
		}
		uint256 totalAmount = thisMonthAmount + contrato.Amount * fullMonthsOwed+ contrato.Amount * contrato.PenaltyPercentage * (30 - contrato.GracePeriod) / 100 * fullMonthsOwed;
		return totalAmount;
	}


    // Main function to calculate the day of the month from an epoch timestamp
    function getDayOfMonthFromEpoch(uint256 epochTime) internal view returns (uint256 dayOfMonth) {
        uint16 year = getYear(epochTime);
        uint256 daysSinceStartOfYear = (epochTime - getSecondsInYears(year)) / SECONDS_PER_DAY;
        
        (uint8 month, uint256 dayInMonth) = getMonthAndDay(daysSinceStartOfYear, year);
        
        return dayInMonth;
    }

    // Determine which year the epoch timestamp belongs to
    function getYear(uint256 epochTime) internal pure returns (uint16 year) {
        uint256 secondsAccountedFor = 0;
        year = ORIGIN_YEAR;

        while (true) {
            uint256 secondsInYear = isLeapYear(year) ? SECONDS_PER_LEAP_YEAR : SECONDS_PER_YEAR;
            if (epochTime < secondsAccountedFor + secondsInYear) {
                return year;
            }
            secondsAccountedFor += secondsInYear;
            year++;
        }
    }

    // Get seconds passed in all the years before the current one
    function getSecondsInYears(uint16 year) internal pure returns (uint256 secondsAccountedFor) {
        for (uint16 i = ORIGIN_YEAR; i < year; i++) {
            if (isLeapYear(i)) {
                secondsAccountedFor += SECONDS_PER_LEAP_YEAR;
            } else {
                secondsAccountedFor += SECONDS_PER_YEAR;
            }
        }
    }

    // Determine whether a given year is a leap year
    function isLeapYear(uint16 year) internal pure returns (bool) {
        if (year % 4 == 0) {
            if (year % 100 == 0) {
                if (year % 400 == 0) {
                    return true;
                }
                return false;
            }
            return true;
        }
        return false;
    }

    // Get the month and the day in that month from the total days in the current year
    function getMonthAndDay(uint256 daysSinceStartOfYear, uint16 year) internal view returns (uint8 month, uint256 dayOfMonth) {
        uint8[12] memory daysInMonthToUse = isLeapYear(year) ? daysInMonthLeapYear : daysInMonth;
        uint256 daysPassed = 0;

        // Loop through months to find the correct one
        for (month = 0; month < 12; month++) {
            if (daysSinceStartOfYear < daysPassed + daysInMonthToUse[month]) {
                dayOfMonth = daysSinceStartOfYear - daysPassed + 1; // Add 1 to get day within the month
                break;
            }
            daysPassed += daysInMonthToUse[month];
        }
    }

	function getNumberOfOwedMonths(uint256 propertyID) public view returns (uint256) {
    ContratoAlquiler storage propertyContract = contratosAlquiler[propertyID];

    // Validate contract exists
    require(propertyContract.TimestampLastPayment != 0, "Invalid property ID");

    uint16 year = getYear(propertyContract.TimestampLastPayment);
    uint256 daysSinceStartOfYear = (propertyContract.TimestampLastPayment - getSecondsInYears(year)) / SECONDS_PER_DAY;
    (uint8 month, ) = getMonthAndDay(daysSinceStartOfYear, year);

    uint16 year_now = getYear(block.timestamp);
    uint256 daysSinceStartOfYear_now = (block.timestamp - getSecondsInYears(year_now)) / SECONDS_PER_DAY;
    (uint8 month_now, ) = getMonthAndDay(daysSinceStartOfYear_now, year_now);

    // Validate year and month comparisons
    require(year_now >= year, "Year underflow detected");

    if (year_now == year) {
        // Same year, calculate months owed
        require(month_now >= month, "Month underflow in same year");
        return month_now > month ? month_now - month - 1 : 0;
    } else {
        // Different year, calculate months owed
        uint256 diff_years = year_now - year;

        if (diff_years == 1) {
            uint256 months_owed = 12 - month + month_now - 1;
            return months_owed == 1 && month_now == 1 ? 0 : months_owed;
        } else {
            // More than one year difference
            uint256 full_years_owed = 12 * (diff_years - 1);
            uint256 months_owed = 12 - month + month_now - 1;
            return full_years_owed + months_owed;
        }
    }
}


	function payRent(uint256 propertyID) payable public{
		ContratoAlquiler storage propertyContract = contratosAlquiler[propertyID];
		require(msg.sender == propertyContract.Lessee, "You are not the lessee");
		uint monto = getTotalAmountToBePaid(propertyID);
		require(msg.value == monto , "Incorrect Ether amount sent");
		propertyContract.CollectedAmount = propertyContract.CollectedAmount + monto;
		propertyContract.TimestampLastPayment = block.timestamp;
	}

	function withdraw(uint256 propertyID) public {
		require(isOwner(propertyID) == true, "Only the owner may extract the ether contained in the contract");
		uint256 currentAmount = getCollectedEtherAmount(propertyID);
		(bool success, ) = msg.sender.call{ value: currentAmount }("");
			require(success, "Failed to send Ether");
			ContratoAlquiler storage contrato = contratosAlquiler[propertyID];
			contrato.CollectedAmount = 0;
			return;
	}
	
	
	//getters
	
	function getCollectedEtherAmount(uint256 propertyID) public view returns(uint256) {
		require(contractExists(propertyID) == true, "The specified contract does not exist");
		ContratoAlquiler storage contrato = contratosAlquiler[propertyID];
		return contrato.CollectedAmount;
	}
	
	function getContractCurrentState(uint256 propertyID) public view returns(ContractStatus) {
		require(contractExists(propertyID) == true, "The specified contract does not exist");
		ContratoAlquiler storage contrato = contratosAlquiler[propertyID];
		return contrato.Status;
	}
	
	function getContractBaseMonthlyAmountToBePaid(uint256 propertyID) public view returns (uint256){
		require(contractExists(propertyID) == true, "The specified contract does not exist");
		ContratoAlquiler storage contrato = contratosAlquiler[propertyID];
		return contrato.Amount;
	}
	
	constructor(address _Owner, uint256 monto){
		deployer = msg.sender;
	}

	modifier isDeployer(){
		require(msg.sender == deployer,"Only the deployer may use this function");
		_;
	}
	
	
	//deployer use only. It may set any parameters it wants over a lease contract 
	function createRawContract(uint256 Amount, uint256 _ID, address allowedWallet, uint256 _GracePeriod, uint256 _Penalty_Percentage, uint256 _Duration,uint256 last_payment_timestamp) public isDeployer(){
		require(!contractExists(_ID),"A contract for the required property already exists");
		contratosAlquiler[_ID] = ContratoAlquiler(block.timestamp,ContractStatus.Draft,msg.sender,address(0),Amount,_ID,allowedWallet,_Penalty_Percentage, _GracePeriod,_Duration,last_payment_timestamp,0);
		propiedadesAlquiladas[_ID] = true;
	}
	
}