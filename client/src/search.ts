import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { Block, Track } from "../../server/types/Block";
import { Group } from "../../server/types/Group";
import { Session } from "../../server/types/Session";
import { Room } from "../../server/types/Room";
import { Meeting, Participant } from "../../server/types/Meeting";
import { OfficeWithBlocks } from "../../server/types/OfficeWithBlocks";
import { BLOCK_SEARCH_FRAGMENT } from "./apollo/gqlOpsBlock";
import { GROUP_SEARCH_FRAGMENT } from "./apollo/gqlOpsGroup";
import { SESSION_SEARCH_FRAGMENT } from "./apollo/gqlOpsSession";
import { ROOM_SEARCH_FRAGMENT } from "./apollo/gqlOpsRoom";

type OfficeWithBlocksClient = OfficeWithBlocks & { __typename: "Office" };
type BlockClient = Block & { __typename: "Block" | "GroupBlock" | "ScheduleBlock" | "SessionBlock" };
type GroupClient = Group & { __typename: "Group" };
type TrackClient = Track & { __typename: "Track" };
type SessionClient = Session & { __typename: "Session" | "RoomSession" | "GroupSession" };
type RoomClient = Room & { __typename: "Room" };
type ParticipantClient = Participant & { __typename: "Participant" };

type SearchInput = {
  searchObject:
    | OfficeWithBlocksClient
    | BlockClient
    | GroupClient
    | TrackClient
    | SessionClient
    | RoomClient
    | ParticipantClient;
  searchText: string;
  meetings?: Meeting[];
  client?: ApolloClient<NormalizedCacheObject>;
  someParentMatches?: boolean;
};

export function applySearchToOffice(
  office: OfficeWithBlocks,
  meetings: Meeting[],
  searchText: string,
  client: ApolloClient<NormalizedCacheObject>
) {
  office.blocks.map((block: Block) => {
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
    block.sessions.forEach((session: Session) => {
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
      block.tracks?.forEach((track: Track) => {
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

  group.rooms.forEach((room: Room) => {
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
    const meeting: Meeting | undefined = meetings?.find((meeting: Meeting) => meeting.id === room.meetingId);
    const participants: Participant[] = meeting ? meeting.participants : [];
    participants.forEach((participant: Participant) => {
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
