/**
 * @jest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import RoomCard from "./RoomCard";
import { Room } from "../../../server/express/types/Room";
import { MeetingParticipant } from "../../../server/express/types/MeetingParticipant";

jest.mock("./RoomParticipants", () => () => null);
jest.mock("./RoomLinks", () => () => null);

const theme = createMuiTheme();

const baseRoom: Room = {
  roomId: "room-1",
  name: "Test Room",
};

function renderCard(overrides: Partial<Parameters<typeof RoomCard>[0]> = {}) {
  const props = {
    room: baseRoom,
    participants: [] as MeetingParticipant[],
    isDisabled: false,
    isJoinable: false,
    isListMode: false,
    ...overrides,
  };
  return render(
    <ThemeProvider theme={theme}>
      <RoomCard {...props} />
    </ThemeProvider>
  );
}

describe("RoomCard", () => {
  it("renders the room name", () => {
    const { getByText } = renderCard({ room: { ...baseRoom, name: "Standup" } });
    expect(getByText("Standup")).toBeInTheDocument();
  });

  it("renders Join button when joinable and joinUrl present", () => {
    const { getByText } = renderCard({
      room: { ...baseRoom, joinUrl: "https://zoom.us/j/123", meetingId: "m1" },
      isJoinable: true,
    });
    expect(getByText("Join")).toBeInTheDocument();
  });

  it("does not render Join button when not joinable", () => {
    const { queryByText } = renderCard({
      room: { ...baseRoom, joinUrl: "https://zoom.us/j/123", meetingId: "m1" },
      isJoinable: false,
    });
    expect(queryByText("Join")).not.toBeInTheDocument();
  });
});
