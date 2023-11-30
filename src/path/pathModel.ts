import { type Simulator } from '../simulator'

import { type PathState } from './pathState'

let counter = 0
export type PathId = `p:${number}`

export class PathModel {
  public readonly id: PathId

  constructor (args?: { id?: PathId }) {
    this.id = args?.id ?? `p:${counter++}`
  }

  getState (sim: Simulator): PathState | null {
    return sim.findPathById(this)?.state ?? null
  }
}
