import { MeetingParticipant } from "../../server/express/types/MeetingParticipant";
import { MeetingsIndexed } from "./components/MeetingsIndexed";
import { Block, OfficeWithBlocks, Track } from "../../server/express/types/Office";
import { RoomSession, Session } from "../../server/express/types/Session";
import { Room } from "../../server/express/types/Room";
import { cloneDeep } from "lodash";
import {
  BlockApollo,
  GroupApollo,
  ParticipantApollo,
  RoomApollo,
  RoomLinkApollo,
  SessionApollo,
  TrackApollo,
} from "../../server/apollo/TypesApollo";
import { ApolloClient, ApolloQueryResult, NormalizedCacheObject, useQuery } from "@apollo/client";
import { getApolloClient } from "./apollo/ApolloClient";
import {
  GET_BLOCK_SHORT,
  GET_GROUP_SHORT,
  GET_PARTICIPANTS_COMPLETE,
  GET_ROOM_COMPLETE,
  GET_SESSION_SHORT,
} from "./apollo/gqlQueries";

export function participantMatches(search: string, participant: MeetingParticipant): boolean {
  const email = participant.email || "";
  return participant.username.toLowerCase().includes(search) || email.toLowerCase().includes(search);
}

export function search(searchText: string, office: OfficeWithBlocks, meetings: MeetingsIndexed): OfficeWithBlocks {
  const query = searchText.toLowerCase().normalize();
  if (query.length === 0) {
    return office;
  }

  const officeSearched = cloneDeep(office);

  // filter on matching elements only by traversing office hierarchy
  officeSearched.blocks = officeSearched.blocks.map((block: Block) => {
    if (block.type === "GROUP_BLOCK") {
      if (!block.name?.toLowerCase().includes(searchText) && !block.group.name.toLowerCase().includes(searchText)) {
        block.group.rooms = block.group.rooms.filter((room) => roomMatches(room, searchText, meetings));
      }
    } else if (block.type === "SCHEDULE_BLOCK") {
      if (!block.name?.toLowerCase().includes(searchText)) {
        if (block.tracks.some((track: Track) => track.name.toLowerCase().includes(searchText))) {
          block.sessions = block.sessions.filter((session: Session) =>
            session.trackName?.toLowerCase().includes(searchText)
          );
        } else {
          block.sessions = block.sessions.filter((session: Session) => {
            return (
              session.type === "GROUP_SESSION" ||
              (session.type === "ROOM_SESSION" && roomMatches(session.room, searchText, meetings))
            );
          });
          block.sessions.map((session: Session) => {
            if (session.type === "GROUP_SESSION" && !session.group.name.toLowerCase().includes(searchText)) {
              session.group.rooms = session.group.rooms.filter((room) => roomMatches(room, searchText, meetings));
            }
          });
        }
      }
    } else if (block.type === "SESSION_BLOCK") {
      if (!block.name?.toLowerCase().includes(searchText) && !block.title.toLowerCase().includes(searchText)) {
        block.sessions = block.sessions.filter((session: RoomSession) => {
          return roomMatches(session.room, searchText, meetings);
        });
      }
    }
    return block;
  });

  // remove unused group sessions
  officeSearched.blocks = officeSearched.blocks.map((block: Block) => {
    if (block.type === "SCHEDULE_BLOCK") {
      block.sessions = block.sessions.filter(
        (session: Session) => !(session.type === "GROUP_SESSION" && session.group.rooms.length < 1)
      );
    }
    return block;
  });

  // remove unused blocks
  officeSearched.blocks = officeSearched.blocks.filter((block: Block) => {
    if (block.type === "GROUP_BLOCK") {
      return block.group.rooms.length > 0;
    } else if (block.type === "SCHEDULE_BLOCK" || block.type === "SESSION_BLOCK") {
      return block.sessions.length > 0;
    }
  });
  return officeSearched;
}

function roomMatches(room: Room, searchText: string, meetings: MeetingsIndexed): boolean {
  const nameMatches = room.name.toLowerCase().includes(searchText);

  const participants = (room.meetingId && meetings[room.meetingId] && meetings[room.meetingId].participants) || [];
  const someParticipantMatches = participants.some((participant) => participantMatches(searchText, participant));

  return nameMatches || someParticipantMatches;
}

