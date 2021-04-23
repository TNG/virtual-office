import { gql } from "@apollo/client";
import {
  BLOCK_FRAGMENT_COMPLETE,
  BLOCK_FRAGMENT_SHORT,
  CLIENT_CONFIG_FRAGMENT_COMPLETE,
  GROUP_FRAGMENT_COMPLETE,
  GROUP_FRAGMENT_SHORT,
  GROUP_JOIN_CONFIG_FRAGMENT_COMPLETE,
  MEETING_FRAGMENT_COMPLETE,
  OFFICE_FRAGMENT_SHORT,
  PARTICIPANT_FRAGMENT_COMPLETE,
  ROOM_FRAGMENT_COMPLETE,
  ROOM_FRAGMENT_SHORT,
  ROOM_LINK_FRAGMENT_COMPLETE,
  SESSION_FRAGMENT_SHORT,
} from "./gqlFragments";

export const GET_ROOM_LINKS_COMPLETE = gql`
  query getRoomLinks($ids: [ID!]!) {
    getRoomLinks(ids: $ids) {
      ...RoomLinkFragmentComplete
    }
  }
  ${ROOM_LINK_FRAGMENT_COMPLETE}
`;

export const GET_ROOM_COMPLETE = gql`
  query getRoom($id: ID!) {
    getRoom(id: $id) {
      ...RoomFragmentComplete
    }
  }
  ${ROOM_FRAGMENT_COMPLETE}
`;

export const GET_ROOM_SHORT = gql`
  query getRoom($id: ID!) {
    getRoom(id: $id) {
      ...RoomFragmentShort
    }
  }
  ${ROOM_FRAGMENT_SHORT}
`;

export const GET_GROUP_JOIN_CONFIG_COMPLETE = gql`
  query getGroupJoinConfig($id: ID!) {
    getGroupJoinConfig(id: $id) {
      ...GroupJoinConfigFragmentComplete
    }
  }
  ${GROUP_JOIN_CONFIG_FRAGMENT_COMPLETE}
`;

export const GET_GROUP_SHORT = gql`
  query getGroup($id: ID!) {
    getGroup(id: $id) {
      ...GroupFragmentShort
    }
  }
  ${GROUP_FRAGMENT_SHORT}
`;

export const GET_BLOCK_SHORT = gql`
  query getBlock($id: ID!) {
    getBlock(id: $id) {
      ...BlockFragmentShort
    }
  }
  ${BLOCK_FRAGMENT_SHORT}
`;

export const GET_SESSION_SHORT = gql`
  query getSession($id: ID!) {
    getSession(id: $id) {
      ...SessionFragmentShort
    }
  }
  ${SESSION_FRAGMENT_SHORT}
`;

export const GET_OFFICE_COMPLETE = gql`
  query getOffice {
    getOffice {
      id
      version
      blocks {
        ...BlockFragmentComplete
      }
    }
  }
  ${BLOCK_FRAGMENT_COMPLETE}
`;

export const GET_OFFICE_SHORT = gql`
  query getOffice {
    getOffice {
      ...OfficeFragmentShort
    }
  }
  ${OFFICE_FRAGMENT_SHORT}
`;

export const GET_PARTICIPANTS_IN_MEETING_COMPLETE = gql`
  query getParticipantsInMeeting($id: ID!) {
    getParticipantsInMeeting(id: $id) {
      ...ParticipantFragmentComplete
    }
  }
  ${PARTICIPANT_FRAGMENT_COMPLETE}
`;

export const GET_ALL_MEETINGS_COMPLETE = gql`
  query getAllMeetings {
    getAllMeetings {
      ...MeetingFragmentComplete
    }
  }
  ${MEETING_FRAGMENT_COMPLETE}
`;

export const PARTICIPANT_MUTATED_SUBSCRIPTION = gql`
  subscription participantMutated {
    participantMutated {
      mutationType
      participant {
        ...ParticipantFragmentComplete
      }
      meetingId
    }
  }
  ${PARTICIPANT_FRAGMENT_COMPLETE}
`;

export const ROOM_IN_GROUP_MUTATED_SUBSCRIPTION = gql`
  subscription roomInGroupMutated {
    roomInGroupMutated {
      mutationType
      group {
        ...GroupFragmentComplete
      }
    }
  }
  ${GROUP_FRAGMENT_COMPLETE}
`;

export const GET_CLIENT_CONFIG_COMPLETE = gql`
  query getClientConfig {
    getClientConfig {
      ...ClientConfigFragmentComplete
    }
  }
  ${CLIENT_CONFIG_FRAGMENT_COMPLETE}
`;
