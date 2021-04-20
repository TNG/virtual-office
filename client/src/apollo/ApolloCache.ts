import { InMemoryCache, isReference } from "@apollo/client";

export const apolloCache = new InMemoryCache({
  possibleTypes: {
    Block: ["GroupBlock", "ScheduleBlock", "SessionBlock"],
    Session: ["GroupSession", "RoomSession"],
  },
  /*typePolicies: {
    Group: {
      fields: {
        isInSearch: {
          read(existingData, { args, variables, isReference, toReference, readField }) {
            return true;
            /!*console.log(readField("slackNotification", readField("id")));
            return {
              id: readField("id"),
              name: readField("name"),
              description: readField("description"),
              joinUrl: readField("joinUrl"),
              titleUrl: readField("titleUrl"),
              icon: readField("icon"),
              roomLinks: readField("roomLinks"),
              slackNotification: readField(
                "id",
                toReference({ __typename: "SlackNotification", id: slackNotif_id })
              ),
              meetingId: readField("meetingId"),
            };*!/
          },
        },
      },
    },
  },*/
});
