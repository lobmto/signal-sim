import { type Simulator } from '../simulator'

export class NodeService {
  constructor (
    private readonly nodeRepository: Simulator
  ) {}
}
