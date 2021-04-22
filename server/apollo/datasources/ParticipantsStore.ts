import { Service } from "typedi";
import { DataSource } from "apollo-datasource";
import { MeetingApollo, ParticipantApollo } from "../TypesApollo";

@Service()
export class ParticipantsStore extends DataSource {
  private meetings: MeetingApollo[] = [];

  constructor() {
    super();
    this.meetings.push({
      id: "91905545648",
      participants: [{ id: "zettsebastian", username: "Sebastian Zett" }],
    });
  }

  initialize() {
    //this.context = config.context;
  }

  public getAllMeetings(): MeetingApollo[] {
    return this.meetings;
  }

  public getOrCreateMeeting(id: string): MeetingApollo {
    let meeting: MeetingApollo | undefined = this.meetings.find((meeting: MeetingApollo) => meeting.id === id);
    if (!meeting) {
      meeting = {
        id: id,
        participants: [],
      };
      this.meetings.push(meeting);
    }
    return meeting;
  }

  public getParticipantsInMeeting(id: string): ParticipantApollo[] {
    return this.getOrCreateMeeting(id).participants;
  }

  public addParticipantToMeeting(participant: ParticipantApollo, id: string): boolean {
    const meeting: MeetingApollo = this.getOrCreateMeeting(id);
    const sameParticipantsInMeeting: ParticipantApollo[] = meeting.participants.filter(
      (existingPart: ParticipantApollo) => existingPart.id === participant.id
    );
    if (sameParticipantsInMeeting.length === 0) {
      meeting.participants.push(participant);
      return true;
    } else {
      return false;
    }
  }

  public removeParticipantFromMeeting(participant: ParticipantApollo, id: string) {
    const meeting: MeetingApollo = this.getOrCreateMeeting(id);
    const participantCountBefore: number = meeting.participants.length;
    meeting.participants = meeting.participants.filter(
      (existingPart: ParticipantApollo) => existingPart.id !== participant.id
    );
    return participantCountBefore > meeting.participants.length;
  }
}
