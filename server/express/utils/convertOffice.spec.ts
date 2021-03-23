import { officeLegacyToOfficeWithBlocks } from "./convertOffice";
import { Config } from "../../Config";
import { instance, mock, when } from "ts-mockito";
import { Block, GroupBlock, OfficeWithBlocks, OfficeWithBlocksCodec, ScheduleBlock } from "../types/Office";
import { isRight } from "fp-ts/Either";
import { RoomConfigLegacy, RoomLegacy } from "../types/RoomLegacy";
import { GroupLegacy } from "../types/GroupLegacy";
import { SessionLegacy, TrackLegacy } from "../types/Schedule";
import { ConfigOptionsLegacy } from "../types/ConfigOptionsLegacy";
import { GroupSession, RoomSession, Session } from "../types/Session";

describe("OfficeConverter", () => {
  const track1: TrackLegacy = {
    id: "track-1",
    name: "Track1",
  };
  const group1: GroupLegacy = {
    id: "group-1",
    name: "Group1",
    groupJoin: {
      minimumParticipantCount: 3,
      title: "Group1",
      description: "Enter a random group room.",
    },
  };
  const sessionGroup1: SessionLegacy = {
    groupId: "group-1",
    start: "07:00",
    end: "08:00",
    alwaysActive: true,
  };
  const room1: RoomLegacy = {
    roomId: "room-1",
    groupId: "group-1",
    meetingId: "meeting-1",
    name: "Room1",
    joinUrl: "http://bla.blub",
    icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/people-events/Assistance.jpg",
    subtitle: "[Mr. Bond] \n\nGolden Eye",
    links: [
      {
        href: "https://blub.bla",
        text: "#live",
        icon: "https://cdn.iconscout.com/icon/free/png-256/slack-1425877-1205068.png",
      },
    ],
  };
  const sessionRoom1: SessionLegacy = {
    trackId: "track-1",
    roomId: "room-1",
    start: "08:00",
    end: "09:00",
  };
  const room2: RoomLegacy = {
    roomId: "room-2",
    meetingId: "meeting-2",
    name: "Room2",
    description: "Come in and chill out.",
    joinUrl: "http://bla.blub",
  };
  const sessionRoom2: SessionLegacy = {
    roomId: "room-2",
    start: "09:00",
    end: "10:00",
  };
  const room3: RoomConfigLegacy = {
    meetingId: "meeting-3",
    name: "Room3",
    description: "Come in and chill out.",
    joinUrl: "http://bla.blub",
  };

  let officeLegacySimple: ConfigOptionsLegacy;
  let officeLegacySchedule: ConfigOptionsLegacy;
  let config: Config;

  beforeEach(() => {
    officeLegacySimple = {
      groups: [group1],
      rooms: [room1, room2, room3],
    };
    officeLegacySchedule = {
      groups: [group1],
      rooms: [room1, room2, room3],
      schedule: {
        tracks: [track1],
        sessions: [sessionGroup1, sessionRoom1, sessionRoom2],
      },
    };

    config = mock(Config);
    when(config.clientConfig).thenReturn({ timezone: undefined, sessionStartMinutesOffset: 10 } as any);
    when(config.configOptions).thenReturn(officeLegacySchedule);
  });

  describe("should output new office codec with all relevant elements", () => {
    it("when simple office provided", () => {
      when(config.configOptions).thenReturn(officeLegacySimple);
      const officeConverted = officeLegacyToOfficeWithBlocks(instance(config));
      expect(isRight(OfficeWithBlocksCodec.decode(officeConverted))).toBe(true);

      // 2 Groups (Group1 and new dummy group)
      expect(officeConverted.blocks.length).toBe(2);
      // 3 Rooms (1 in Group1, 2 in new dummy group)
      const groupBlock1: GroupBlock | undefined = officeConverted.blocks.find(
        (block: Block): block is GroupBlock => block.type === "GROUP_BLOCK" && block.group.name === "Group1"
      );
      expect(groupBlock1?.group.rooms.length).toBe(1);
      const groupBlock2: GroupBlock | undefined = officeConverted.blocks.find(
        (block: Block): block is GroupBlock => block.type === "GROUP_BLOCK" && block.group.name === ""
      );
      expect(groupBlock2?.group.rooms.length).toBe(2);
    });

    it("when schedule office provided", () => {
      when(config.configOptions).thenReturn(officeLegacySchedule);
      const officeConverted = officeLegacyToOfficeWithBlocks(instance(config));
      expect(isRight(OfficeWithBlocksCodec.decode(officeConverted))).toBe(true);

      // 1 ScheduleBlock
      expect(officeConverted.blocks.length).toBe(1);
      const scheduleBlock: ScheduleBlock = officeConverted.blocks[0] as ScheduleBlock;
      // 1 Track
      expect(scheduleBlock.tracks.length).toBe(1);
      // 1 GroupSession with 1 Room
      const groupSession: GroupSession[] = scheduleBlock.sessions.filter(
        (session: Session): session is GroupSession => session.type === "GROUP_SESSION"
      );
      expect(groupSession.length).toBe(1);
      expect(groupSession[0].group.rooms.length).toBe(1);
      // 2 RoomSessions
      const roomSessions: RoomSession[] = scheduleBlock.sessions.filter(
        (session: Session): session is RoomSession => session.type === "ROOM_SESSION"
      );
      expect(roomSessions.length).toBe(2);
    });
  });

  it("should remove unused group", () => {
    const unusedGroup: GroupLegacy = {
      id: "group-dummy",
      name: "group-dummy-name",
      disabledAfter: "2020-05-29T19:00:00.000+02:00",
    };
    officeLegacySimple.groups.push(unusedGroup);

    when(config.configOptions).thenReturn(officeLegacySimple);
    const officeConverted: OfficeWithBlocks = officeLegacyToOfficeWithBlocks(instance(config));

    expect(officeConverted.blocks).not.toContainEqual(
      expect.objectContaining({
        group: expect.objectContaining({
          name: "group-dummy-name",
        }),
      })
    );
    expect(officeConverted.blocks).toContainEqual(
      expect.objectContaining({
        group: expect.objectContaining({
          name: "Group1",
        }),
      })
    );
  });

  it("should remove unused session", () => {
    const unusedSession: SessionLegacy = {
      roomId: "room-99",
      start: "11:00",
      end: "11:01",
    };
    officeLegacySchedule.schedule!.sessions.push(unusedSession);

    when(config.configOptions).thenReturn(officeLegacySchedule);
    const officeConverted: OfficeWithBlocks = officeLegacyToOfficeWithBlocks(instance(config));

    expect(officeConverted.blocks).not.toContainEqual(
      expect.objectContaining({
        type: "SCHEDULE_BLOCK",
        sessions: expect.arrayContaining([
          expect.objectContaining({
            type: "ROOM_SESSION",
            start: "11:00",
            end: "11:01",
          }),
        ]),
      })
    );
    expect(officeConverted.blocks).toContainEqual(
      expect.objectContaining({
        type: "SCHEDULE_BLOCK",
        sessions: expect.arrayContaining([
          expect.objectContaining({
            type: "ROOM_SESSION",
            room: expect.objectContaining({
              name: "Room1",
            }),
          }),
        ]),
      })
    );
  });
});
