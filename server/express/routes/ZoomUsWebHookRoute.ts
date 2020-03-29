import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";
import { RoomsService } from "../../services/RoomsService";
import { MeetingParticipant } from "../types/MeetingParticipant";

interface ZoomUsEvent {
  event: string;
  payload: {
    object: {
      id: string;
      participant: {
        user_id: string;
        user_name: string;
      };
    };
  };
}

@Service()
export class ZoomUsWebHookRoute implements ExpressRoute {
  constructor(private readonly roomsService: RoomsService) {}

  router(): Router {
    const router = Router();

    router.post("/zoomus/webhook", (req, res) => {
      console.log(JSON.stringify(req.body));
      const {
        event,
        payload: {
          object: { id, participant },
        },
      } = req.body as ZoomUsEvent;

      const mappedParticipant: MeetingParticipant = {
        username: participant.user_name,
        id: participant.user_id,
      };

      switch (event) {
        case "meeting.participant_joined":
          this.roomsService.joinRoom(id, mappedParticipant);
          res.sendStatus(200);
          break;
        case "meeting.participant_left":
          this.roomsService.leaveRoom(id, mappedParticipant);
          res.sendStatus(200);
          break;
        default:
          res.sendStatus(400);
      }
    });

    return router;
  }
}
