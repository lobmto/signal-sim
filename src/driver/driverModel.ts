let counter = 0
export type DriverId = `d:${number}`

export class DriverModel {
  public readonly id: DriverId
  constructor (args?: { id?: DriverId }) {
    this.id = args?.id ?? `d:${counter++}`
  }
}
