import { type NodeId, type NodeModel } from '../node'
import { PathState, type PathStateArgs, type PathId, type PathModel } from '../path'
import { type SignalId, type SignalModel, SignalState, type SignalStateArgs } from '../signal'
import { TrainState, type TrainStateArgs, type TrainId, type TrainModel } from '../train'

export interface Path {
  readonly model: PathModel
  readonly state: PathState
  readonly upcoming: PathState
}
export interface Train {
  readonly model: TrainModel
  readonly state: TrainState
  readonly upcoming: TrainState
}
export interface Signal {
  readonly model: SignalModel
  readonly state: SignalState
  readonly upcoming: SignalState
}

export class Simulator {
  private frame: number = 0
  private nodes: NodeModel[] = []
  private readonly pathMap: Record<PathId, Path> = {}
  private readonly trainMap: Record<TrainId, Train> = {}
  private readonly signalMap: Record<SignalId, Signal> = {}

  public findNodeById ({ id }: { id: NodeId }): NodeModel | null {
    return this.nodes.find(node => node.id === id) ?? null
  }

  public isEndOfPath ({ id }: { id: PathId }): boolean {
    const path = this.findPathById({ id })
    if (path == null) return true

    const nextNode = this.findNextPathOfNode({ id: path.state.to })
    if (nextNode == null) return true

    const pathFromNode = this.findOppositePathOf({ id })
    return nextNode.model.id === pathFromNode?.model.id
  }

  public findPathById ({ id }: { id: PathId }): Path | null {
    return this.pathMap[id] ?? null
  }

  public findOppositePathOf ({ id }: { id: PathId }): Path | null {
    const target = this.findPathById({ id })
    if (target == null) return null

    return Object
      .values(this.pathMap)
      .filter(path => target.state.to === path.state.from && target.state.from === path.state.to)
      .find(path => path.state.connected) ?? null
  }

  public findPathsStartWithNode (from: { id: NodeId }): Path[] {
    const paths = Object.values(this.pathMap)
    return paths.filter(path => path.state.from === from.id)
  }

  public findPreviousPath ({ id }: { id: PathId }): Path | null {
    const targetPath = this.findPathById({ id })?.state
    if (targetPath == null) return null

    return Object
      .values(this.pathMap)
      .filter(path => path.state.to === targetPath.from)
      .find(path => path.state.connected) ?? null
  }

  public findTrainById ({ id }: { id: TrainId }): Train | null {
    return this.trainMap[id] ?? null
  }

  public findTrainByPathId ({ id }: { id: PathId }): Train | null {
    return Object
      .values(this.trainMap)
      .find(
        train => this
          .findPathsUnderTrain(train.state)
          .find(path => path.state.id === id)
      ) ?? null
  }

  public findPathsUnderTrain ({ id }: { id: TrainId }, MAX_PATHS_N = 100): Path[] {
    const train = this.findTrainById({ id })?.state
    if (train == null) return []

    const headPath = this.findPathById({ id: train.pathId })
    if (headPath == null) return []

    let res = [headPath]
    const opposite = this.findOppositePathOf(headPath.model)
    if (opposite != null) {
      res = [...res, opposite]
    }

    for (let i = 0; i < MAX_PATHS_N; i++) {
      const totalLength = res.reduce((prev, current) => prev + current.state.length, 0) - train.distanceFromEnd
      if (train.length <= totalLength) break

      const previous = this.findPreviousPath(res[res.length - 1].state)
      if (previous == null) break

      res = [...res, previous]

      const opposite = this.findOppositePathOf(previous.model)
      if (opposite != null) {
        res = [...res, opposite]
      }
    }
    return res
  }

  public findNextPathOfNode ({ id }: { id: NodeId }): Path | null {
    return this.findPathsStartWithNode({ id })
      .find(path => path.state.connected) ?? null
  }

  public findSignalById ({ id }: { id: SignalId }): Signal | null {
    return this.signalMap[id] ?? null
  }

  public findSignalOfPath ({ id }: { id: PathId }): Signal | null {
    return Object
      .values(this.signalMap)
      .find(signal => signal.state.pathId === id) ?? null
  }

