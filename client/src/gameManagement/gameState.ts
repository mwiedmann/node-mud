import { Consumable, Item, Monster, Player } from './gameTypes'
import { PlayerProfession, PlayerRace, SquareType } from 'dng-shared'
import { States } from '../states'

export let controls: {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  spell: Phaser.Input.Keyboard.Key
  quit: Phaser.Input.Keyboard.Key
  zoomIn: Phaser.Input.Keyboard.Key
  zoomOut: Phaser.Input.Keyboard.Key
  getItem: Phaser.Input.Keyboard.Key
  special: Phaser.Input.Keyboard.Key
  melee: Phaser.Input.Keyboard.Key
  ranged: Phaser.Input.Keyboard.Key
  mapToggle: Phaser.Input.Keyboard.Key
}

export const initControls = (scene: Phaser.Scene): void => {
  controls = {
    cursors: scene.input.keyboard.createCursorKeys(),
    quit: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    zoomIn: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS),
    zoomOut: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS),
    getItem: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G),
    special: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    melee: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    ranged: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
    spell: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    mapToggle: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB)
  }
}

export const freshPlayer = (): Player => ({
  name: 'Joe Blow',
  id: 0,
  loggedIn: false,
  x: 0,
  y: 0,
  dead: false,
  hp: 0,
  hpMax: 0,
  ap: 0,
  apMax: 0,
  xp: 0,
  xpNext: 0,
  meleeOn: true,
  rangedOn: true,
  spellOn: true,
  meleeDefense: 0,
  rangedDefense: 0,
  magicDefense: 0,
  level: 1,
  special: false,
  invisible: false,
  lastX: -1,
  lastY: -1,
  activityLog: [],
  attackActivityLog: [],
  visibleRange: 5
})

export const gameState: {
  phase: States
  map: SquareType[][]
  mapUpdate: boolean
  mapId: number
  race: PlayerRace
  profession: PlayerProfession
  player: Player
  monsters: Map<number, Monster>
  items: Map<number, Consumable | Item>
} = {
  phase: 'init',
  map: [[SquareType.Empty]],
  mapId: 0,
  race: 'human',
  profession: 'barbarian',
  mapUpdate: true,
  player: freshPlayer(),
  monsters: new Map(),
  items: new Map()
}

export const resetGameState = (): void => {
  gameState.player = freshPlayer()
  gameState.monsters = new Map()
  gameState.items = new Map()
}
