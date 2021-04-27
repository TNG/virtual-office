import { gql } from "@apollo/client";

const PARTICIPANT_FRAGMENT_COMPLETE = gql`
  fragment ParticipantFragmentComplete on Participant {
    id
    username
    email
    imageUrl
  }
`;

const MEETING_FRAGMENT_COMPLETE = gql`
  fragment MeetingFragmentComplete on Meeting {
    id
    participants {
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

export const GET_PARTICIPANTS_IN_MEETING_COMPLETE = gql`
  query getParticipantsInMeeting($id: ID!) {
    getParticipantsInMeeting(id: $id) {
      ...ParticipantFragmentComplete
    }
  }
  ${PARTICIPANT_FRAGMENT_COMPLETE}
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
