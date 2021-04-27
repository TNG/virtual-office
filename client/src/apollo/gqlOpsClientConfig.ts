import { gql } from "@apollo/client";

const CLIENT_CONFIG_FRAGMENT_COMPLETE = gql`
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

export const GET_CLIENT_CONFIG_COMPLETE = gql`
  query getClientConfig {
    getClientConfig {
      ...ClientConfigFragmentComplete
    }
  }
  ${CLIENT_CONFIG_FRAGMENT_COMPLETE}
`;
