import { Service } from "typedi";

import { Office } from "../express/types/Office";
import { Config } from "../Config";
import { RoomsService } from "./RoomsService";

@Service()
export class OfficeService {
  public constructor(private readonly config: Config, private readonly roomService: RoomsService) {}

  getOffice(): Office {
    const groups = this.config.configOptions.groups;
    const rooms = this.roomService.getAllRooms();

    return {
      groups,
      rooms,
    };
  }
}
