const { gql } = require("apollo-server-express");

export const typeDefsInputTypes = gql`
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
