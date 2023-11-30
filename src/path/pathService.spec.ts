import { Simulator } from '../simulator'

import { PathModel, PathService, PathState } from '.'
jest.mock('../simulator')

describe('PathService', () => {
  let sim: Simulator
  let paths: PathModel[]
  let pathStates: PathState[]
  let SUT: PathService

  beforeEach(() => {
    const MockedSim = Simulator as jest.Mock
    sim = new MockedSim()
    SUT = new PathService(sim)

    paths = [
      new PathModel(),
      new PathModel()
    ]

    pathStates = [
      new PathState({
        id: paths[0].id,
        from: { id: 'n:1' },
        to: { id: 'n:2' },
        frame: 1
      }),
      new PathState({
        id: paths[1].id,
        from: { id: 'n:1' },
        to: { id: 'n:3' },
        frame: 1
      })
    ]

    jest.spyOn(sim, 'findPathById')
      .mockReturnValueOnce({
        model: paths[0],
        state: pathStates[0],
        upcoming: pathStates[0]
      })
    jest.spyOn(sim, 'findPathsStartWithNode')
      .mockReturnValueOnce([
        {
          model: paths[0],
          state: pathStates[0],
          upcoming: pathStates[0]
        },
        {
          model: paths[1],
          state: pathStates[1],
          upcoming: pathStates[1]
        }
      ])
  })

  describe('activate()', () => {
    it('should activate the path', () => {
      SUT.activate({ id: 'p:1' })
      expect(sim.updatePath).toBeCalledTimes(2 + 1)
    })
  })
})
