let counter = 0
export type NodeId = `n:${number}`

export class NodeModel {
  public readonly id: NodeId
  constructor (args?: { id?: NodeId }) {
    this.id = args?.id ?? `n:${counter++}`
  }
}
