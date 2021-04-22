import {
  BlockApollo,
  GroupApollo,
  MeetingApollo,
  OfficeApollo,
  ParticipantApollo,
  RoomApollo,
  SessionApollo,
  TrackApollo,
} from "../../server/apollo/TypesApollo";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import {
  BLOCK_SEARCH_FRAGMENT,
  GROUP_SEARCH_FRAGMENT,
  ROOM_SEARCH_FRAGMENT,
  SESSION_SEARCH_FRAGMENT,
} from "./apollo/gqlFragments";

type OfficeApolloClient = OfficeApollo & { __typename: "Office" };
type BlockApolloClient = BlockApollo & { __typename: "Block" | "GroupBlock" | "ScheduleBlock" | "SessionBlock" };
type GroupApolloClient = GroupApollo & { __typename: "Group" };
type TrackApolloClient = TrackApollo & { __typename: "Track" };
type SessionApolloClient = SessionApollo & { __typename: "Session" | "RoomSession" | "GroupSession" };
type RoomApolloClient = RoomApollo & { __typename: "Room" };
type ParticipantApolloClient = ParticipantApollo & { __typename: "Participant" };

type SearchInput = {
  searchObject:
    | OfficeApolloClient
    | BlockApolloClient
    | GroupApolloClient
    | TrackApolloClient
    | SessionApolloClient
    | RoomApolloClient
    | ParticipantApolloClient;
  searchText: string;
  meetings?: MeetingApollo[];
  client?: ApolloClient<NormalizedCacheObject>;
  someParentMatches?: boolean;
};

export function applySearchToOffice(
  office: OfficeApollo,
  meetings: MeetingApollo[],
  searchText: string,
  client: ApolloClient<NormalizedCacheObject>
) {
  office.blocks.map((block: BlockApollo) => {
    blockMatchesSearch({
      searchObject: { __typename: "Block", ...block },
      meetings,
      searchText,
      client,
      someParentMatches: false,
    });
  });
}

function blockMatchesSearch(searchInput: SearchInput): boolean {
  if (
    !(
      searchInput.searchObject.__typename === "Block" ||
      searchInput.searchObject.__typename === "GroupBlock" ||
      searchInput.searchObject.__typename === "ScheduleBlock" ||
      searchInput.searchObject.__typename === "SessionBlock"
    )
  ) {
    return false;
  }
  let { searchObject: block, searchText, meetings, client, someParentMatches } = searchInput;

  let somePropMatches: boolean = propsMatchSearch(getExistingProps([block.name]), searchText);
  someParentMatches = someParentMatches || somePropMatches;
  let groupMatches: boolean = false;
  let someTrackMatches: boolean = false;
  let someSessionMatches: boolean = false;

  if (block.type === "GROUP_BLOCK") {
    groupMatches = groupMatchesSearch({
      searchObject: { __typename: "Group", ...block.group },
      meetings,
      searchText,
      someParentMatches,
      client,
    });
  } else {
    block.sessions.forEach((session: SessionApollo) => {
      someSessionMatches =
        sessionMatchesSearch({
          searchObject: { __typename: "Session", ...session },
          meetings,
          searchText,
          someParentMatches,
          client,
        }) || someSessionMatches;
    });
    if (block.type === "SCHEDULE_BLOCK") {
      block.tracks?.forEach((track: TrackApollo) => {
        someTrackMatches =
          trackMatchesSearch({
            searchObject: { __typename: "Track", ...track },
            searchText,
            someParentMatches,
          }) || someTrackMatches;
      });
    } else if (block.type === "SESSION_BLOCK") {
      somePropMatches = propsMatchSearch([block.title], searchText) || somePropMatches;
      someParentMatches = someParentMatches || somePropMatches;
    }
  }

  const blockMatches: boolean =
    someParentMatches || somePropMatches || groupMatches || someTrackMatches || someSessionMatches;
  client?.writeFragment({
    id: client.cache.identify(block),
    fragment: BLOCK_SEARCH_FRAGMENT,
    data: {
      isInSearch: blockMatches,
    },
  });
  return blockMatches;
}

