import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";
import { RoomsService } from "../../services/RoomsService";
import { MeetingParticipant } from "../types/MeetingParticipant";
import { logger } from "../../log";
import { Config } from "../../Config";

function loggableParticipant(participant: ZoomusParticipant, enableParticipantLogging: boolean): ZoomusParticipant {
  return {
    ...participant,
    user_name: enableParticipantLogging ? participant.user_name : "xxxx",
  };
}

interface ZoomusParticipant {
  id?: string;
  user_id: string;
  user_name: string;
}

interface ZoomUsEvent {
  event: string;
  traceId;
  payload: {
    object: {
      id: string;
      participant: ZoomusParticipant;
    };
  };
}

@Service()
export class ZoomUsWebHookRoute implements ExpressRoute {
  constructor(private readonly roomsService: RoomsService, private readonly config: Config) {}

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

      logger.info({
        message: "Received an zoom.us notification",
        event: event,
        meetingId: id,
        participant: loggableParticipant(participant, this.config.enableParticipantLogging),
        traceId,
      });

      switch (event) {
        case "meeting.participant_joined":
          this.roomsService.joinRoom(id, mapParticipant(id, participant));
          res.sendStatus(200);
          break;
        case "meeting.participant_left":
          this.roomsService.leave(id, mapParticipant(id, participant));
          res.sendStatus(200);
          break;
        case "meeting.ended":
          this.roomsService.endRoom(id);
          res.sendStatus(200);
          break;
        default:
          logger.info(`don't know what to do with ${event}`);
          res.sendStatus(200);
          break;
      }
    });

    return router;
  }
}

const mapParticipant = (
  meetingId: string,
  participant: { id?: string; user_name: string; user_id: string }
): MeetingParticipant => ({
  username: participant.user_name,
  id: `zoomus_${meetingId}_${participant.user_id}`, // id is permanent for logged in users, user_id is temporary per meeting
});
