# Dungeon - An online multiplayer roguelike

This is an online multiplayer roguelike based on NodeJS for the server and a Phaser 3 front-end client all coded in TypeScript.

## Overview

Each game world consists of a number of connected levels. Time in the game world is broken into a series of ticks, 10 per second. All actions take place on these ticks. Actions cost action points and generally have cooldowns. All of this gives the game a realtime feel but with some turn-based aspects. Game world updates are sent to the players as things change.

Players choose a race and profession for their character. Their race determines their starting attributes and their profession determines their starting equipment and special abilities. Both race and class determine what enhancements the character gets as they level up.

## Character Professions

- Barbarian - The barbarian is whirlwind of melee damage and can charge through enemies while attacking them multiple times.
- Cleric - The cleric uses divine energy to smite enemies at close range while falling back to melee attacks as needed. A divine blast will strike all creatures within sight. Unholy creatures are especially vulnerable.
- Illusionist - A master of deceiving the mind, the illusionist can turn invisible to avoid enemies or surprise them with a deadly spell.
- Ranger - An expert at hunting prey from a distance, the ranger can make ranged attacks against multiple enemies.
- Rogue - Preferring to stay out of sight until the time is right, the rogue can camouflage into walls and surprise enemies.
- Warrior - The highly trained warrior is a master of melee weapons and defensive techniques.
- Wizard - While commanding the deadliest magic spells in the game, the wizard can also teleport to any square in range.

## Character Races

- Dwarf - A lifetime of living deep under the mountains has made the dwarf hearty and able to spot his enemies in the darkness of the dungeons. Relying mainly on melee attacks, the dwarf's ranged and magic abilities are lacking.
- Elf - This woodland race is very fast, has sharp vision, and are experts with ranged attacks. While preferring to keep their enemies at a distance, their melee skills are weak and they are not very stout.
- Giant - These gargantuans from the north are extremely tough and can bash anything that comes near them. Their large size but small brain makes them very slow and unskilled with magic and ranged weapons.
- Gnome - While not physically impressive or skilled with weapons like some of the other the other races, a keen mind has made the gnome a master of the magical arts.
- Halfling - The diminutive halfling is skilled with ranged weapons but also knows how to exploit enemies in close combat. The only race to master both abilities.
- Human - A versatile jack-of-all-trades, humans can adapt to any situation and do it all. Unsure of what awaits you in the dungeons? Maybe human is your best choice.

## Tech Overview

The game consists of a web client made with TypeScript and the Phaser 3 game engine, and a server made with TypeScript and NodeJS using websockets. The project consists of 3 smaller projects managed using yarn workspaces. There is a shared code project where the message types and other common code lives.

## Running the Game

`yarn client` starts a webserver to serve the client on localhost:3000

`yarn server` start the node server which listens for player connections on localhost:3001 and manages the game world.
