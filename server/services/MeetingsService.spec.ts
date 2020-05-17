import { MeetingsService } from "./MeetingsService";
import { instance, mock, when } from "ts-mockito";
import { KnownUsersService } from "./KnownUsersService";
import { MeetingEvent } from "../express/types/MeetingEvent";
import { User } from "../express/types/User";
import { OfficeService } from "./OfficeService";

describe("MeetingParticipantsService", () => {
  let participantsService: MeetingsService;
  let knownUsersService: KnownUsersService;
  let officeService: OfficeService;

  let listener: jest.Mock;

  beforeEach(() => {
    knownUsersService = mock(KnownUsersService);
    officeService = mock(OfficeService);
    listener = jest.fn();

    participantsService = new MeetingsService(instance(knownUsersService), instance(officeService));
  });

  it("should join and leave an existing room", () => {
    const participant = { id: "123", username: "bla" };
    const meetingId = "1";
    when(officeService.hasMeetingIdConfigured(meetingId)).thenReturn(true);

    participantsService.joinRoom(meetingId, participant);

    expect(participantsService.getParticipantsIn(meetingId)).toEqual([participant]);

    participantsService.leave(meetingId, participant);

    expect(participantsService.getParticipantsIn(meetingId)).toEqual([]);
  });

  it("won't pass out participants if the meeting has not been configured in the office", () => {
    const participant = { id: "123", username: "bla" };
    const meetingId = "1";
    when(officeService.hasMeetingIdConfigured(meetingId)).thenReturn(false);

    participantsService.joinRoom(meetingId, participant);

    expect(participantsService.getParticipantsIn(meetingId)).toEqual([]);
    expect(participantsService.getAllMeetings()).toEqual([]);
  });

  it("can enrich a participant", () => {
    const participant = { id: "123", username: "bla" };
    const knownUser = {
      imageUrl: "http://bla.blub",
      email: "bla@example.com",
      name: "Hello World",
      id: "1234",
    };
    const meetingId = "2";
    when(officeService.hasMeetingIdConfigured(meetingId)).thenReturn(true);
    when(knownUsersService.find(participant.username)).thenReturn(knownUser);

    participantsService.joinRoom(meetingId, participant);

    expect(participantsService.getParticipantsIn(meetingId)).toEqual([
      { ...participant, email: knownUser.email, imageUrl: knownUser.imageUrl },
    ]);

    participantsService.leave(meetingId, participant);

    expect(participantsService.getParticipantsIn(meetingId)).toHaveLength(0);
  });

  it("can update a user", () => {
    const user: User = {
      name: "Hans Wurst",
      id: "abc",
      email: "hans.wurst@gmail.com",
      imageUrl: "http://my.image.com/myImage.png",
    };
    const meetingId = "1";
    when(officeService.hasMeetingIdConfigured(meetingId)).thenReturn(true);
    const participant = { id: "123", username: user.name.toLowerCase() };
    participantsService.joinRoom(meetingId, participant);
    participantsService.listenParticipantsChange(listener);

    participantsService.onUserUpdate(user);

    expect(listener).toHaveBeenCalledWith({
      participant: {
        ...participant,
        imageUrl: user.imageUrl,
        email: user.email,
      },
      meetingId,
      type: "update",
    } as MeetingEvent);
  });

  describe("event notifications", () => {
    it("notifies on enter", () => {
      const participant = { id: "123", username: "bla" };
      participantsService.listenParticipantsChange(listener);
      const meetingId = "1";
      when(officeService.hasMeetingIdConfigured(meetingId)).thenReturn(true);

      participantsService.joinRoom(meetingId, participant);

      expect(listener).toHaveBeenCalledWith({
        type: "join",
        meetingId,
        participant,
      } as MeetingEvent);
    });

    it("won't notify on enter when the user is already in the room", () => {
      const participant = { id: "123", username: "bla" };
      const meetingId = "1";
      when(officeService.hasMeetingIdConfigured(meetingId)).thenReturn(true);
      participantsService.joinRoom(meetingId, participant);

      participantsService.listenParticipantsChange(listener);
      participantsService.joinRoom(meetingId, participant);

      expect(listener).not.toHaveBeenCalled();
    });

    it("notifies on leave", () => {
      const participant = { id: "123", username: "bla" };
      const meetingId = "1";
      when(officeService.hasMeetingIdConfigured(meetingId)).thenReturn(true);
      participantsService.joinRoom(meetingId, participant);
      participantsService.listenParticipantsChange(listener);

      participantsService.leave(meetingId, participant);

      expect(listener).toHaveBeenCalledWith({
        type: "leave",
        meetingId,
        participant,
      } as MeetingEvent);
    });

    it("notifies leave for all participants on meeting end", () => {
      const participant = { id: "123", username: "bla" };
      const meetingId = "1";
      when(officeService.hasMeetingIdConfigured(meetingId)).thenReturn(true);
      participantsService.joinRoom(meetingId, participant);
      participantsService.listenParticipantsChange(listener);

      participantsService.endRoom(meetingId);

      expect(listener).toHaveBeenCalledWith({
        type: "leave",
        meetingId,
        participant,
      } as MeetingEvent);
    });

    it("won't send a notification when the meeting has not been configured for the office", () => {
      const participant = { id: "123", username: "bla" };
      participantsService.listenParticipantsChange(listener);
      const meetingId = "1";
      when(officeService.hasMeetingIdConfigured(meetingId)).thenReturn(false);

      participantsService.joinRoom(meetingId, participant);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
