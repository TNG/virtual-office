import { Office as Office_old } from "../../../server/express/types/Office";
// import { Meeting as Meeting_old } from "../../../server/express/types/Meeting";
// import { RoomLink as RoomLink_old } from "../../../server/express/types/RoomLink";
// import { GroupJoinConfig as GroupJoinConfig_old } from "../../../server/express/types/Group";

type Office = OfficeLegacy | OfficeWithBlocks;

interface OfficeInterface {
  version: "1" | "2";
}

export interface OfficeLegacy extends OfficeInterface, Office_old {
  version: "1";
}

export interface OfficeWithBlocks extends OfficeInterface {
  version: "2";
  blocks: Block[];
}

type Block = GroupBlock | ScheduleBlock;

interface BlockInterface {
  type: "GROUP" | "SCHEDULE";
}

export interface GroupBlock extends BlockInterface {
  type: "GROUP";
  group: Group;
}

interface ScheduleBlock extends BlockInterface {
  type: "SCHEDULE";
  tracks: Track[];
  sessions: Session[];
}

interface Track {
  name: string;
}

type Session = GroupSession | RoomSession;

interface SessionInterface {
  type: "GROUP" | "ROOM";
  track?: Track;
  start: string;
  end: string;
}

interface GroupSession extends SessionInterface {
  type: "GROUP";
  group: Group;
}

interface RoomSession extends SessionInterface {
  type: "ROOM";
  room: Room;
}

export interface Group {
  name: string;
  description?: string;
  rooms: Room[];
  groupJoinConfig?: {
    minimumParticipantCount: number;
    title: string;
    subtitle?: string;
    description: string;
  };
}

export interface Room {
  name: string;
  subtitle?: string;
  description?: string;
  joinUrl?: string;
  meeting: Meeting;
  titleUrl?: string;
  roomLinks?: {
    href: string;
    text: string;
    icon?: string;
    group?: string;
  }[];
  icon?: string;
  slackNotification?: {
    channelId: string;
    notificationInterval?: number;
  };
}

export interface Meeting {
  meetingId: string;
  participants: MeetingParticipant[];
}

export interface MeetingParticipant {
  id: string;
  username: string;
  email?: string;
  imageUrl?: string;
}
