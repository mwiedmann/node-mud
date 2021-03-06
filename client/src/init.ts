import * as Phaser from 'phaser'
import { gameSettings } from './settings'
import { stateFunctions, States } from './states'
import { Consumable, Monster, Player } from './player'

export let controls: {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  next: Phaser.Input.Keyboard.Key
  spell: Phaser.Input.Keyboard.Key
  quit: Phaser.Input.Keyboard.Key
  zoomIn: Phaser.Input.Keyboard.Key
  zoomOut: Phaser.Input.Keyboard.Key
}

export enum SquareType {
  Empty = 0,
  Wall = 1
}

export const gameState: {
  phase: States
  map: SquareType[][]
  mapUpdate: boolean
  player: Player
  monsters: Map<number, Monster>
  consumables: Map<string, Consumable>
} = {
  phase: 'init',
  map: [[SquareType.Empty]],
  mapUpdate: true,
  player: {
    loggedIn: false,
    x: 0,
    y: 0,
    hp: 0,
    hpMax: 0,
    ap: 0,
    apMax: 0,
    lastX: -1,
    lastY: -1,
    activityLog: [],
    visibleRange: 15
  },
  monsters: new Map(),
  consumables: new Map()
}

function scenePreload(this: Phaser.Scene) {
  // Images
  this.load.image('title', 'images/title.png')

  this.load.image('wall', 'images/wall.png')
  this.load.image('guy', 'images/players/warrior.png')

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
  this.load.image('manitcore', 'images/monsters/manitcore.png')

  this.load.image('dragon', 'images/monsters/dragon.png')
  this.load.image('lich', 'images/monsters/lich.png')
  this.load.image('beholder', 'images/monsters/beholder.png')
  this.load.image('vampire', 'images/monsters/vampire.png')
  this.load.image('mind-flayer', 'images/monsters/mind-flayer.png')
  this.load.image('devil', 'images/monsters/devil.png')

  // Consumables
  this.load.image('healing', 'images/consumables/healing.png')
  this.load.image('action-points', 'images/consumables/action-points.png')
}

function sceneCreate(this: Phaser.Scene) {
  controls = {
    cursors: this.input.keyboard.createCursorKeys(),
    next: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    spell: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL),
    quit: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
    zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS),
    zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS)
  }
}

let lastState: States | undefined = undefined

export function sceneUpdate(this: Phaser.Scene, time: number, delta: number): void {
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

  stateFunctions[gameState.phase].update(this, time, delta)
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
