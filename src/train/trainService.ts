import { type Train, type Simulator } from '../simulator'

import { type TrainId } from './trainModel'

export class TrainService {
  constructor (
    private readonly trainRepository: Simulator
  ) {}

  moveTrain ({ id }: { id: TrainId }): Train | null {
    const train = this.trainRepository.findTrainById({ id })
    if (train == null) return null

    const updatedDistance = train.state.distanceFromEnd - train.state.speed * 1000 / 3600
    if (updatedDistance < 0) {
      const currentPath = this.trainRepository.findPathById({ id: train.state.pathId })
      if (currentPath == null) {
        // TODO: crash!
        return null
      }

      const updatedPath = this.trainRepository.findNextPathOfNode({ id: currentPath.state.to })
      if (updatedPath == null) {
        // TODO: crash!
        return null
      }

      this.trainRepository.updateTrain(
        train.state,
        {
          pathId: updatedPath.state.id,
          distanceFromEnd: updatedPath.state.length + updatedDistance
        }
      )
    } else {
      this.trainRepository.updateTrain(
        train.state,
        {
          pathId: train.state.pathId,
          distanceFromEnd: train.state.distanceFromEnd - train.state.speed * 1000 / 3600 * this.trainRepository.getDeltaTimeInSeconds()
        }
      )
    }
    return train
  }

  accelerate ({ id }: { id: TrainId }, acc: number): void {
    const train = this.trainRepository.findTrainById({ id })
    if (train == null) return

    this.trainRepository.updateTrain(
      train.state,
      { speed: Math.max(train.state.speed + acc, 0) }
    )
  }

  switchHead ({ id }: { id: TrainId }): void {
    const train = this.trainRepository.findTrainById({ id })
    if (train == null) return
    if (train.state.speed !== 0) return

    const currentPath = this.trainRepository.findPathById({ id: train.state.pathId })
    if (currentPath == null) return

    const nextPath = this.trainRepository.findOppositePathOf(currentPath.state)
    if (nextPath == null) return

    this.trainRepository.updateTrain(
      train.state,
      { pathId: nextPath.state.id }
    )
  }
}
