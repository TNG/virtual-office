import { Service } from "typedi";
import { DataSource } from "apollo-datasource";
import { Meeting, Participant } from "../../types/Meeting";

@Service()
export class ParticipantsStore extends DataSource {
  private meetings: Meeting[] = [];

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

  public getAllMeetings(): Meeting[] {
    return this.meetings;
  }

  public getOrCreateMeeting(id: string): Meeting {
    let meeting: Meeting | undefined = this.meetings.find((meeting: Meeting) => meeting.id === id);
    if (!meeting) {
      meeting = {
        id: id,
        participants: [],
      };
      this.meetings.push(meeting);
    }
    return meeting;
  }

  public getParticipantsInMeeting(id: string): Participant[] {
    return this.getOrCreateMeeting(id).participants;
  }

  public addParticipantToMeeting(participant: Participant, id: string): boolean {
    const meeting: Meeting = this.getOrCreateMeeting(id);
    const sameParticipantsInMeeting: Participant[] = meeting.participants.filter(
      (existingPart: Participant) => existingPart.id === participant.id
    );
    if (sameParticipantsInMeeting.length === 0) {
      meeting.participants.push(participant);
      return true;
    } else {
      return false;
    }
  }

  public removeParticipantFromMeeting(participant: Participant, id: string): boolean {
    const meeting: Meeting = this.getOrCreateMeeting(id);
    const participantCountBefore: number = meeting.participants.length;
    meeting.participants = meeting.participants.filter(
      (existingPart: Participant) => existingPart.id !== participant.id
    );
    return participantCountBefore > meeting.participants.length;
  }

  public endMeeting(id: string): { success: boolean; priorParticipants: Participant[] } {
    const meeting: Meeting = this.getOrCreateMeeting(id);
    const priorParticipants = meeting.participants;
    meeting.participants = [];
    return { success: true, priorParticipants };
  }
}
