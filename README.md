# Dungeon - An online multiplayer roguelike

This is an online multiplayer roguelike based on NodeJS for the server and a Phaser 3 front-end client all coded in TypeScript.

## Overview

Each game world consists of a number of connected levels. Time in the game world is broken into a series of ticks, 10 per second. All actions take place on these ticks. Actions cost action points and generally have cooldowns. All of this gives the game a realtime feel but with some turn-based aspects. Game world updates are sent to the players as things change.

Players choose a race and profession for their character. Their race determines their starting attributes and their profession determines their starting equipment and special abilities. Both race and class determine what enhancements the character gets as they level up.

## Character Professions

- Barbarian - Charge through enemies while attacking them.
- Cleric - Use divine energy to attack creatures within sight. Unholy creatures are especially vulnerable.
- Illusionist - Move around while invisible to avoid or surprise enemies.
- Ranger - Make ranged attacks against multiple enemies.
- Rogue - Camouflage into walls and surprise enemies.
- Warrior - TBD
- Wizard - Teleport to any square in range.

## Character Races

- Dwarf - Pros: High health and great vision. Cons: Slow and poor ranged/magic skills.
- Elf - Pros: Fast, good vision, and ranged attacks. Cons: Low health and poor melee skills.
- Giant - Pros: Very high health and melee skills. Cons: Very slow and very poor ranged/magic skills.
- Gnome - Pros: Good vision and magic skills. Cons: Low health and poor ranged/melee skills.
- Human - No major pros/cons. Average on most everything.

## Tech Overview

The game consists of a web client made with TypeScript and the Phaser 3 game engine, and a server made with TypeScript and NodeJS using websockets. The project consists of 3 smaller projects managed using yarn workspaces. There is a shared code project where the message types and other common code lives.

## Running the Game

`yarn client` starts a webserver to serve the client on localhost:3000

`yarn server` start the node server which listens for player connections on localhost:3001 and manages the game world.
