const { gql } = require("apollo-server-express");

export const typeDefs = gql`
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

  type Query {
    getOffice: Office
    getBlock(id: ID!): Block
    getGroup(id: ID!): Group
    getSession(id: ID!): Session
    getRoom(id: ID!): Room
  }
`;

/*
type Mutation {
  addRoomToGroup(roomInput: RoomInput!, groupName: String!): AddRoomToGroupResponse!
}

input RoomInput {
  name: String!
  description: String
  joinUrl: String
  titleUrl: String
  icon: String
  roomLinks: [RoomLinkInput!]
  slackNotification: SlackNotificationInput
  meetingId: String
}

input RoomLinkInput {
  href: String!
  text: String!
  icon: String
  linkGroup: String
}

input SlackNotificationInput {
  channelId: String!
  notificationInterval: Float
}

interface MutationResponse {
  success: Boolean!
  message: String!
}

type AddRoomToGroupResponse implements MutationResponse {
  success: Boolean!
  message: String!
  room: Room
  group: Group
}*/
