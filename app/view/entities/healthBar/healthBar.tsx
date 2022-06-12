import * as PIXI from 'pixi.js'
import { CustomPIXIComponent } from 'react-pixi-fiber'

interface BarProps {
  x: number
  y: number
  width: number
  height: number
  color: number
  coins: number
  health: number
  name: string
  zIndex?: number
  team: number
  turbo: boolean
  nullAndVoid: boolean
}

function propsEqual(oldProps: BarProps, newProps: BarProps) {
  return (
    oldProps.x === newProps.x &&
    oldProps.y === newProps.y &&
    oldProps.width === newProps.width &&
    oldProps.color === newProps.color &&
    oldProps.height === newProps.height &&
    oldProps.health === newProps.health &&
    oldProps.coins === newProps.coins &&
    oldProps.name === newProps.name
  )
}

export const Bar = CustomPIXIComponent<PIXI.Graphics, BarProps>(
  {
    customDisplayObject: (_) => new PIXI.Graphics(),
    customApplyProps: (instance, oldProps, newProps) => {
      if (newProps.turbo && newProps.nullAndVoid) return
      if (!propsEqual(oldProps, newProps)) {
        if (newProps.zIndex) {
          instance.zIndex = newProps.zIndex
        }
        instance.clear()
        /*instance.beginFill(newProps.color);
        instance.drawCircle(
          newProps.x + 35,
          newProps.y + 80,
          50
        );*/
        if (newProps.coins != 0) {
          instance.beginFill(0x565a5c, 0.7)
          instance.drawCircle(newProps.x + 30, newProps.y + 80, 70)
        }
        instance.beginFill(0xf9e300, 0.7)
        instance.drawCircle(
          newProps.x + 30,
          newProps.y + 80,
          newProps.coins * 7,
        )
        if (newProps.health !== 10) {
          instance.beginFill(0x000000)
          instance.drawRect(
            newProps.x - 5,
            newProps.y + 140,
            75,
            newProps.height,
          )
          instance.beginFill(0xc60c30)
          instance.drawRect(
            newProps.x - 5,
            newProps.y + 140,
            newProps.health * 7.5,
            newProps.height,
          )
        }

        let name = new PIXI.Text(newProps.name, {
          fontFamily: 'Press Start 2P',
          fontSize: 20,
          align: 'center',
          fill: newProps.team == 0 ? '#ffffff' : newProps.team == 1 ? 'lightcoral' : 'lightblue',
        })
        name.x = newProps.x - name.width / 2 + 35
        name.y = newProps.y - 30
        instance.addChild(name)
        instance.endFill()
      }
    },
  },
  'Bar',
)
