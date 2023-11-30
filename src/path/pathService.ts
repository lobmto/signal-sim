import { type Simulator } from '../simulator'

import { type PathId } from './pathModel'

export class PathService {
  constructor (
    private readonly pathRepository: Simulator
  ) {}

  activate ({ id }: { id: PathId }): void {
    const path = this.pathRepository.findPathById({ id })
    if (path == null) return

    this.pathRepository.findPathsStartWithNode({ id: path.state.from })
      .forEach(path => {
        this.pathRepository.updatePath(path.state, { connected: false })
      })
    this.pathRepository.updatePath({ id }, { connected: true })
  }
}
