let counter = 0
export type StationId = `st:${number}`

export class StationModel {
  public readonly id: StationId
  constructor (args?: { id?: StationId }) {
    this.id = args?.id ?? `st:${counter++}`
  }
}
