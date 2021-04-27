import { gql } from "@apollo/client";

/** Fragments */
const ROOM_LINK_FRAGMENT_COMPLETE = gql`
  fragment RoomLinkFragmentComplete on RoomLink {
    id
    href
    text
    icon
    linkGroup
  }
`;

const ROOM_FRAGMENT_SHORT = gql`
  fragment RoomFragmentShort on Room {
    id
    name
    description
    joinUrl
    titleUrl
    icon
    roomLinks {
      id
    }
    slackNotification {
      id
      channelId
      notificationInterval
    }
    meetingId
  }
`;

export const ROOM_FRAGMENT_COMPLETE = gql`
  fragment RoomFragmentComplete on Room {
    id
    name
    description
    joinUrl
    titleUrl
    icon
    roomLinks {
      ...RoomLinkFragmentComplete
    }
    slackNotification {
      id
      channelId
      notificationInterval
    }
    meetingId
  }
  ${ROOM_LINK_FRAGMENT_COMPLETE}
`;

export const ROOM_SEARCH_FRAGMENT = gql`
  fragment RoomSearchFragment on Room {
    isInSearch @client
  }
`;

/** Queries */
export const GET_ROOM_LINKS_COMPLETE = gql`
  query getRoomLinks($ids: [ID!]!) {
    getRoomLinks(ids: $ids) {
      ...RoomLinkFragmentComplete
    }
  }
  ${ROOM_LINK_FRAGMENT_COMPLETE}
`;

export const GET_ROOM_SHORT = gql`
  query getRoom($id: ID!) {
    getRoom(id: $id) {
      ...RoomFragmentShort
    }
  }
  ${ROOM_FRAGMENT_SHORT}
`;

export const GET_ROOM_COMPLETE = gql`
  query getRoom($id: ID!) {
    getRoom(id: $id) {
      ...RoomFragmentComplete
    }
  }
  ${ROOM_FRAGMENT_COMPLETE}
`;
