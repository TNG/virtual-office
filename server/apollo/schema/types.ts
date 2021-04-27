import { gql } from "apollo-server-express";
import { Block } from "../../types/Block";
import { Session } from "../../types/Session";

export const typeDefsTypes = gql`
  type Office {
    id: ID!
    version: String!
    blocks: [Block!]!
  }

  interface Block {
    id: ID!
    type: String!
    name: String
  }

  type GroupBlock implements Block {
    id: ID!
    type: String!
    name: String
    group: Group!
  }

  type ScheduleBlock implements Block {
    id: ID!
    type: String!
    name: String
    sessions: [Session!]!
    tracks: [Track!]
  }

  type SessionBlock implements Block {
    id: ID!
    type: String!
    name: String
    title: String!
    sessions: [RoomSession!]!
  }

  type Track {
    id: ID!
    name: String!
  }

  interface Session {
    id: ID!
    type: String!
    start: String!
    end: String!
    trackName: String
  }

  type GroupSession implements Session {
    id: ID!
    type: String!
    start: String!
    end: String!
    trackName: String
    group: Group!
  }

  type RoomSession implements Session {
    id: ID!
    type: String!
    start: String!
    end: String!
    trackName: String
    room: Room!
  }

  type Group {
    id: ID!
    name: String!
    rooms: [Room!]!
    description: String
    groupJoinConfig: GroupJoinConfig
  }

  type GroupJoinConfig {
    id: ID!
    minimumParticipantCount: Int!
    title: String!
    description: String!
    subtitle: String
  }

  type Room {
    id: ID!
    name: String!
    description: String
    joinUrl: String
    titleUrl: String
    icon: String
    roomLinks: [RoomLink!]
    slackNotification: SlackNotification
    meetingId: String
  }

  type RoomLink {
    id: ID!
    href: String!
    text: String!
    icon: String
    linkGroup: String
  }

  type SlackNotification {
    id: ID!
    channelId: String!
    notificationInterval: Float
  }

  type Meeting {
    id: ID!
    participants: [Participant!]!
  }

  type Participant {
    id: ID!
    username: String!
    email: String
    imageUrl: String
  }

  type ClientConfig {
    id: ID!
    viewMode: String!
    theme: String!
    sessionStartMinutesOffset: Int!
    backgroundUrl: String
    timezone: String
    title: String
    logoUrl: String
    faviconUrl: String
    hideEndedSessions: Boolean
  }
`;

export const resolversTypes = {
  Block: {
    __resolveType(block: Block) {
      if (block.type === "GROUP_BLOCK") {
        return "GroupBlock";
      } else if (block.type === "SCHEDULE_BLOCK") {
        return "ScheduleBlock";
      } else if (block.type === "SESSION_BLOCK") {
        return "SessionBlock";
      } else {
        return null;
      }
    },
  },
  Session: {
    __resolveType(session: Session) {
      if (session.type === "GROUP_SESSION") {
        return "GroupSession";
      } else if (session.type === "ROOM_SESSION") {
        return "RoomSession";
      } else {
        return null;
      }
    },
  },
};
