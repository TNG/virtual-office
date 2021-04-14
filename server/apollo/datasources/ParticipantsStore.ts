import { Service } from "typedi";
import { DataSource } from "apollo-datasource";
import { ParticipantApollo } from "../TypesApollo";

@Service()
export class ParticipantsStore extends DataSource {
  private participantsPerMeeting: {
    [meetingId: string]: ParticipantApollo[];
  } = {};

  constructor() {
    super();
    this.participantsPerMeeting["91905545648"] = [
      {
        id: "user1",
        username: "Sebastian Zett",
      },
    ];
  }

  initialize() {
    //this.context = config.context;
  }

  public getParticipantsInMeeting(id: string): ParticipantApollo[] {
    const participants: ParticipantApollo[] | undefined = this.participantsPerMeeting[id];
    return participants ? participants : [];
  }

  public addParticipantToMeeting(participant: ParticipantApollo, id: string) {
    if (!this.participantsPerMeeting[id]) {
      this.participantsPerMeeting[id] = [];
    }
    this.participantsPerMeeting[id].push(participant);
  }

  public removeParticipantFromMeeting(participant: ParticipantApollo, id: string): boolean {
    if (this.participantsPerMeeting[id]) {
      this.participantsPerMeeting[id] = this.participantsPerMeeting[id].filter(
        (existingPart: ParticipantApollo) => existingPart.id !== participant.id
      );
      return true;
    }
    return false;
  }
}
