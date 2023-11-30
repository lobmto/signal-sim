import { type Simulator } from '../simulator'

import { type TrainState } from '.'

let counter = 0
export type TrainId = `t:${number}`

export class TrainModel {
  public readonly id: TrainId
  constructor (args?: { id?: TrainId }) {
    this.id = args?.id ?? `t:${counter++}`
  }

  getState (sim: Simulator): TrainState | null {
    return sim.findTrainById(this)?.state ?? null
  }
}
