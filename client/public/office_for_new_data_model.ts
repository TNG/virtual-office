export default {
  version: "2",
  blocks: [
    {
      type: "GROUP_BLOCK",
      name: "Block 1",
      group: {
        name: "group1",
        rooms: [
          {
            name: "P&E-Zoom",
            meeting: {
              meetingId: "91905545648",
              participants: [],
            },
            joinUrl: "https://zoom.us/j/91905545648?pwd=azM4Q3NHd0JwdWN0VVJOZ3orTWk3QT09",
            icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/people-events/Assistance.jpg",
          },
          {
            name: "Geonosis",
            meeting: {
              meetingId: "",
              participants: [],
            },
            joinUrl: "https://zoom.us/j/946906589?pwd=ZnFibnAvOHdGNDVBWCtyZXZuazdhUT09",
            icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/people-events/Geonosis.jpg",
          },
          {
            name: "Tatooine",
            meeting: {
              meetingId: "95884899984",
              participants: [],
            },
            joinUrl: "https://zoom.us/j/95884899984?pwd=WEFYeFV6aVpUK1RSTUhLd3JZMEFSdz09",
            icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/people-events/Tatooine.jpg",
          },
          {
            name: "Alderaan",
            meeting: {
              meetingId: "96403812995",
              participants: [],
            },
            joinUrl: "https://zoom.us/j/96403812995?pwd=TVFmc29SdDBhTThST1gzenp2U1NCZz09",
            icon: "https://i.imgur.com/Gx0gvFV.jpg",
          },
        ],
      },
    },
    {
      type: "GROUP_BLOCK",
      name: "Block 2",
      group: {
        name: "group2",
        rooms: [
          {
            name: "Kaffeeküche 1",
            meeting: {
              meetingId: "96827182012",
              participants: [],
            },
            joinUrl: "https://zoom.us/j/96827182012?pwd=UXZTeC9oaDN0cWZUSDBUMmF3YjlpZz09",
            icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/people-events/Kaffeek%C3%BCche.jpg",
          },
          {
            name: "Kaffeeküche 2",
            meeting: {
              meetingId: "97652607410",
              participants: [],
            },
            joinUrl: "https://zoom.us/j/97652607410?pwd=RDZpUDRQa0ZVYm9OTVd5ejJaRzEyUT09",
            icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/people-events/Kaffeek%C3%BCche.jpg",
          },
        ],
        groupJoinConfig: {
          minimumParticipantCount: 3,
          title: "Kaffeeküchen",
          description: "Einer zufälligen Kaffeeküche beitreten.",
        },
      },
    },
  ],
};
