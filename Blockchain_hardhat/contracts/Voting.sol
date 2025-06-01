// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

contract Voting {
    address public owner;
    bool public isActive = true;

    struct Voter {
        address addr;
        bool hasVoted;
    }

    Voter[5] public voters;
    uint256 public candidate1Votes;
    uint256 public candidate2Votes;

    constructor(address[5] memory _voterAddresses) {
        owner = msg.sender;
        for (uint i = 0; i < 5; i++) {
            voters[i] = Voter(_voterAddresses[i], false);
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this."); // ← TESTTE BEKLENEN MESAJ
        _;
    }

    function vote(uint8 candidate) public {
        require(isActive, "Voting has ended.");
        bool found = false;

        for (uint i = 0; i < voters.length; i++) {
            if (voters[i].addr == msg.sender) {
                require(!voters[i].hasVoted, "Already voted.");
                voters[i].hasVoted = true;
                found = true;
                break;
            }
        }

        require(found, "Not a registered voter.");

        if (candidate == 1) {
            candidate1Votes++;
        } else if (candidate == 2) {
            candidate2Votes++;
        } else {
            revert("Invalid candidate number.");
        }
    }

    function endVoting() public onlyOwner {
        require(isActive, "Voting already ended.");
        isActive = false;
    }

    function getVotes() public view returns (uint256, uint256) {
        return (candidate1Votes, candidate2Votes);
    }
}
