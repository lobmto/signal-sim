import { PathModel, PathState } from '../path'
import { type Path, Simulator, type Train } from '../simulator'
import { TrainModel, TrainService, TrainState } from '../train'

jest.mock('../simulator')

describe('TrainService', () => {
  let sim: Simulator
  let paths: Path[]
  let trains: Train[]
  let SUT: TrainService

  beforeEach(() => {
    const MockedSim = Simulator as jest.Mock
    sim = new MockedSim()
    SUT = new TrainService(sim)

    const pathModels = [new PathModel(), new PathModel(), new PathModel()]
    const pathStates = [
      new PathState({
        ...pathModels[0],
        from: { id: 'n:1' },
        to: { id: 'n:2' },
        frame: 1
      }),
      new PathState({
        ...pathModels[1],
        from: { id: 'n:2' },
        to: { id: 'n:3' },
        frame: 1
      }),
      new PathState({
        ...pathModels[2],
        from: { id: 'n:2' },
        to: { id: 'n:1' },
        frame: 1
      })
    ]
    paths = [
      {
        model: pathModels[0],
        state: pathStates[0],
        upcoming: pathStates[0]
      },
      {
        model: pathModels[1],
        state: pathStates[1],
        upcoming: pathStates[1]
      },
      {
        model: pathModels[2],
        state: pathStates[2],
        upcoming: pathStates[2]
      }
    ]

    const trainModel = new TrainModel()
    const trainState = new TrainState({
      id: trainModel.id,
      frame: 1,
      distanceFromEnd: 500,
      speed: 100,
      pathId: paths[0].model.id
    })
    trains = [{
      model: trainModel,
      state: trainState,
      upcoming: trainState

    }]

    jest.spyOn(sim, 'findTrainById').mockReturnValueOnce(trains[0])
    jest.spyOn(sim, 'findPathById').mockReturnValueOnce(paths[0])
    jest.spyOn(sim, 'findNextPathOfNode').mockReturnValueOnce(paths[1])
    jest.spyOn(sim, 'findOppositePathOf').mockReturnValueOnce(paths[2])
    // use actual implement
    jest.spyOn(sim, 'getDeltaTimeInSeconds')
      .mockImplementation(jest.requireActual('../simulator').Simulator.prototype.getDeltaTimeInSeconds as () => number)
  })

  describe('moveTrain()', () => {
    it('should move train', () => {
      SUT.moveTrain(trains[0].state)
      expect(sim.updateTrain).toBeCalledWith(
        trains[0].state,
        {
          pathId: paths[0].model.id,
          distanceFromEnd: 500 - 100 * 1000 / 3600
        }
      )
    })

    it('should move train across paths', () => {
      const trainState = new TrainState({
        id: trains[0].model.id,
        frame: 1,
        distanceFromEnd: 10,
        speed: 100,
        pathId: 'p:1'
      })
      trains[0] = {
        model: trains[0].model,
        state: trainState,
        upcoming: trainState
      }
      jest.spyOn(sim, 'findTrainById').mockReset().mockReturnValueOnce(trains[0])
      SUT.moveTrain(trains[0].state)
      expect(sim.updateTrain).toBeCalledWith(
        trains[0].state,
        {
          pathId: paths[1].model.id,
          distanceFromEnd: 1010 - 100 * 1000 / 3600
        }
      )
    })
  })

  describe('accelerate()', () => {
    it('should accelerate the train', () => {
      SUT.accelerate(trains[0].state, +1.0)
      expect(sim.updateTrain).toBeCalledWith(
        trains[0].state,
        { speed: trains[0].state.speed + 1.0 }
      )
    })

    it('should stop the train', () => {
      const trainState = new TrainState({ ...trains[0].state, speed: 0.5 })
      trains[0] = { model: trains[0].model, state: trainState, upcoming: trainState }
      jest.spyOn(sim, 'findTrainById').mockReset().mockReturnValueOnce(trains[0])

      SUT.accelerate(trains[0].state, -1.0)
      expect(sim.updateTrain).toBeCalledWith(
        trainState,
        { speed: 0 }
      )
    })
  })

  describe('switchHead()', () => {
    it('should switch head of the train', () => {
      const trainState = new TrainState({
        id: trains[0].model.id,
        frame: 1,
        distanceFromEnd: 500,
        speed: 0,
        pathId: 'p:1'
      })
      trains[0] = {
        model: trains[0].model,
        state: trainState,
        upcoming: trainState
      }
      jest.spyOn(sim, 'findTrainById').mockReset().mockReturnValueOnce(trains[0])

      SUT.switchHead(trains[0].state)
      expect(sim.updateTrain).toBeCalledWith(
        trains[0].state,
        { pathId: paths[2].state.id }
      )
    })

    it('should ignore switching request when the train is moving', () => {
      SUT.switchHead(trains[0].state)
      expect(sim.updateTrain).not.toBeCalled()
    })
  })
})
