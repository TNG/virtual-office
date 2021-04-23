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

  type Query {
    getOffice: Office
    getBlock(id: ID!): Block
    getGroup(id: ID!): Group
    getGroupJoinConfig(id: ID!): GroupJoinConfig
    getSession(id: ID!): Session
    getRoom(id: ID!): Room
    getRoomLinks(ids: [ID!]!): [RoomLink!]!
    getAllMeetings: [Meeting!]!
    getParticipantsInMeeting(id: ID!): [Participant!]!
    getClientConfig: ClientConfig!
  }

  type Subscription {
    participantMutated: ParticipantMutatedPayload!
  }

  type Mutation {
    addRoomToGroup(roomConfig: RoomConfig!, groupId: ID!): AddRoomToGroupResponse!
    addParticipantToMeeting(participant: ParticipantInput!, id: ID!): AddParticipantToMeetingResponse!
    removeParticipantFromMeeting(participant: ParticipantInput!, id: ID!): AddParticipantToMeetingResponse!
  }

  interface MutationResponse {
    success: Boolean!
    message: String!
  }

  input RoomConfig {
    name: String!
    description: String
    joinUrl: String
    titleUrl: String
    icon: String
    roomLinks: [RoomLinkConfig!]
    slackNotification: SlackNotificationConfig
    meetingId: String
  }

  input RoomLinkConfig {
    href: String!
    text: String!
    icon: String
    linkGroup: String
  }

  input SlackNotificationConfig {
    channelId: String!
    notificationInterval: Float
  }

  type AddRoomToGroupResponse implements MutationResponse {
    success: Boolean!
    message: String!
    room: Room
    group: Group
  }

  type AddParticipantToMeetingResponse implements MutationResponse {
    success: Boolean!
    message: String!
  }

  input ParticipantInput {
    id: ID!
    username: String!
    email: String
    imageUrl: String
  }

  type ParticipantMutatedPayload {
    mutationType: ParticipantMutationType!
    participant: Participant!
    meetingId: ID!
  }

  enum ParticipantMutationType {
    PARTICIPANT_ADDED
    PARTICIPANT_REMOVED
  }
`;
