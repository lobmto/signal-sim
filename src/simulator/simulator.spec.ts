import { NodeModel } from '../node'
import { PathModel } from '../path'
import { SignalModel } from '../signal'
import { TrainModel } from '../train'

import { Simulator } from '.'

/*
Node Id Map

0 --> 1 +-> 2 --> 3
        |-> 4 <-> 5

6 -x- 7
*/
describe('Simulator', () => {
  let sim: Simulator
  let nodes: NodeModel[]
  let paths: PathModel[]
  let trains: TrainModel[]
  let signals: SignalModel[]
  let invalidNode: NodeModel
  let invalidPath: PathModel
  let invalidTrain: TrainModel
  let invalidSignal: SignalModel

  beforeEach(() => {
    nodes = [...Array(10)].map(_ => new NodeModel())
    invalidNode = new NodeModel({ id: 'n:-999999' })

    paths = [...Array(10)].map(_ => new PathModel())
    invalidPath = new PathModel({ id: 'p:-999999' })

    trains = [...Array(3)].map(_ => new TrainModel())
    invalidTrain = new TrainModel({ id: 't:-999999' })

    signals = [...Array(3)].map(_ => new SignalModel())
    invalidSignal = new SignalModel({ id: 's:-999999' })

    sim = new Simulator()
      .insertNode(nodes[0])
      .insertNode(nodes[1])
      .insertNode(nodes[2])
      .insertNode(nodes[3])
      .insertNode(nodes[4])
      .insertNode(nodes[5])
      .insertNode(nodes[6])
      .insertPath(paths[0], { from: nodes[0], to: nodes[1], connected: true })
      .insertPath(paths[1], { from: nodes[1], to: nodes[2], connected: true })
      .insertPath(paths[2], { from: nodes[2], to: nodes[3], connected: true })
      .insertPath(paths[3], { from: nodes[1], to: nodes[4], connected: true })
      .insertPath(paths[4], { from: nodes[4], to: nodes[5], connected: true })
      .insertPath(paths[5], { from: nodes[6], to: nodes[7] })
      .insertPath(paths[6], { from: nodes[5], to: nodes[4], connected: true })
      .insertSignal(signals[0], { path: paths[0] })
      .insertSignal(signals[1], { path: paths[1] })
      .insertSignal(signals[2], { path: paths[4] })
      .putTrain(
        trains[0],
        {
          pathId: paths[0].id,
          distanceFromEnd: 900,
          length: 100,
          speed: 100
        })
      .update()
  })

  describe('findNodeById()', () => {
    it('should return a node by id', () => {
      expect(sim.findNodeById(nodes[0])).toStrictEqual(nodes[0])
    })

    it('should return null with invalid id', () => {
      expect(sim.findNodeById(invalidNode)).toBeNull()
    })
  })

  describe('isEndOfPath()', () => {
    it('should return true for end of path', () => {
      expect(sim.isEndOfPath(paths[4])).toBeTruthy()
    })

    it('should return false for between path', () => {
      expect(sim.isEndOfPath(paths[1])).toBeFalsy()
    })
  })

  describe('findPathsStartWithNode()', () => {
    it('should return nodes by path id', () => {
      const res = sim.findPathsStartWithNode(nodes[1]).map(node => node.model)
      expect(res).toStrictEqual([paths[1], paths[3]])
    })

    it('should return [] with invalid ID', () => {
      expect(sim.findPathsStartWithNode(invalidNode)).toStrictEqual([])
    })
  })

  describe('findPathById()', () => {
    it('should return an path by id', () => {
      expect(sim.findPathById(paths[0])?.model).toStrictEqual(paths[0])
    })

    it('should return null with invalid id', () => {
      expect(sim.findPathById(invalidPath)).toBeNull()
    })
  })

  describe('findOppositePathOf()', () => {
    it('should return an path by id', () => {
      expect(sim.findOppositePathOf(paths[4])?.model).toStrictEqual(paths[6])
    })

    it('should return null for a one-way path', () => {
      expect(sim.findOppositePathOf(paths[0])).toBeNull()
    })

    it('should return null for an invalid id', () => {
      expect(sim.findOppositePathOf(invalidPath)).toBeNull()
    })
  })

  describe('findPreviousPaths()', () => {
    it('should return previous path', () => {
      const res = sim.findPreviousPath(paths[1])
      expect(res?.model).toStrictEqual(paths[0])
    })

    it('should return null with invalid path', () => {
      expect(sim.findPreviousPath(invalidPath)).toBeNull()
    })

    it('should return null with first path', () => {
      expect(sim.findPreviousPath(paths[0])).toBeNull()
    })
  })

  describe('findPathsUnderTrain()', () => {
    it('should return paths by train id', () => {
      const res = sim.findPathsUnderTrain(trains[0])
      expect(res?.[0]?.model).toStrictEqual(paths[0])
      expect(res).toHaveLength(1)
    })

    it('should return paths for train straddling the paths', () => {
      sim.putTrain(
        trains[1],
        {
          pathId: paths[1].id,
          distanceFromEnd: 950,
          length: 100,
          speed: 100
        })

      const res = sim.findPathsUnderTrain(trains[1])
      expect(res?.[0]?.model).toStrictEqual(paths[1])
      expect(res?.[1]?.model).toStrictEqual(paths[0])
      expect(res).toHaveLength(2)
    })

    it('should return path for train on opposite path', () => {
      sim.putTrain(
        trains[1],
        {
          pathId: paths[6].id,
          distanceFromEnd: 900,
          length: 100,
          speed: 100
        })

      const res = sim.findPathsUnderTrain(trains[1])
      expect(res?.[0]?.model).toStrictEqual(paths[6])
      expect(res?.[1]?.model).toStrictEqual(paths[4])
      expect(res).toHaveLength(2)
    })

    it('should return [] by invalid train id', () => {
      const res = sim.findPathsUnderTrain(invalidTrain)
      expect(res).toHaveLength(0)
    })
  })

  describe('findTrainById()', () => {
    it('should return a train by id', () => {
      expect(sim.findTrainById(trains[0])?.model).toStrictEqual(trains[0])
    })

    it('should return null with invalid id', () => {
      expect(sim.findTrainById(invalidTrain)).toBeNull()
    })
  })

  describe('findTrainByPathId()', () => {
    it('should return a train by path id', () => {
      expect(sim.findTrainByPathId(paths[0])?.model).toBe(trains[0])
    })

    it('should return null with invalid path id', () => {
      expect(sim.findTrainByPathId(paths[1])).toBeNull()
    })
  })

  describe('findSignalById()', () => {
    it('should return a train by id', () => {
      expect(sim.findSignalById(signals[0])?.model).toStrictEqual(signals[0])
    })

    it('should return null with invalid id', () => {
      expect(sim.findSignalById(invalidSignal)).toBeNull()
    })
  })

  describe('findSignalOfPath()', () => {
    it('should return a signal by path id', () => {
      expect(sim.findSignalOfPath(paths[0])?.model).toStrictEqual(signals[0])
    })

    it('should return null by invalid path id', () => {
      expect(sim.findSignalOfPath(invalidPath)).toBeNull()
    })
  })

  describe('findBlock()', () => {
    it('should return paths by signal id', () => {
      const res = sim.findBlock(signals[2])
      expect(res[0]?.model).toStrictEqual(paths[4])
      expect(res[1]?.model).toStrictEqual(paths[6])
      expect(res).toHaveLength(2)
    })
  })

  describe('updatePath()', () => {

  })

  describe('putTrain()', () => {
    it('should put a train', () => {
      sim.putTrain(
        trains[1],
        {
          pathId: paths[1].id,
          distanceFromEnd: 900,
          length: 100,
          speed: 100
        })
      expect(sim.findTrainById(trains[1])?.state?.pathId).toBe(paths[1].id)
    })

    it('should ignore invalid request', () => {
      sim.putTrain(
        trains[1],
        {
          pathId: paths[1].id,
          distanceFromEnd: 1001,
          length: 100,
          speed: 100
        }) // HEAD is not inside the path
      expect(sim.findTrainById(trains[1])?.state?.pathId).toBeUndefined()
    })

    it('should ignore the request with invalid path ID', () => {
      sim.putTrain(
        trains[1],
        {
          pathId: 'p:999999',
          distanceFromEnd: 100,
          length: 100,
          speed: 100
        })
    })
  })

  describe('solveNextPathOf()', () => {
    it('should return connected path by node id', () => {
      expect(sim.findNextPathOfNode(nodes[0])?.model).toStrictEqual(paths[0])
    })

    it('should return null with invalid id', () => {
      expect(sim.findNextPathOfNode(invalidNode)).toBeNull()
    })
  })
})
