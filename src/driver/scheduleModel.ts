import { PathId } from "../path";
import { TrainId } from "../train";

export class ScheduledPath {
  constructor (
    public readonly pathId: PathId,
    public readonly arrivalAt: Date,
    public readonly depertureAt: Date,
    public readonly secondsToStop: Number
  ) {}
}

export class ScheduleModel {
  constructor (
    public readonly trainId: TrainId,
    private scheduledPaths: ScheduledPath[] = []
  ) {}

  getCurrentSchedule (): ScheduledPath {
    return this.scheduledPaths[0]
  }

  dropCurrentSchedule () {
    this.scheduledPaths.pop()
  }
}
