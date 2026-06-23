import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@material-ui/styles";
import theme from "../theme";
import Login from "./Login";

jest.mock("axios", () => ({
  get: jest.fn(),
}));

const mockedAxios = jest.requireMock("axios");

const defaultConfig = {
  backgroundUrl: "",
  viewMode: "grid" as const,
  theme: "dark" as const,
  timezone: "UTC",
  sessionStartMinutesOffset: 0,
};

beforeEach(() => {
  mockedAxios.get.mockResolvedValue({ data: defaultConfig });
});

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme(defaultConfig)}>{ui}</ThemeProvider>);

describe("Login", () => {
  it("renders Virtual Office heading", async () => {
    renderWithTheme(<Login />);
    await waitFor(() => {
      expect(screen.getByText("Virtual Office")).toBeInTheDocument();
    });
  });

  it("renders Sign in with Slack button image", async () => {
    renderWithTheme(<Login />);
    await waitFor(() => {
      expect(screen.getByAltText("Sign in with Slack")).toBeInTheDocument();
    });
  });
});
