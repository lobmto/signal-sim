import { PathModel, PathState } from '../path'
import { type Path, Simulator, type Train, type Signal } from '../simulator'
import { TrainModel, TrainState } from '../train'

import { SignalModel } from './signalModel'
import { SignalService } from './signalService'
import { SignalState, SignalStatus } from './signalState'

jest.mock('../simulator')

describe('SignalService', () => {
  let sim: Simulator
  let signals: Signal[]
  let paths: Path[]
  let trains: Train[]
  let SUT: SignalService

  beforeEach(() => {
    const MockedSim = Simulator as jest.Mock
    sim = new MockedSim()
    SUT = new SignalService(sim)

    const signalModels = [new SignalModel()]
    const signalStates = [
      new SignalState({
        id: signalModels[0].id,
        path: { id: 'p:1' },
        frame: 1
      })
    ]
    signals = [{
      model: signalModels[0],
      state: signalStates[0],
      upcoming: signalStates[0]
    }]

    const pathModel = new PathModel()
    const pathState = new PathState({
      ...pathModel,
      from: { id: 'n:1' },
      to: { id: 'n:2' },
      frame: 1
    })
    paths = [{
      model: pathModel,
      state: pathState,
      upcoming: pathState
    }]

    const trainModel = new TrainModel()
    const trainState = new TrainState({
      id: trainModel.id,
      frame: 1,
      distanceFromEnd: 500,
      pathId: 'p:1'
    })
    trains = [{
      model: trainModel,
      state: trainState,
      upcoming: trainState

    }]

    jest.spyOn(sim, 'findSignalById').mockReturnValueOnce(signals[0])
    jest.spyOn(sim, 'findTrainByPathId').mockReturnValueOnce(trains[0])
    jest.spyOn(sim, 'findBlock').mockReturnValueOnce([paths[0]])
  })

  describe('currentStatus()', () => {
    it('should return RED with using paths', () => {
      expect(SUT.currentStatus(signals[0].model)).toBe(SignalStatus.RED)
      expect(sim.findSignalById).toBeCalledTimes(1)
      expect(sim.findBlock).toBeCalledTimes(1)
      expect(sim.findTrainByPathId).toBeCalledTimes(1)
    })

    it('should return BLUE with empty paths', () => {
      jest.spyOn(sim, 'findTrainByPathId').mockReset().mockReturnValueOnce(null)

      expect(SUT.currentStatus(signals[0].model)).toBe(SignalStatus.BLUE)
      expect(sim.findSignalById).toBeCalledTimes(1)
      expect(sim.findBlock).toBeCalledTimes(1)
      expect(sim.findTrainByPathId).toBeCalledTimes(1)
    })
  })
})
