import axios from "axios";
import { v4 as uuid } from "uuid";

(async function generate() {
  for (let i = 0; i < 200; i++) {
    await axios.post("http://localhost:8080/api/zoomus/webhook", {
      event: "meeting.participant_joined",
      payload: {
        account_id: "abc",
        object: {
          uuid: "uuid",
          id: "1",
          host_id: "abc",
          topic: "My Meeting",
          type: 2,
          start_time: "2019-07-09T17:00:00Z",
          duration: 60,
          timezone: "America/Los_Angeles",
          participant: {
            user_id: "167782044",
            user_name: "s",
            id: uuid(),
            join_time: "2019-07-16T17:13:13Z",
          },
        },
      },
    });
  }
})();