  public findBlock ({ id }: { id: SignalId }, MAX_PATHS_N = 100): Path[] {
    const signal = this.findSignalById({ id })
    if (signal == null) return []

    const headPath = this.findPathById({ id: signal.state.pathId })
    if (headPath == null) return []
    const res = [headPath]

    const oppositePath = this.findOppositePathOf(headPath.state)
    if (oppositePath != null) res.push(oppositePath)

    if (this.isEndOfPath(headPath.state)) return res

    let currentPath: Path | null = headPath
    for (let i = 0; i < MAX_PATHS_N; i++) {
      currentPath = this.findNextPathOfNode({ id: currentPath.state.to })
      if (currentPath == null || this.findSignalOfPath(currentPath.state) != null) break
      res.push(currentPath)

      const oppositePath = this.findOppositePathOf(currentPath.state)
      if (oppositePath != null) res.push(oppositePath)

      if (this.isEndOfPath(currentPath.state)) break
    }
    return res
  }

  public updatePath (
    { id }: { id: PathId },
    args: Omit<PathStateArgs, 'id' | 'from' | 'to' | 'frame'>
  ): void {
    const target = this.pathMap[id].upcoming

    this.pathMap[id] = {
      ...this.pathMap[id],
      upcoming: new PathState({
        ...target,
        ...args,
        from: { id: target.from },
        to: { id: target.to },
        frame: this.frame
      })
    }
  }

  public updateTrain (
    { id }: { id: TrainId },
    args: Partial<Omit<TrainStateArgs, 'id' | 'length' | 'frame'>>
  ): void {
    this.trainMap[id] = {
      ...this.trainMap[id],
      upcoming: new TrainState({
        ...this.trainMap[id].upcoming,
        ...args,
        frame: this.frame
      })
    }
  }

  public updateSignal (
    { id }: { id: SignalId },
    args: Omit<SignalStateArgs, 'id' | 'frame'>
  ): void {
    this.signalMap[id] = {
      ...this.signalMap[id],
      upcoming: new SignalState({
        ...this.signalMap[id].upcoming,
        ...args,
        frame: this.frame
      })
    }
  }

  public insertNode (node: NodeModel): Simulator {
    this.nodes = [...this.nodes, node]
    return this
  }

  public insertPath (
    model: PathModel,
    args: Omit<PathStateArgs, 'id' | 'frame'>
  ): Simulator {
    // TODO: 接続の重複チェック（1つのポイントが2つ以上の接続を持たないか？）
    const state = new PathState({ ...model, ...args, frame: this.frame })
    this.pathMap[model.id] = {
      model,
      state,
      upcoming: state
    }
    return this
  }

  public insertSignal (
    model: SignalModel,
    args: Omit<SignalStateArgs, 'id' | 'frame'>
  ): Simulator {
    const state = new SignalState({ ...model, ...args, frame: this.frame })
    this.signalMap[model.id] = {
      model,
      state,
      upcoming: state
    }
    return this
  }

  public putTrain (model: TrainModel, args: Omit<TrainStateArgs, 'id' | 'frame'>): Simulator {
    const path = this.findPathById({ id: args.pathId })
    if (path == null) return this
    if (path.state.length < args.distanceFromEnd) return this

    const state = new TrainState({ ...model, ...args, frame: this.frame })
    this.trainMap[model.id] = {
      model,
      state,
      upcoming: state
    }
    return this
  }

  update (): Simulator {
    Object
      .values(this.pathMap)
      .forEach(path => (
        this.pathMap[path.model.id] = {
          model: path.model,
          state: path.upcoming,
          upcoming: path.upcoming
        }))
    Object
      .values(this.trainMap)
      .forEach(train => (
        this.trainMap[train.model.id] = {
          model: train.model,
          state: train.upcoming,
          upcoming: train.upcoming
        }))
    Object
      .values(this.signalMap)
      .forEach(signal => (
        this.signalMap[signal.model.id] = {
          model: signal.model,
          state: signal.upcoming,
          upcoming: signal.upcoming
        }))
    this.frame++
    return this
  }

  public getDeltaTimeInSeconds (): number {
    return 1.0
  }
}