function groupMatchesSearch(searchInput: SearchInput): boolean {
  if (searchInput.searchObject.__typename !== "Group") {
    return false;
  }
  let { searchObject: group, searchText, meetings, client, someParentMatches } = searchInput;

  const somePropMatches: boolean = propsMatchSearch(
    getExistingProps([
      group.name,
      group.description,
      group.groupJoinConfig?.title,
      group.groupJoinConfig?.subtitle,
      group.groupJoinConfig?.description,
    ]),
    searchText
  );
  someParentMatches = someParentMatches || somePropMatches;
  let someRoomMatches = false;

  group.rooms.forEach((room: RoomApollo) => {
    someRoomMatches =
      roomMatchesSearch({
        searchObject: { __typename: "Room", ...room },
        meetings,
        searchText,
        someParentMatches,
        client,
      }) || someRoomMatches;
  });

  const groupMatches: boolean = someParentMatches || somePropMatches || someRoomMatches;
  client?.writeFragment({
    id: client.cache.identify(group),
    fragment: GROUP_SEARCH_FRAGMENT,
    data: {
      isInSearch: groupMatches,
    },
  });
  return groupMatches;
}

function roomMatchesSearch(searchInput: SearchInput): boolean {
  if (searchInput.searchObject.__typename !== "Room") {
    return false;
  }
  let { searchObject: room, searchText, meetings, client, someParentMatches } = searchInput;

  const somePropMatches: boolean = propsMatchSearch(getExistingProps([room.name, room.description]), searchText);
  someParentMatches = someParentMatches || somePropMatches;
  let someParticipantMatches: boolean = false;

  if (room.meetingId) {
    const meeting: MeetingApollo | undefined = meetings?.find(
      (meeting: MeetingApollo) => meeting.id === room.meetingId
    );
    const participants: ParticipantApollo[] = meeting ? meeting.participants : [];
    participants.forEach((participant: ParticipantApollo) => {
      someParticipantMatches =
        participantMatchesSearch({
          searchObject: { __typename: "Participant", ...participant },
          searchText,
          someParentMatches,
        }) || someParticipantMatches;
    });
  }

  const roomMatches: boolean = someParentMatches || somePropMatches || someParticipantMatches;
  client?.writeFragment({
    id: client.cache.identify(room),
    fragment: ROOM_SEARCH_FRAGMENT,
    data: {
      isInSearch: roomMatches,
    },
  });
  return roomMatches;
}

function trackMatchesSearch(searchInput: SearchInput): boolean {
  if (searchInput.searchObject.__typename !== "Track") {
    return false;
  }
  let { searchObject: track, searchText, someParentMatches } = searchInput;

  const somePropMatches: boolean = propsMatchSearch([track.name], searchText);
  const trackMatches = someParentMatches || somePropMatches;
  return trackMatches;
}

function sessionMatchesSearch(searchInput: SearchInput): boolean {
  if (
    !(
      searchInput.searchObject.__typename === "Session" ||
      searchInput.searchObject.__typename === "RoomSession" ||
      searchInput.searchObject.__typename === "GroupSession"
    )
  ) {
    console.log("early return");
    return false;
  }
  let { searchObject: session, searchText, meetings, client, someParentMatches } = searchInput;

  const somePropMatches: boolean = propsMatchSearch(getExistingProps([session.trackName]), searchText);
  someParentMatches = someParentMatches || somePropMatches;
  let groupMatches: boolean = false;
  let someRoomMatches: boolean = false;

  if (session.type === "GROUP_SESSION") {
    groupMatches = groupMatchesSearch({
      searchObject: { __typename: "Group", ...session.group },
      meetings,
      searchText,
      someParentMatches,
      client,
    });
  } else if (session.type === "ROOM_SESSION") {
    someRoomMatches = roomMatchesSearch({
      searchObject: { __typename: "Room", ...session.room },
      meetings,
      searchText,
      someParentMatches,
      client,
    });
  }

  const sessionMatches: boolean = someParentMatches || somePropMatches || groupMatches || someRoomMatches;
  client?.writeFragment({
    id: client.cache.identify(session),
    fragment: SESSION_SEARCH_FRAGMENT,
    data: {
      isInSearch: sessionMatches,
    },
  });
  return sessionMatches;
}

export function participantMatchesSearch(searchInput: SearchInput): boolean {
  if (searchInput.searchObject.__typename !== "Participant") {
    return false;
  }
  let { searchObject: participant, searchText, someParentMatches } = searchInput;

  const somePropMatches: boolean = propsMatchSearch(
    getExistingProps([participant.username, participant.email]),
    searchText
  );
  const participantMatches: boolean = someParentMatches || somePropMatches;
  return participantMatches;
}

function propsMatchSearch(props: string[], searchText: string): boolean {
  return props.some((prop: string) => prop.toLowerCase().includes(searchText.toLowerCase()));
}

function getExistingProps(props: (string | undefined | null)[]): string[] {
  return props.filter((prop: string | undefined | null): prop is string => prop !== undefined && prop !== null);
}
