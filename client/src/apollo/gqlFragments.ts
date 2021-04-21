import { gql } from "@apollo/client/core";

export const ROOM_LINK_FRAGMENT_COMPLETE = gql`
  fragment RoomLinkFragmentComplete on RoomLink {
    id
    href
    text
    icon
    linkGroup
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

export const ROOM_FRAGMENT_SHORT = gql`
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

export const ROOM_SEARCH_FRAGMENT = gql`
  fragment RoomSearchFragment on Room {
    isInSearch @client
  }
`;

export const GROUP_JOIN_CONFIG_FRAGMENT_COMPLETE = gql`
  fragment GroupJoinConfigFragmentComplete on GroupJoinConfig {
    id
    minimumParticipantCount
    title
    description
    subtitle
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

export const GROUP_FRAGMENT_SHORT = gql`
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

export const GROUP_SEARCH_FRAGMENT = gql`
  fragment GroupSearchFragment on Group {
    isInSearch @client
  }
`;

export const SESSION_FRAGMENT_COMPLETE = gql`
  fragment SessionFragmentComplete on Session {
    id
    type
    start
    end
    trackName
    ... on GroupSession {
      group {
        ...GroupFragmentComplete
      }
    }
    ... on RoomSession {
      room {
        ...RoomFragmentComplete
      }
    }
  }
  ${GROUP_FRAGMENT_COMPLETE}
  ${ROOM_FRAGMENT_COMPLETE}
`;

export const SESSION_FRAGMENT_SHORT = gql`
  fragment SessionFragmentShort on Session {
    id
    type
    start
    end
    trackName
    isInSearch @client
    ... on GroupSession {
      group {
        id
      }
    }
    ... on RoomSession {
      room {
        id
      }
    }
  }
`;

export const SESSION_SEARCH_FRAGMENT = gql`
  fragment SessionSearchFragment on Session {
    isInSearch @client
  }
`;

export const BLOCK_FRAGMENT_COMPLETE = gql`
  fragment BlockFragmentComplete on Block {
    id
    type
    name
    ... on GroupBlock {
      group {
        ...GroupFragmentComplete
      }
    }
    ... on ScheduleBlock {
      sessions {
        ...SessionFragmentComplete
      }
      tracks {
        id
        name
      }
    }
    ... on SessionBlock {
      title
      sessions {
        ...SessionFragmentComplete
      }
    }
  }
  ${GROUP_FRAGMENT_COMPLETE}
  ${SESSION_FRAGMENT_COMPLETE}
`;

export const BLOCK_FRAGMENT_SHORT = gql`
  fragment BlockFragmentShort on Block {
    id
    type
    name
    ... on GroupBlock {
      group {
        id
        isInSearch @client
      }
    }
    ... on ScheduleBlock {
      sessions {
        ...SessionFragmentShort
      }
      tracks {
        id
        name
      }
    }
    ... on SessionBlock {
      title
      sessions {
        ...SessionFragmentShort
      }
    }
  }
  ${SESSION_FRAGMENT_SHORT}
`;

export const BLOCK_SEARCH_FRAGMENT = gql`
  fragment BlockSearchFragment on Block {
    isInSearch @client
  }
`;

export const OFFICE_FRAGMENT_SHORT = gql`
  fragment OfficeFragmentShort on Office {
    id
    version
    blocks {
      id
      isInSearch @client
    }
  }
`;

export const PARTICIPANT_FRAGMENT_COMPLETE = gql`
  fragment ParticipantFragmentComplete on Participant {
    id
    username
    email
    imageUrl
  }
`;

export const MEETING_FRAGMENT_COMPLETE = gql`
  fragment MeetingFragmentComplete on Meeting {
    id
    participants {
      ...ParticipantFragmentComplete
    }
  }
  ${PARTICIPANT_FRAGMENT_COMPLETE}
`;

export const CLIENT_CONFIG_FRAGMENT_COMPLETE = gql`
  fragment ClientConfigFragmentComplete on ClientConfig {
    id
    viewMode
    theme
    sessionStartMinutesOffset
    backgroundUrl
    timezone
    title
    logoUrl
    faviconUrl
    hideEndedSessions
  }
`;
