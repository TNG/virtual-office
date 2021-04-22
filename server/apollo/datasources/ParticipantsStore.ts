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

  public addParticipantToMeeting(participant: ParticipantApollo, id: string) {
    this.getOrCreateMeeting(id).participants.push(participant);
  }

  public removeParticipantFromMeeting(participant: ParticipantApollo, id: string) {
    this.getOrCreateMeeting(id).participants.filter(
      (existingPart: ParticipantApollo) => existingPart.id !== participant.id
    );
  }
}
