import { Service } from "typedi";
import { ExpressRoute } from "./ExpressRoute";
import { Router } from "express";
import { logger } from "../../log";
import { Config } from "../../Config";
import { ParticipantsStore } from "../../apollo/datasources/ParticipantsStore";
import { Participant } from "../../types/Meeting";
import { pubSub } from "../../apollo/ApolloPubSubService";
import { MutationType } from "../../graphql/types/MutationResponse";
import { ParticipantMutatedResponse } from "../../graphql/types/Participant";

function loggableParticipant(participant: ZoomUsParticipant, enableParticipantLogging: boolean): ZoomUsParticipant {
  return {
    ...participant,
    user_name: enableParticipantLogging ? participant.user_name : "xxxx",
  };
}

interface ZoomUsParticipant {
  id?: string;
  user_id: string;
  user_name: string;
}

export interface ZoomUsEvent {
  event: string;
  traceId: string;
  payload: {
    object: {
      id: string;
      participant: ZoomUsParticipant;
    };
  };
}

@Service()
export class ZoomUsWebHookRoute implements ExpressRoute {
  constructor(
    //private readonly roomsService: MeetingsService,
    private readonly config: Config,
    private readonly participantsStore: ParticipantsStore
  ) {}

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

      logger.info("Received an zoom.us notification", {
        event: event,
        meetingId: id,
        participant: loggableParticipant(participant, this.config.enableParticipantLogging),
        traceId,
      });

      if (event === "meeting.participant_joined") {
        const success: boolean = this.participantsStore.addParticipantToMeeting(mapParticipant(id, participant), id);
        const mutationResponse: ParticipantMutatedResponse = {
          success: success,
          message: success ? "Successfully added participant!" : "Participant already in meeting!",
          mutationType: MutationType.ADD,
          participant: mapParticipant(id, participant),
          meetingId: id,
        };
        if (success) {
          pubSub.publish("PARTICIPANT_ADDED", mutationResponse);
        }
        res.sendStatus(200);
      } else if (event === "meeting.participant_left") {
        const success: boolean = this.participantsStore.removeParticipantFromMeeting(
          mapParticipant(id, participant),
          id
        );
        const mutationResponse: ParticipantMutatedResponse = {
          success: success,
          message: success ? "Successfully removed participant!" : "Participant not in meeting!",
          mutationType: MutationType.REMOVE,
          participant: mapParticipant(id, participant),
          meetingId: id,
        };
        if (success) {
          pubSub.publish("PARTICIPANT_REMOVED", mutationResponse);
        }
        res.sendStatus(200);
      } else if (event === "meeting.ended" || event === "webinar.ended") {
        /*var { success, priorParticipants } = this.participantsStore.endMeeting(id);
          if (success) {
            priorParticipants.forEach((participant: Participant) => {
              mutationResponse = {
                success: success,
                message: success ? "Successfully removed participant!" : "Participant not in meeting!",
                mutationType: "REMOVE",
                participant: participant,
                meetingId: id,
                };
              pubSub.publish("PARTICIPANT_REMOVED", { participantMutated: mutationResponse });
            });
            res.sendStatus(200);
          }*/
      } else {
        logger.info(`Don't know what to do with ${event}!`);
        res.sendStatus(200);
      }
    });

    return router;
  }
}

const mapParticipant = (
  meetingId: string,
  participant: { id?: string; user_name: string; user_id: string }
): Participant => ({
  username: participant.user_name,
  id: `zoomus_${meetingId}_${participant.user_id}`, // id is permanent for logged in users, user_id is temporary per meeting
});
