export default {
  version: "2",
  blocks: [
    {
      type: "GROUP_BLOCK",
      name: "Group 1",
      group: {
        name: "Büros",
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
      name: "Group 2",
      group: {
        name: "Kaffeeküchen",
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
    {
      type: "SCHEDULE_BLOCK",
      name: "Schedule 1",
      tracks: [
        {
          name: "Frogstar",
        },
        {
          name: "Unterwelt",
        },
      ],
      sessions: [
        {
          type: "ROOM_SESSION",
          start: "09:00",
          end: "09:45",
          room: {
            name: "async/await",
            meeting: {
              meetingId: "804262732",
              participants: [],
            },
            subtitle:
              "[Jan Gosmann] \n\nÜber die letzten Jahre haben zunehmend mehr Programmiersprachen (C#, Python, JavaScript, Rust, ...) eine neue Syntax für asynchrone Programmierung eingeführt: async/await. Was ist der Unterschied zu anderen Methoden nebenläufiger Programmierung? Wofür eignet sich async/await besonders? Warum ist es so populär? Was passiert eigentlich im Hintergrund?",
            joinUrl: "https://zoom.us/j/804262732?pwd=Y0VWMkI0djhOa29OamMxRkdYOFc4Zz09",
            roomLinks: [
              {
                href: "https://tngtech.slack.com/archives/CL78CL86N",
                text: "#td-unterwelt-live",
                icon: "https://cdn.iconscout.com/icon/free/png-256/slack-1425877-1205068.png",
              },
            ],
          },
          trackName: "Unterwelt",
        },
        {
          type: "ROOM_SESSION",
          start: "17:15",
          end: "17:45",
          room: {
            name: "Curriculum: Architektur & Patterns",
            meeting: {
              meetingId: "277324357",
              participants: [],
            },
            subtitle:
              '[curriculum-architecture@tngtech.com, Michael Echerer] \n\nJede Software hat eine Architektur! - Hoffentlich passend für den Kontext statt zufällig entstanden.Nicht jeder Entwickler nennt sich Architekt, aber jeder im Team gestaltet die Softwarearchitektur mit. Grund genug zu wissen, worum es geht und wieso Architekturarbeit und -dokumentation wichtig ist bzw. nicht vernachlässigt werden darf.\n\nSogenannte Patterns helfen dabei die Architektur im Großen zu gestalten und auch auf Sourcecode-Ebene sauber zu halten. Sie dienen überdies auch der Kommunikation zwischen Entwicklern.\n\nWer bisher nur "programmiert" hat, lernt wichtige Aspekte kennen, um ein Software-Entwickler zu werden und was es bedeutet für die Architektur einen Teil der Mitverantwortung früh zu übernehmen.',
            joinUrl: "https://zoom.us/j/277324357?pwd=bHV5Nm8walVaMUNmb1AvRk53YU9oQT09",
            roomLinks: [
              {
                href: "https://tngtech.slack.com/archives/CLLG504A3",
                text: "#td-frogstar-live",
                icon: "https://cdn.iconscout.com/icon/free/png-256/slack-1425877-1205068.png",
              },
            ],
          },
          trackName: "Frogstar",
        },
        {
          type: "ROOM_SESSION",
          start: "13:00",
          end: "13:30",
          room: {
            name: "Aktuelle halbe Stunde",
            meeting: {
              meetingId: "690987970",
              participants: [],
            },
            subtitle: "",
            joinUrl: "https://zoom.us/j/690987970?pwd=dUlacThRY1NjSmZXVXdoYkg1TExvQT09",
            links: [
              {
                href: "https://tngtech.slack.com/archives/CL78AK9DG",
                text: "#ahs-live",
                icon: "https://cdn.iconscout.com/icon/free/png-256/slack-1425877-1205068.png",
              },
            ],
          },
        },

        {
          type: "GROUP_SESSION",
          start: "10:00",
          end: "12:00",
          group: {
            name: "Workshops",
            description: "description",
            rooms: [
              {
                name: "WS Power Napping",
                meeting: {
                  meetingId: "9999999991",
                  participants: [],
                },
                joinUrl: "https://zoom.us/j/6140140408?pwd=VlhaV3J0Ukg5aTEwZEV0OFJiNDRRQT09",
                roomLinks: [
                  {
                    href: "https://tngtech.slack.com/archives/C011LJN92FP",
                    text: "#workshop",
                    icon: "https://cdn.iconscout.com/icon/free/png-256/slack-1425877-1205068.png",
                  },
                ],
                icon:
                  "https://www.flaticon.com/svg/vstatic/svg/2849/2849198.svg?token=exp=1614345002~hmac=dcbbc9f0384175295024016f343097da",
                slackNotification: {
                  channelId: "C011LJN92FP",
                },
              },
              {
                name: "WS Cooking",
                meeting: {
                  meetingId: "9999999992",
                  participants: [],
                },
                joinUrl: "https://zoom.us/j/6140140408?pwd=VlhaV3J0Ukg5aTEwZEV0OFJiNDRRQT09",
                roomLinks: [
                  {
                    href: "https://tngtech.slack.com/archives/C011LJN92FP",
                    text: "#workshop",
                    icon: "https://cdn.iconscout.com/icon/free/png-256/slack-1425877-1205068.png",
                  },
                ],
                icon:
                  "https://www.flaticon.com/svg/vstatic/svg/2849/2849198.svg?token=exp=1614345002~hmac=dcbbc9f0384175295024016f343097da",
                slackNotification: {
                  channelId: "C011LJN92FP",
                },
              },
              {
                name: "WS Swimming",
                meeting: {
                  meetingId: "9999999993",
                  participants: [],
                },
                joinUrl: "https://zoom.us/j/6140140408?pwd=VlhaV3J0Ukg5aTEwZEV0OFJiNDRRQT09",
                roomLinks: [
                  {
                    href: "https://tngtech.slack.com/archives/C011LJN92FP",
                    text: "#workshop",
                    icon: "https://cdn.iconscout.com/icon/free/png-256/slack-1425877-1205068.png",
                  },
                ],
                icon:
                  "https://www.flaticon.com/svg/vstatic/svg/2849/2849198.svg?token=exp=1614345002~hmac=dcbbc9f0384175295024016f343097da",
                slackNotification: {
                  channelId: "C011LJN92FP",
                },
              },
            ],
          },
        },
      ],
    },
  ],
};
