import { gameState } from './init'
import * as Phaser from 'phaser'
import { gameSettings } from './settings'
import { Consumable, Item } from './player'
import { BaseMessage } from 'dng-shared'

class ConnectionManager {
  connection!: WebSocket

  openConnection(scene: Phaser.Scene) {
    console.log('Opening connection')

    this.connection = new WebSocket('ws://localhost:3001')

    this.connection.onopen = () => {
      console.log('Connection Opened!')

      this.connection.send(
        JSON.stringify({ type: 'login', name: 'Joe Blow', race: gameState.race, profession: gameState.profession })
      )
    }

    this.connection.onerror = (error) => {
      console.error(`WebSocket error: ${error}`)
    }

    this.connection.onmessage = (e) => {
      const message: BaseMessage = JSON.parse(e.data)

      // console.log('Got message', message)

      switch (message.type) {
        case 'map':
          gameState.map = message.data
          gameState.mapUpdate = true
          break

        case 'player':
          gameState.player.x = message.data.x
          gameState.player.y = message.data.y
          gameState.player.hp = message.data.hp
          gameState.player.ap = message.data.ap
          gameState.player.hpMax = message.data.hpMax
          gameState.player.apMax = message.data.apMax
          gameState.player.invisible = message.data.invisible
          gameState.player.activityLog = message.data.activityLog
          gameState.player.attackActivityLog = message.data.attackActivityLog
          gameState.player.visibleRange = message.data.visibleRange

          // This is the first update for the player on this level
          // Snap the camera
          if (!gameState.player.loggedIn || gameState.player.lastX === -1) {
            gameState.player.loggedIn = true
            scene.cameras.main.centerOn(
              gameSettings.screenPosFromMap(gameState.player.x),
              gameSettings.screenPosFromMap(gameState.player.y)
            )
          }
          break

        case 'monster':
          let monster = gameState.monsters.get(message.data.id)

          if (!monster) {
            monster = {
              ...message.data,
              lastX: -1,
              lastY: -1,
              seen: false,
              ghostX: -1,
              ghostY: -1
            }
            gameState.monsters.set(monster.id, monster)
          } else {
            monster.x = message.data.x
            monster.y = message.data.y
            monster.hp = message.data.hp
            monster.ap = message.data.ap
            monster.dead = message.data.dead
            monster.invisible = message.data.invisible
            monster.activityLog = message.data.activityLog
            monster.attackActivityLog = message.data.attackActivityLog
          }
          break

        case 'consumable':
          let consumable = gameState.items.get(message.data.id) as Consumable

          if (!consumable) {
            consumable = {
              ...message.data,
              seen: false,
              ghostX: -1,
              ghostY: -1
            }
            gameState.items.set(message.data.id, consumable)
          } else {
            consumable.x = message.data.x
            consumable.y = message.data.y
            consumable.health = message.data.health
            consumable.actionPoints = message.data.actionPoints
            consumable.gone = message.data.gone
          }
          break

        case 'item':
          let item = gameState.items.get(message.data.id) as Item

          if (!item) {
            item = {
              ...message.data,
              seen: false,
              ghostX: -1,
              ghostY: -1
            }
            gameState.items.set(message.data.id, item)
          } else {
            item.x = message.data.x
            item.y = message.data.y
            item.description = message.data.description
            item.gone = message.data.gone
          }
          break
      }
    }

    this.connection.onclose = (e) => {
      console.log('Conection closed')
    }
  }

  logout() {
    this.connection.send(JSON.stringify({ type: 'logout' }))
    this.connection.close()
  }

  setDestination(x: number, y: number) {
    this.connection.send(JSON.stringify({ type: 'setDestination', x, y }))
  }

  setSpecialAbilityLocation(x: number, y: number) {
    this.connection.send(JSON.stringify({ type: 'setSpecialAbilityLocation', x, y }))
  }

  getItem(x: number, y: number) {
    this.connection.send(JSON.stringify({ type: 'getItem', x, y }))
  }
}

export const connectionManager = new ConnectionManager()