export async function blockMatchesSearch(id: string, searchText: string): Promise<boolean> {
  const apolloClient: ApolloClient<NormalizedCacheObject> = getApolloClient();
  const response = await apolloClient.query({ query: GET_BLOCK_SHORT, variables: { id: id } });
  const block = response.data.getBlock;

  if (propsMatchSearch(getExistingProps([block.name]), searchText)) {
    return true;
  }

  if (block.type === "GROUP_BLOCK") {
    return groupMatchesSearch(block.group.id, searchText);
  } else if (block.type === "SCHEDULE_BLOCK") {
    let anyTrackMatches: boolean = false;
    if (block.tracks) {
      const tracksMatch: boolean[] = await Promise.all(
        block.tracks.map((track: TrackApollo) => trackMatchesSearch(track, searchText))
      );
      anyTrackMatches = tracksMatch.some((matches) => matches);
    }
    const sessionsMatch: boolean[] = await Promise.all(
      block.sessions.map((session: any) => sessionMatchesSearch(session.id, searchText))
    );
    const anySessionMatches: boolean = sessionsMatch.some((matches) => matches);
    return anyTrackMatches || anySessionMatches;
  } else if (block.type === "SESSION_BLOCK") {
    const anyPropMatches: boolean = propsMatchSearch([block.title], searchText);
    const sessionsMatch: boolean[] = await Promise.all(
      block.sessions.map((session: any) => sessionMatchesSearch(session.id, searchText))
    );
    const anySessionMatches: boolean = sessionsMatch.some((matches) => matches);
    return anyPropMatches || anySessionMatches;
  }
  return false;
}

async function groupMatchesSearch(id: string, searchText: string): Promise<boolean> {
  const apolloClient: ApolloClient<NormalizedCacheObject> = getApolloClient();
  const response = await apolloClient.query({ query: GET_GROUP_SHORT, variables: { id: id } });
  const group = response.data.getGroup;
  if (
    propsMatchSearch(
      getExistingProps([
        group.name,
        group.description,
        group.groupJoinConfig?.title,
        group.groupJoinConfig?.subtitle,
        group.groupJoinConfig?.description,
      ]),
      searchText
    )
  ) {
    console.log("Group " + group.name + " returns true due to props");
    return true;
  }
  const roomsMatch: boolean[] = await Promise.all(
    group.rooms.map((room: any) => roomMatchesSearch(room.id, searchText))
  );

  if (roomsMatch.some((matches) => matches)) {
    console.log("Group " + group.name + " returns true due to rooms");
    return true;
  }
  console.log("group " + group.name + " returns false due to rooms");
  return false;
}

export async function roomMatchesSearch(id: string, searchText: string): Promise<boolean> {
  const apolloClient: ApolloClient<NormalizedCacheObject> = getApolloClient();
  const response = await apolloClient.query({ query: GET_ROOM_COMPLETE, variables: { id: id } });
  const room = response.data.getRoom;

  if (propsMatchSearch(getExistingProps([room.name, room.description]), searchText)) {
    console.log("room " + room.name + " matches due to props");
    return true;
  }
  if (room.meetingId) {
    const response = await apolloClient.query({ query: GET_PARTICIPANTS_COMPLETE, variables: { id: room.meetingId } });
    const participants = response.data.getParticipants;
    if (participants.some((participant: ParticipantApollo) => participantMatchesSearch(participant, searchText))) {
      console.log("room " + room.name + " matches due to participants");
      return true;
    }
  }
  console.log("room " + room.name + " matches not after all checks");
  return false;
}

function trackMatchesSearch(track: TrackApollo, searchText: string): boolean {
  return propsMatchSearch([track.name], searchText);
}

export async function sessionMatchesSearch(id: string, searchText: string): Promise<boolean> {
  const apolloClient: ApolloClient<NormalizedCacheObject> = getApolloClient();
  const response = await apolloClient.query({ query: GET_SESSION_SHORT, variables: { id: id } });
  const session = response.data.getSession;

  if (propsMatchSearch(getExistingProps([session.trackName]), searchText)) {
    return true;
  }
  if (session.type === "GROUP_SESSION") {
    return groupMatchesSearch(session.group.id, searchText);
  } else if (session.type === "ROOM_SESSION") {
    return roomMatchesSearch(session.room.id, searchText);
  }
  return false;
}

function participantMatchesSearch(participant: ParticipantApollo, searchText: string): boolean {
  return propsMatchSearch(getExistingProps([participant.username, participant.email]), searchText);
}

function propsMatchSearch(props: string[], searchText: string): boolean {
  return props.some((prop: string) => prop.toLowerCase().includes(searchText.toLowerCase()));
}

function getExistingProps(props: (string | undefined | null)[]): string[] {
  return props.filter((prop: string | undefined | null): prop is string => prop !== undefined && prop !== null);
}
