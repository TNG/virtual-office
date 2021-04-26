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
    participantMutated: ParticipantMutatedResponse!
    roomInGroupMutated(groupId: ID!): RoomInGroupMutatedResponse!
  }

  type Mutation {
    addParticipantToMeeting(participant: ParticipantInput!, meetingId: ID!): ParticipantMutatedResponse!
    removeParticipantFromMeeting(participant: ParticipantInput!, meetingId: ID!): ParticipantMutatedResponse!
    updateOffice(officeInput: OfficeInput!): OfficeMutatedResponse!
    addRoomToGroup(roomInput: RoomInput!, groupId: ID!): RoomInGroupMutatedResponse!
    removeRoomFromGroup(roomId: ID!, groupId: ID!): RoomInGroupMutatedResponse!
  }

  enum MutationType {
    ADD
    REMOVE
    UPDATE
  }

  interface MutationResponse {
    success: Boolean!
    message: String!
    mutationType: MutationType!
  }

  type ParticipantMutatedResponse implements MutationResponse {
    success: Boolean!
    message: String!
    mutationType: MutationType!
    participant: Participant!
    meetingId: ID!
  }

  type OfficeMutatedResponse implements MutationResponse {
    success: Boolean!
    message: String!
    mutationType: MutationType!
    office: Office!
  }

  type RoomInGroupMutatedResponse implements MutationResponse {
    success: Boolean!
    message: String!
    mutationType: MutationType!
    room: Room
    groupId: ID!
  }

  input ParticipantInput {
    id: ID!
    username: String!
    email: String
    imageUrl: String
  }

  input OfficeInput {
    version: String!
    blocks: [BlockInput!]!
  }

  input BlockInput {
    type: String!
    name: String
    group: GroupInput
    sessions: [SessionInput!]
    tracks: [TrackInput!]
    title: String
  }

  input TrackInput {
    name: String!
  }

  input SessionInput {
    type: String!
    start: String!
    end: String!
    trackName: String
    group: GroupInput
    room: RoomInput
  }

  input GroupInput {
    name: String!
    rooms: [RoomInput!]!
    description: String
    groupJoinConfig: GroupJoinConfigInput
  }

  input GroupJoinConfigInput {
    minimumParticipantCount: Int!
    title: String!
    description: String!
    subtitle: String
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
`;
