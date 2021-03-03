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
  this.load.image('guy', 'images/guy.png')

  // Monsters
  this.load.image('orc', 'images/monsters/orc.png')
  this.load.image('ogre', 'images/monsters/ogre.png')
  this.load.image('dragon', 'images/monsters/dragon.png')

  // Consumables
  this.load.image('healing', 'images/consumables/healing.png')

  // Sprites
  // this.load.spritesheet('guy-run', 'images/guy-run-55x59.png', { frameWidth: 55, frameHeight: 59 })
  // this.load.spritesheet('guy-run-nowand', 'images/guy-run-nowand-55x59.png', { frameWidth: 55, frameHeight: 59 })
  // this.load.spritesheet('guy-jump', 'images/guy-jump-64x64.png', { frameWidth: 64 })
  // this.load.spritesheet('guy-jump-nowand', 'images/guy-jump-nowand-64x64.png', { frameWidth: 64 })
  // this.load.spritesheet('guy-shoot', 'images/guy-shoot-64x64.png', { frameWidth: 64 })
  // this.load.spritesheet('guy-yawn', 'images/guy-yawn-64x64.png', { frameWidth: 64 })
  // this.load.spritesheet('ghost', 'images/monsters/ghost-64x64.png', { frameWidth: 64 })
  // this.load.spritesheet('energy-bolt', 'images/spells/energy-bolt.png', { frameWidth: 16 })
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
    width: gameSettings.screenWidth, // gameSettings.fieldWidth,
    height: gameSettings.screenHeight, // gameSettings.fieldHeight,
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
