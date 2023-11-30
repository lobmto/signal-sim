import { type Simulator } from '../simulator'

import { type SignalState } from '.'

let counter = 0
export type SignalId = `s:${number}`

export class SignalModel {
  public readonly id: SignalId
  constructor (args?: { id?: SignalId }) {
    this.id = args?.id ?? `s:${counter++}`
  }

  getState (sim: Simulator): SignalState | null {
    return sim.findSignalById(this)?.state ?? null
  }
}
