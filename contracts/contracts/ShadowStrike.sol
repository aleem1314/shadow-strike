// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
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
    }

    struct BattleRecord {
        address opponent; // Opponent address
        euint32 result; // Encrypted result: 0 = lost, 1 = win, 2 = draw
    }

    mapping(address => Player) public players;
    mapping(address => BattleRecord[]) public battleHistory;

    event PlayerRegistered(address indexed player);

    /// Emitted after a battle with encrypted outcome flags (interpretable off-chain)
    event BattleResolvedEncrypted(
        address indexed challenger,
        address indexed opponent,
        euint32 encP1Wins, // enc boolean: 1 => challenger has greater remaining HP
        euint32 encDraw // enc boolean: 1 => draw (equal remaining HP)
    );

    /// @notice Register your encrypted battle stats.
    /// @param encAttack Encrypted attack value
    /// @param encDefense Encrypted defense value
    /// @param encHP Encrypted HP value
    /// @param proofs Proof
    function registerPlayer(
        externalEuint32 encAttack,
        externalEuint32 encDefense,
        externalEuint32 encHP,
        bytes calldata proofs
    ) external {
        euint32 attack = FHE.fromExternal(encAttack, proofs);
        euint32 defense = FHE.fromExternal(encDefense, proofs);
        euint32 hp = FHE.fromExternal(encHP, proofs);

        players[msg.sender] = Player(attack, defense, hp, true);

        FHE.allowThis(attack);
        FHE.allowThis(defense);
        FHE.allowThis(hp);

        emit PlayerRegistered(msg.sender);
    }

    /// @notice Start a battle between msg.sender and another player.
    /// @param opponent The address of the player you want to battle.
    /// @dev Winner is decided privately using encrypted arithmetic. Only the winner address is revealed.
    function battle(address opponent) external returns (euint32 encP1Wins, euint32 encDraw) {
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

        // Compute encrypted flags
        encP1Wins = FHE.select(condP1Wins, one, zero);
        encDraw = FHE.select(condDraw, one, zero);

        // Encrypted result code: 2 = draw, 1 = win, 0 = loss
        euint32 encResult = FHE.select(condDraw, two, FHE.select(condP1Wins, one, zero));
        euint32 encOpponentResult = FHE.select(condDraw, two, FHE.select(condP1Wins, zero, one));

        // Allow access to small encrypted flags
        FHE.allowThis(encP1Wins);
        FHE.allow(encP1Wins, challenger);
        FHE.allow(encP1Wins, opponent);

        FHE.allowThis(encDraw);
        FHE.allow(encDraw, challenger);
        FHE.allow(encDraw, opponent);

        FHE.allow(encResult, challenger);
        FHE.allow(encOpponentResult, opponent);

        // Update encrypted HPs
        players[opponent].hp = newBHP;
        players[challenger].hp = newAHP;

        FHE.allow(newBHP, opponent);
        FHE.allow(newAHP, challenger);

        // Store battle history
        battleHistory[challenger].push(BattleRecord({opponent: opponent, result: encResult}));

        battleHistory[opponent].push(BattleRecord({opponent: challenger, result: encOpponentResult}));

        emit BattleResolvedEncrypted(challenger, opponent, encP1Wins, encDraw);
        return (encP1Wins, encDraw);
    }

    /// @notice View if a player is registered.
    function isRegistered(address player) external view returns (bool) {
        return players[player].registered;
    }

    function getBattleHistory(address player) external view returns (BattleRecord[] memory) {
        return battleHistory[player];
    }
}
