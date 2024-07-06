//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */

//import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract YourContract {
	mapping(uint256 => ContratoAlquiler) public contratosAlquiler ;

	struct ContratoAlquiler{
		uint256 timestamp;
    	address Owner;
    	address Lesse; 
    	uint256 Monto;
		uint256 ID_propiedad;
	}

	function CrearContrato(address _Owner, address _Lesse, uint256 Monto, uint256 _ID) public {
		//TODO VER COMO PONER LESSE MAS TARDE, POR AHORA QUIEN ALQUILA TAMBIEN ES OWNER
		contratosAlquiler[_ID] = ContratoAlquiler(block.timestamp,_Owner,_Lesse,Monto,_ID);
	}

	function isOwner(uint256 ID_Propiedad,address _Owner)view public returns (bool){
		ContratoAlquiler storage contrato = contratosAlquiler[ID_Propiedad];
		if(contrato.ID_propiedad == 0){
			return false;
		}
		if(contrato.Owner == _Owner){
			return true;
		}
		return false;
	}

	function GetContrato(uint256 ID_propiedad) view public{
		console.log("timestamp: %s",contratosAlquiler[ID_propiedad].timestamp);
	}

	function PagarAlquiler(uint256 ID_propiedad) payable public{
		ContratoAlquiler storage contrato = contratosAlquiler[ID_propiedad];
		require(msg.value == contrato.Monto && msg.sender == contrato.Lesse, "Incorrect Ether amount sent or you are not the lesse");
	}

	function withdraw(uint256 ID_propiedad) public {
		if (isOwner(ID_propiedad,msg.sender)){
			(bool success, ) = msg.sender.call{ value: address(this).balance }("");
			require(success, "Failed to send Ether");
			return;
		}
		bool success = false;
		require(success, "Property does not exist");
	}


	constructor(address _Owner, uint256 monto){
		//transferOwnership(_Owner);
	}

}