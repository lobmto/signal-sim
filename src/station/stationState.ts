import { type PathId } from '../path'

import { type StationId } from '.'

export interface SignalStateArgs {
  readonly id: StationId
  readonly path: { id: PathId }
  readonly frame: number
  readonly distanceFromEnd: number
}

export class StationState {
  public readonly id: StationId
  public readonly pathId: PathId
  public readonly frame: number
  public readonly distanceFromEnd: number // 停車位置

  constructor (args: SignalStateArgs) {
    this.id = args.id
    this.pathId = args.path.id
    this.frame = args.frame
    this.distanceFromEnd = args.distanceFromEnd
  }
}
