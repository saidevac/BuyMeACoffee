//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

/** deployed at goerli 0x8825ef4615a563A9E803263D82eCc69E34dACeA1
 */

contract BuyMeACoffee {

    //Event to emit when a Memo is created
    event NewMemo(

        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    //Memo struct.
    struct Memo{
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    //List of memos received from friends
    Memo[] memos;

    //Address of contract deployer
    address payable owner;

    //Deploy logic.
    constructor(){
        owner = payable(msg.sender);
    }

    
    /**
     * @dev changeOwner of this contract
     * @param _newOwner address of the new owner
     */
    function changeOwner(address _newOwner) public{
       require(msg.sender== owner,"you have to be current owner to assign new owner");
        owner = payable(_newOwner);

    }


    /**
     * @dev buy a coffee for contract owner
     * @param _name name of the coffee buyer
     * @param _message a nice message from the coffee buyer 
     */
    function buyCoffee(string memory _name,string memory _message) public payable{
        require(msg.value > 0,"can't buy coffee with 0 eth");

        memos.push(Memo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        ));

        emit NewMemo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        );
    }

    /**
     * @dev send the entire balance stored to the user
     */
    function withdrawTips() public {
        require(owner.send(address(this).balance));

    }

   /**
     * @dev retrieve all the memos received and stored in the blockchain
     */
    function getMemos() public view returns(Memo[] memory) {
        return memos;
    }


}
