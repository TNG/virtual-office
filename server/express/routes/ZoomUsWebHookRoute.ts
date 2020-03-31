import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";
import { RoomsService } from "../../services/RoomsService";
import { MeetingParticipant } from "../types/MeetingParticipant";
import { logger } from "../../log";

interface ZoomUsEvent {
  event: string;
  traceId;
  payload: {
    object: {
      id: string;
      participant: {
        id?: string;
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
      const {
        event,
        traceId,
        payload: {
          object: { id, participant },
        },
      } = req.body as ZoomUsEvent;

      logger.info({ message: "Received an zoom.us notification", event: event, meetingId: id, participant, traceId });

      switch (event) {
        case "meeting.participant_joined":
          this.roomsService.joinRoom(id, mapParticipant(participant));
          res.sendStatus(200);
          break;
        case "meeting.participant_left":
          this.roomsService.leave(mapParticipant(participant));
          res.sendStatus(200);
          break;
        case "meeting.ended":
          this.roomsService.endRoom(id);
          res.sendStatus(200);
          break;
        default:
          res.sendStatus(400);
      }
    });

    return router;
  }
}

const mapParticipant = (participant: { id?: string; user_name: string; user_id: string }): MeetingParticipant => ({
  username: participant.user_name,
  id: "zoomus_" + (participant.id || participant.user_id), // id is permanent for logged in users, user_id is temporary per meeting
});
