import { type PathId } from '../path'

import { type SignalId } from '.'

export enum SignalStatus { BLUE, RED }
export interface SignalStateArgs {
  readonly id: SignalId
  readonly path: { id: PathId }
  readonly frame: number
  readonly status?: SignalStatus
}

export class SignalState {
  public readonly id: SignalId
  public readonly pathId: PathId
  public readonly frame: number
  public readonly status: SignalStatus

  constructor (args: SignalStateArgs) {
    this.id = args.id
    this.pathId = args.path.id
    this.frame = args.frame
    this.status = args.status ?? SignalStatus.RED
  }
}
