import { ScheduleModel } from './scheduleModel'

let counter = 0
export type DriverId = `d:${number}`

export class DriverModel {
  public readonly id: DriverId
  private schedule: ScheduleModel | null = null
  
  constructor (args?: { id?: DriverId }) {
    this.id = args?.id ?? `d:${counter++}`
  }

  updateSchedule (schedule: ScheduleModel): void {
    this.schedule = schedule
  }

  controlTrain () {
    // TODO: ダイヤをもとに制御を行う
  }
}
