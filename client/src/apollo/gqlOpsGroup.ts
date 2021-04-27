import { gql } from "@apollo/client";
import { ROOM_FRAGMENT_COMPLETE } from "./gqlOpsRoom";

/** Fragments */
const GROUP_JOIN_CONFIG_FRAGMENT_COMPLETE = gql`
  fragment GroupJoinConfigFragmentComplete on GroupJoinConfig {
    id
    minimumParticipantCount
    title
    description
    subtitle
  }
`;

const GROUP_FRAGMENT_SHORT = gql`
  fragment GroupFragmentShort on Group {
    id
    name
    rooms {
      id
      meetingId
      isInSearch @client
    }
    description
    groupJoinConfig {
      id
    }
  }
`;

export const GROUP_FRAGMENT_COMPLETE = gql`
  fragment GroupFragmentComplete on Group {
    id
    name
    rooms {
      ...RoomFragmentComplete
    }
    description
    groupJoinConfig {
      ...GroupJoinConfigFragmentComplete
    }
  }
  ${ROOM_FRAGMENT_COMPLETE}
  ${GROUP_JOIN_CONFIG_FRAGMENT_COMPLETE}
`;

export const GROUP_SEARCH_FRAGMENT = gql`
  fragment GroupSearchFragment on Group {
    isInSearch @client
  }
`;

/** Fragments */
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

/** Subscriptions */
export const ROOM_IN_GROUP_MUTATED_SUBSCRIPTION = gql`
  subscription roomInGroupMutated($groupId: ID!) {
    roomInGroupMutated(groupId: $groupId) {
      mutationType
      room {
        ...RoomFragmentComplete
      }
      groupId
    }
  }
  ${ROOM_FRAGMENT_COMPLETE}
`;
