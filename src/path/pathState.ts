import { type NodeId } from '../node'

import { type PathId } from './pathModel'

export interface PathStateArgs {
  readonly id: PathId
  readonly frame: number
  readonly from: { id: NodeId }
  readonly to: { id: NodeId }
  readonly length?: number
  readonly connected?: boolean
}

export class PathState {
  public readonly id: PathId
  public readonly frame: number
  public readonly from: NodeId
  public readonly to: NodeId
  public readonly length: number
  public readonly connected: boolean

  constructor (
    args: PathStateArgs
  ) {
    this.id = args.id
    this.frame = args.frame
    this.from = args.from.id
    this.to = args.to.id
    this.length = args.length ?? 1000
    this.connected = args.connected ?? false
  }
}
