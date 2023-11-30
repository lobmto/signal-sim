import { type Simulator } from '../simulator'

import { type SignalId } from './signalModel'
export enum SignalStatus { BLUE, RED }

export class SignalService {
  constructor (
    private readonly signalRepository: Simulator
  ) {}

  currentStatus ({ id }: { id: SignalId }): SignalStatus {
    const signal = this.signalRepository.findSignalById({ id })
    if (signal == null) return SignalStatus.RED

    const paths = this.signalRepository.findBlock(signal.state)
    if (paths.length === 0) return SignalStatus.RED

    const trainFound = paths.find(path => this.signalRepository.findTrainByPathId(path.state))
    if (trainFound !== undefined) return SignalStatus.RED

    return SignalStatus.BLUE
  }
}
