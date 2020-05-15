import { MeetingParticipantsService } from "./MeetingParticipantsService";
import { instance, mock, when } from "ts-mockito";
import { KnownUsersService } from "./KnownUsersService";
import { MeetingEvent } from "../express/types/MeetingEvent";
import { User } from "../express/types/User";

describe("MeetingParticipantsService", () => {
  let participantsService: MeetingParticipantsService;
  let knownUsersService: KnownUsersService;

  let listener: jest.Mock;

  beforeEach(() => {
    knownUsersService = mock(KnownUsersService);
    listener = jest.fn();

    participantsService = new MeetingParticipantsService(instance(knownUsersService));
  });

  it("should join and leave an existing room", () => {
    const participant = { id: "123", username: "bla" };
    const meetingId = "1";

    participantsService.joinRoom(meetingId, participant);

    expect(participantsService.getParticipantsIn(meetingId)).toEqual([participant]);

    participantsService.leave(meetingId, participant);

    expect(participantsService.getParticipantsIn(meetingId)).toEqual([]);
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
    when(knownUsersService.find(participant.username)).thenReturn(knownUser);

    participantsService.joinRoom(meetingId, participant);

    expect(participantsService.getParticipantsIn(meetingId)).toEqual([
      { ...participant, email: knownUser.email, imageUrl: knownUser.imageUrl },
    ]);

    participantsService.leave(meetingId, participant);

    expect(participantsService.getParticipantsIn(meetingId)).toHaveLength(0);
  });

  it("notifies on enter", () => {
    const participant = { id: "123", username: "bla" };
    participantsService.listenParticipantsChange(listener);
    const meetingId = "1";

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
    participantsService.joinRoom(meetingId, participant);

    participantsService.listenParticipantsChange(listener);
    participantsService.joinRoom(meetingId, participant);

    expect(listener).not.toHaveBeenCalled();
  });

  it("notifies on leave", () => {
    const participant = { id: "123", username: "bla" };
    const meetingId = "1";
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
    participantsService.joinRoom(meetingId, participant);
    participantsService.listenParticipantsChange(listener);

    participantsService.endRoom(meetingId);

    expect(listener).toHaveBeenCalledWith({
      type: "leave",
      meetingId,
      participant,
    } as MeetingEvent);
  });

  it("can update a user", () => {
    const user: User = {
      name: "Hans Wurst",
      id: "abc",
      email: "hans.wurst@gmail.com",
      imageUrl: "http://my.image.com/myImage.png",
    };
    const meetingId = "1";
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
});
