import { MeetingParticipant } from "../../server/express/types/MeetingParticipant";
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

export function participantMatches(search: string, participant: MeetingParticipant): boolean {
  const email = participant.email || "";
  return participant.username.toLowerCase().includes(search) || email.toLowerCase().includes(search);
}

export function applySearchToOffice(
  office: OfficeApollo,
  meetings: MeetingApollo[],
  searchText: string,
  client: ApolloClient<NormalizedCacheObject>
) {
  office.blocks.map((block: BlockApollo) => {
    blockMatchesSearch(block, meetings, searchText, client, false);
  });
}

function blockMatchesSearch(
  block: BlockApollo,
  meetings: MeetingApollo[],
  searchText: string,
  client: ApolloClient<NormalizedCacheObject>,
  someParentMatches: boolean
): boolean {
  let somePropMatches: boolean = propsMatchSearch(getExistingProps([block.name]), searchText);
  someParentMatches = someParentMatches || somePropMatches;
  let groupMatches: boolean = false;
  let someTrackMatches: boolean = false;
  let someSessionMatches: boolean = false;

  if (block.type === "GROUP_BLOCK") {
    groupMatches = groupMatchesSearch(block.group, meetings, searchText, someParentMatches, client);
  } else {
    block.sessions.forEach((session: SessionApollo) => {
      someSessionMatches =
        sessionMatchesSearch(session, meetings, searchText, someParentMatches, client) || someSessionMatches;
    });
    if (block.type === "SCHEDULE_BLOCK") {
      block.tracks?.forEach((track: TrackApollo) => {
        someTrackMatches = trackMatchesSearch(track, searchText, someParentMatches) || someTrackMatches;
      });
    } else if (block.type === "SESSION_BLOCK") {
      somePropMatches = propsMatchSearch([block.title], searchText) || somePropMatches;
      someParentMatches = someParentMatches || somePropMatches;
    }
  }

  const blockMatches: boolean =
    someParentMatches || somePropMatches || groupMatches || someTrackMatches || someSessionMatches;
  client.writeFragment({
    id: client.cache.identify(block),
    fragment: BLOCK_SEARCH_FRAGMENT,
    data: {
      isInSearch: blockMatches,
    },
  });
  return blockMatches;
}

function groupMatchesSearch(
  group: GroupApollo,
  meetings: MeetingApollo[],
  searchText: string,
  someParentMatches: boolean,
  client: ApolloClient<NormalizedCacheObject>
): boolean {
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
    someRoomMatches = roomMatchesSearch(room, meetings, searchText, someParentMatches, client) || someRoomMatches;
  });

  const groupMatches: boolean = someParentMatches || somePropMatches || someRoomMatches;
  client.writeFragment({
    id: client.cache.identify(group),
    fragment: GROUP_SEARCH_FRAGMENT,
    data: {
      isInSearch: groupMatches,
    },
  });
  return groupMatches;
}

function roomMatchesSearch(
  room: RoomApollo,
  meetings: MeetingApollo[],
  searchText: string,
  someParentMatches: boolean,
  client: ApolloClient<NormalizedCacheObject>
): boolean {
  const somePropMatches: boolean = propsMatchSearch(getExistingProps([room.name, room.description]), searchText);
  someParentMatches = someParentMatches || somePropMatches;
  let someParticipantMatches: boolean = false;

  if (room.meetingId) {
    const meeting: MeetingApollo | undefined = meetings.find((meeting: MeetingApollo) => meeting.id === room.meetingId);
    const participants: ParticipantApollo[] = meeting ? meeting.participants : [];
    participants.forEach((participant: ParticipantApollo) => {
      someParticipantMatches =
        participantMatchesSearch(participant, searchText, someParentMatches) || someParticipantMatches;
    });
  }

  const roomMatches: boolean = someParentMatches || somePropMatches || someParticipantMatches;
  client.writeFragment({
    id: client.cache.identify(room),
    fragment: ROOM_SEARCH_FRAGMENT,
    data: {
      isInSearch: roomMatches,
    },
  });
  return roomMatches;
}

function trackMatchesSearch(track: TrackApollo, searchText: string, someParentMatches: boolean): boolean {
  const somePropMatches: boolean = propsMatchSearch([track.name], searchText);
  const trackMatches = someParentMatches || somePropMatches;
  return trackMatches;
}

function sessionMatchesSearch(
  session: SessionApollo,
  meetings: MeetingApollo[],
  searchText: string,
  someParentMatches: boolean,
  client: ApolloClient<NormalizedCacheObject>
): boolean {
  const somePropMatches: boolean = propsMatchSearch(getExistingProps([session.trackName]), searchText);
  someParentMatches = someParentMatches || somePropMatches;
  let groupMatches: boolean = false;
  let someRoomMatches: boolean = false;

  if (session.type === "GROUP_SESSION") {
    groupMatches = groupMatchesSearch(session.group, meetings, searchText, someParentMatches, client);
  } else if (session.type === "ROOM_SESSION") {
    someRoomMatches = roomMatchesSearch(session.room, meetings, searchText, someParentMatches, client);
  }

  const sessionMatches: boolean = someParentMatches || somePropMatches || groupMatches || someRoomMatches;
  client.writeFragment({
    id: client.cache.identify(session),
    fragment: SESSION_SEARCH_FRAGMENT,
    data: {
      isInSearch: sessionMatches,
    },
  });
  return sessionMatches;
}

export function participantMatchesSearch(
  participant: ParticipantApollo,
  searchText: string,
  someParentMatches?: boolean
): boolean {
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
