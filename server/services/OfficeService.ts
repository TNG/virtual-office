import { Service } from "typedi";

import { Office } from "../express/types/Office";
import { Config } from "../Config";
import { RoomsService } from "./RoomsService";
import { ConfigOptions } from "../express/types/ConfigOptions";
import { Group } from "../express/types/Group";

export type OfficeChangeListener = (office: Office) => void;

@Service()
export class OfficeService {
  private officeChangeListeners: OfficeChangeListener[] = [];
  private groups: Group[] = [];

  public constructor(config: Config, private readonly roomService: RoomsService) {
    this.groups = config.configOptions.groups;
  }

  getOffice(): Office {
    const rooms = this.roomService.getAllRooms();

    return {
      groups: this.groups,
      rooms,
    };
  }

  replaceOfficeWith(configOptions: ConfigOptions) {
    this.roomService.replaceRoomsWith(configOptions.rooms);
    this.groups = configOptions.groups;

    this.notifyOfficeChangeListeners();
  }

  listenOfficeChanges(listener: OfficeChangeListener) {
    this.officeChangeListeners.push(listener);
  }

  private notifyOfficeChangeListeners() {
    const office = this.getOffice();
    this.officeChangeListeners.forEach((listener) => listener(office));
  }
}
