import { type PathId } from '../path'

import { type TrainId } from './trainModel'

export interface TrainStateArgs {
  readonly id: TrainId
  readonly frame: number
  readonly distanceFromEnd: number
  readonly pathId: PathId
  readonly length?: number
  readonly speed?: number
}

export class TrainState {
  public readonly id: TrainId
  public readonly frame: number
  public readonly distanceFromEnd: number
  public readonly pathId: PathId
  public readonly length: number
  public readonly speed: number

  constructor (
    public readonly args: TrainStateArgs
  ) {
    this.id = args.id
    this.frame = args.frame
    this.distanceFromEnd = args.distanceFromEnd
    this.pathId = args.pathId
    this.length = args?.length ?? 100
    this.speed = args?.speed ?? 0
  }
}
