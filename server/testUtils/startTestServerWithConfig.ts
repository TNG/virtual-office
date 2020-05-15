import { ConfigOptions } from "../express/types/ConfigOptions";
import { Container } from "typedi";
import { ExpressApp } from "../express/ExpressApp";
import { Express } from "express";
import request from "supertest";
import { ZoomUsEvent } from "../express/routes/ZoomUsWebHookRoute";
import { MeetingParticipant } from "../express/types/MeetingParticipant";

export class TestServer {
  constructor(private readonly app: Express) {}

  async getParticipantIds(meetingId: string) {
    const response = await request(this.app).get(`/api/meeting/${meetingId}/participants`).expect(200);
    const body = response.body as MeetingParticipant[];
    return body.map((participant) => participant.id);
  }

  async sendMeetingEvent(event: ZoomUsEvent) {
    await request(this.app).post("/api/zoomus/webhook").send(event).expect(200);
  }

  async joinGroup(groupId: string): Promise<string> {
    const joinResponse = await request(this.app)
      .get(`/api/groups/${groupId}/join`)
      .set("Connection", "keep-alive")
      .timeout(10_000)
      .expect((response) => {
        expect(response.status).toEqual(302);
      });
    const redirectLocation = joinResponse.header.location;
    return redirectLocation.split("/").slice(-1)[0];
  }
}

export async function startTestServerWithConfig(config: ConfigOptions): Promise<TestServer> {
  process.env.SLACK_SECRET = "abc";
  process.env.SLACK_CLIENT_ID = "abc";
  process.env.SLACK_CALLBACK_URL = "http://localhost";
  process.env.DISABLE_AUTH_ON_API = "true";
  process.env.CONFIG = JSON.stringify(config);

  const expressApp = Container.get(ExpressApp);
  return new TestServer(await expressApp.create());
}
