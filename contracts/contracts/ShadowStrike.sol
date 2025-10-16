// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint64, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ShadowStrike - A Secret On-Chain Battle Arena
/// @author
/// @notice Players register encrypted stats and battle without revealing them. Only the winner is public.
contract ShadowStrike is SepoliaConfig {
    struct Player {
        euint32 attack;
        euint32 defense;
        euint32 hp;
        bool registered;
        string name;
    }

    struct BattleRecord {
        uint256 id;
        address opponent; // Opponent address
        euint32 result; // Encrypted result: 0 = lost, 1 = win, 2 = draw
        uint256 createdAt;
    }

    mapping(address => Player) public players;
    address[] public playerAddresses;

    mapping(address => BattleRecord[]) public battleHistory;

    event PlayerRegistered(address indexed player, string indexed name);

    /// Emitted after a battle with encrypted outcome flags (interpretable off-chain)
    event BattleResolvedEncrypted(
        address indexed challenger,
        address indexed opponent,
        uint256 battleId,
        euint32 encResult // result: 0 = lost, 1 = win, 2 = draw
    );

    /// @notice Register your encrypted battle stats with a chosen character name.
    /// @dev Stats are generated randomly within a max value of 100.
    /// @param name The name of the player's character
    function registerPlayer(string calldata name) external {
        require(!players[msg.sender].registered, "Player already registered");

        // Generate random encrypted stats (128)
        euint32 attack = FHE.randEuint32(128);
        euint32 defense = FHE.randEuint32(128);
        euint32 hp = FHE.randEuint32(128);

        players[msg.sender] = Player({attack: attack, defense: defense, hp: hp, registered: true, name: name});
        playerAddresses.push(msg.sender);

        FHE.allowThis(attack);
        FHE.allowThis(defense);
        FHE.allowThis(hp);

        emit PlayerRegistered(msg.sender, name);
    }

    uint256 public battleCounter = 0;

    /// @notice Start a battle between msg.sender and another player.
    /// @param opponent The address of the player you want to battle.
    /// @dev Winner is decided privately using encrypted arithmetic. Only the winner address is revealed.
    function battle(address opponent) external returns (euint32 encResult) {
        address challenger = msg.sender;
        require(players[challenger].registered, "Challenger not registered");
        require(players[opponent].registered, "Opponent not registered");
        require(challenger != opponent, "Cannot battle yourself");

        Player storage p1 = players[challenger];
        Player storage p2 = players[opponent];

        // Compute damage: max(0, attack - defense)
        euint32 damageAonB = FHE.max(FHE.sub(p1.attack, p2.defense), FHE.asEuint32(0));
        euint32 damageBonA = FHE.max(FHE.sub(p2.attack, p1.defense), FHE.asEuint32(0));

        // Remaining HPs after damage
        euint32 newBHP = FHE.sub(p2.hp, damageAonB);
        euint32 newAHP = FHE.sub(p1.hp, damageBonA);

        // Encrypted conditions
        ebool condP1Wins = FHE.lt(newBHP, newAHP); // Challenger has more HP left
        ebool condDraw = FHE.eq(newAHP, newBHP); // Both HPs are equal

        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);
        euint32 two = FHE.asEuint32(2); // for draw

        // Encrypted result code: 2 = draw, 1 = win, 0 = loss
        encResult = FHE.select(condDraw, two, FHE.select(condP1Wins, one, zero));
        euint32 encOpponentResult = FHE.select(condDraw, two, FHE.select(condP1Wins, zero, one));

        // Allow battle result decryption for players
        FHE.allowThis(encResult);
        FHE.allow(encResult, challenger);
        FHE.allowThis(encOpponentResult);
        FHE.allow(encOpponentResult, opponent);

        // Update encrypted HPs
        players[opponent].hp = newBHP;
        players[challenger].hp = newAHP;

        FHE.allow(players[opponent].hp, opponent);
        FHE.allow(players[challenger].hp, challenger);

        FHE.allowThis(players[opponent].hp);
        FHE.allowThis(players[challenger].hp);

        // Increment global counter for unique ID
        battleCounter++;

        // Create BattleRecord and allow decryption
        BattleRecord memory challengerRecord = BattleRecord({
            id: battleCounter,
            opponent: opponent,
            result: encResult,
            createdAt: block.timestamp
        });
        BattleRecord memory opponentRecord = BattleRecord({
            id: battleCounter,
            opponent: challenger,
            result: encOpponentResult,
            createdAt: block.timestamp
        });

        // Store battle history
        battleHistory[challenger].push(challengerRecord);
        battleHistory[opponent].push(opponentRecord);

        // Now allow decryption for stored results

        FHE.allowThis(battleHistory[challenger][battleHistory[challenger].length - 1].result);
        FHE.allowThis(battleHistory[opponent][battleHistory[opponent].length - 1].result);
        FHE.allow(battleHistory[challenger][battleHistory[challenger].length - 1].result, challenger);
        FHE.allow(battleHistory[opponent][battleHistory[opponent].length - 1].result, opponent);

        FHE.allow(battleHistory[challenger][battleHistory[challenger].length - 1].result, opponent);
        FHE.allow(battleHistory[opponent][battleHistory[opponent].length - 1].result, challenger);

        emit BattleResolvedEncrypted(challenger, opponent, battleCounter, encResult);

        return (encResult);
    }

    /// @notice View if a player is registered.
    function isRegistered(address player) external view returns (bool) {
        return players[player].registered;
    }

    function getBattleHistory(address player) external view returns (BattleRecord[] memory) {
        return battleHistory[player];
    }

    function getPlayer(address player) external view returns (Player memory) {
        return players[player];
    }

    function getAllPlayers() public view returns (address[] memory) {
        return playerAddresses;
    }
}
