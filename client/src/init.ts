import * as Phaser from 'phaser'
import { gameState, gameSettings, initControls } from './gameManagement'
import { stateFunctions, States } from './states'

function scenePreload(this: Phaser.Scene) {
  // Images
  this.load.image('title', 'images/screens/title.png')
  this.load.image('race', 'images/screens/choose-race.png')
  this.load.image('profession', 'images/screens/choose-profession.png')

  this.load.image('maptiles', 'images/maptiles.png')

  this.load.image('warrior', 'images/players/warrior.png')
  this.load.image('barbarian', 'images/players/barbarian.png')
  this.load.image('rogue', 'images/players/rogue.png')
  this.load.image('wizard', 'images/players/wizard.png')
  this.load.image('illusionist', 'images/players/illusionist.png')
  this.load.image('ranger', 'images/players/ranger.png')
  this.load.image('cleric', 'images/players/cleric.png')

  // Monsters
  this.load.image('slime', 'images/monsters/slime.png')
  this.load.image('bat', 'images/monsters/bat.png')
  this.load.image('snake', 'images/monsters/snake.png')
  this.load.image('orc', 'images/monsters/orc.png')
  this.load.image('skeleton', 'images/monsters/skeleton.png')
  this.load.image('goblin', 'images/monsters/goblin.png')

  this.load.image('zombie', 'images/monsters/zombie.png')
  this.load.image('spider', 'images/monsters/spider.png')
  this.load.image('kobold', 'images/monsters/kobold.png')
  this.load.image('giant-rat', 'images/monsters/giant-rat.png')
  this.load.image('lizardman', 'images/monsters/lizardman.png')
  this.load.image('gnoll', 'images/monsters/gnoll.png')

  this.load.image('ogre', 'images/monsters/ogre.png')
  this.load.image('ghoul', 'images/monsters/ghoul.png')
  this.load.image('harpy', 'images/monsters/harpy.png')
  this.load.image('insect-swarm', 'images/monsters/insect-swarm.png')
  this.load.image('gelatinous-cube', 'images/monsters/gelatinous-cube.png')
  this.load.image('troll', 'images/monsters/troll.png')

  this.load.image('wraith', 'images/monsters/wraith.png')
  this.load.image('yeti', 'images/monsters/yeti.png')
  this.load.image('centaur', 'images/monsters/centaur.png')
  this.load.image('elemental', 'images/monsters/elemental.png')
  this.load.image('imp', 'images/monsters/imp.png')
  this.load.image('banshee', 'images/monsters/banshee.png')

  this.load.image('demon', 'images/monsters/demon.png')
  this.load.image('mummy', 'images/monsters/mummy.png')
  this.load.image('giant', 'images/monsters/giant.png')
  this.load.image('griffon', 'images/monsters/griffon.png')
  this.load.image('minotaur', 'images/monsters/minotaur.png')
  this.load.image('manticore', 'images/monsters/manticore.png')

  this.load.image('dragon', 'images/monsters/dragon.png')
  this.load.image('lich', 'images/monsters/lich.png')
  this.load.image('beholder', 'images/monsters/beholder.png')
  this.load.image('vampire', 'images/monsters/vampire.png')
  this.load.image('mind-flayer', 'images/monsters/mind-flayer.png')
  this.load.image('devil', 'images/monsters/devil.png')

  // Consumables
  this.load.image('healing', 'images/consumables/healing.png')
  this.load.image('action-points', 'images/consumables/action-points.png')

  // Weapons
  this.load.image('amulet', 'images/items/amulet.png')
  this.load.image('axe', 'images/items/weapons/axe.png')
  this.load.image('battleaxe', 'images/items/weapons/battleaxe.png')
  this.load.image('broadsword', 'images/items/weapons/broadsword.png')
  this.load.image('dagger', 'images/items/weapons/dagger.png')
  this.load.image('greatsword', 'images/items/weapons/greatsword.png')
  this.load.image('longsword', 'images/items/weapons/longsword.png')
  this.load.image('mace', 'images/items/weapons/mace.png')
  this.load.image('shortsword', 'images/items/weapons/shortsword.png')
  this.load.image('spear', 'images/items/weapons/spear.png')
  this.load.image('staff', 'images/items/weapons/staff.png')

  // Items
  this.load.image('amulet', 'images/items/amulet.png')
  this.load.image('armor', 'images/items/armor.png')
  this.load.image('ring', 'images/items/ring.png')
  this.load.image('gold', 'images/items/gold.png')
  this.load.image('ranged-spell', 'images/items/spell.png')
  this.load.image('melee-spell', 'images/items/spell.png')
  this.load.image('ranged', 'images/items/ranged.png')
  this.load.image('boots', 'images/items/boots.png')
  this.load.image('head', 'images/items/head.png')

  // Misc
  this.load.image('star', 'images/star.png')
}

// eslint-disable-next-line @typescript-eslint/ban-types
function sceneCreate(this: Phaser.Scene, data: object) {
  initControls(this)
}

let lastState: States | undefined = undefined
let lastTime = 0

export function sceneUpdate(this: Phaser.Scene): void {
  if (lastState !== gameState.phase) {
    console.log('transition', lastState, gameState.phase)
    // Cleanup the last phase (if needed)
    if (lastState) {
      stateFunctions[lastState].cleanup(this)
    }
    // Move to the next phase
    lastState = gameState.phase
    stateFunctions[gameState.phase].init(this)

    return
  }

  // Time between loops
  const delta = this.time.now - lastTime
  lastTime = this.time.now

  stateFunctions[gameState.phase].update(this, this.time.now, delta)
}

export const startGame = (): void => {
  new Phaser.Game({
    type: Phaser.AUTO,
    width: gameSettings.screenWidth,
    height: gameSettings.screenHeight,
    scale: {
      mode: Phaser.Scale.ScaleModes.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // physics: {
    //   default: 'matter',
    //   matter: {
    //     enableSleeping: false
    //     // debug: true,
    //     // gravity: {
    //     //   y: 1,
    //     //   x: 0,
    //     // },
    //   }
    // },
    scene: {
      preload: scenePreload,
      create: sceneCreate,
      update: sceneUpdate
    },
    input: {
      gamepad: true
    },
    parent: 'root'
  })
}
