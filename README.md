Virtual Office
===============================

Did you ever wonder where your colleague currently is? In what Zoom.us room she/he hides?

Virtual Office tries to give you transparency on what Zoom.us rooms are occupied and who is currently there.

### Features

* Web UI
* Uses [Zoom.us Webhooks](https://marketplace.zoom.us/docs/guides/tools-resources/webhooks) to give a real-time status update on who currently participates in what Zoom.us room
* Login via Slack

### Installation

0. Checkout the repository. \
`git clone https://github.com/TNG/virtual-office`

0. Install all dependencies and generate the runnable binary. \
`npm installAll && npm buildAll`

0. Create a new Slack App, as currently the only authentication option is Slack (https://api.slack.com/apps). You will need the OAuth Client ID and the OAuth Client Secret afterwards.

0. Adapt the configuration. Here you have two options - either you configure the app via a .env file or you provide the configuration via environment variables.\
You can find sample environment variables in `server/.env-example`.

    * via .env file: Copy `server/.env-example` to `.server.env`, adapt the content. All entries will be available to the app as environment variables.
    * set the environment variables manually, i.e. for using it via some deployment plan in a CI server.

0. Configure the Zoom.us webhooks

    * Navigate to the [Zoom.us Marketplace](https://marketplace.zoom.us/)
    * Click `Manage` and create a new webhook application
    * Fill out the usual information, go to `Feature` and enable `Event Subscriptions`, add a new subscription with
        * Events:
            * End Meeting
            * Participant/Host joined meeting
            * Participant/Host left meeting
        * Notification endpoint URL: \
            `${YOUR_BASE_URL_COMES_HERE}/api/zoomus/webhook`


0. Start the application using `cd server && npm start`

#### Available Environment Variables

| Variable name         | Usage
| --------------------  |:----------------
| `PORT`                | Port the app is running on, defaults to 8080
| `SLACK_CLIENT_ID`     | The OAuth client id you got when creating the Slack application
| `SLACK_SECRET`        | The OAuth secret you got when creating the Slack application
| `CONFIG`              | A office config
| `CONFIG_LOCATION`     | A file system location to the office configuration, either absolute or relative to the application root directory
| `SESSION_SECRET`      | Secret that is used to encrypt cookies that are stored on client side. If you omit this option, a new secret will be generated on each server start (meaning that users will have to re-login after each server restart!)
| `ADMIN_USERNAME`      | Username for accessing admin endpoints
| `ADMIN_PASSWORD`      | Password for accessing admin endpoints

#### Office Configuration

You can find an example office definition in `server/office.json`.

An example looks like this:

```json
{
  "groups": [
    {
      "id": "star_wars",
      "name": "Star Wars",
      "groupJoin": {
        "minimumParticipantCount": 3
      },
      "disabledBefore": "2020-05-29T17:15:00.000+02:00",
      "disabledAfter": "2020-05-29T19:00:00.000+02:00"
    }
  ],
  "rooms": [
    {
      "meetingId": "1",
      "name": "Lobby",
      "subtitle": "This is whery everything starts.",
      "joinUrl": "https://zoom.us/j/1",
      "links": [
        {
          "href": "http://www.google.de",
          "text": "Google",
          "icon": "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
        }
      ],
      "icon": "https://cdn.pixabay.com/photo/2015/11/03/09/03/meeting-1019995_960_720.jpg"
    },
    {
      "meetingId": "2",
      "name": "Alderaan",
      "joinUrl": "https://zoom.us/j/2",
      "links": [
        {
          "href": "https://www.atlassian.com",
          "text": "Issue Tracker",
          "icon": "https://pbs.twimg.com/profile_images/1026572523230515200/Qifq4jpS_400x400.jpg"
        },
        {
          "href": "http://www.miro.com",
          "text": "Whiteboard",
          "icon": "https://avatars.slack-edge.com/2019-03-07/570928183895_30458630978ac1eccde9_512.png"
        }
      ],
      "groupId": "star_wars",
      "icon": "https://cdn.pixabay.com/photo/2015/11/03/09/03/meeting-1019995_960_720.jpg"
    }
  ]
}
```
**Important:**
For the Zoom.us webhooks to work, the room id has to be the zoom.us meeting ID, as this id acts as correlation id for webhook events from zoom.

`groupJoin` within the `groups` property is optional and defines whether existing rooms will be filled up by a separate
join button on the group.

#### Admin Endpoints

You can view all available endpoints at `/api-docs`.

### Development

You have to provide configuration parameters to both client & server by environment variables.
As a convenient alternative you can provide them via `.env` files (see `.env-example`) that will be loaded by [dotenv](https://www.npmjs.com/package/dotenv).

See [Contributing](CONTRIBUTING.md) for details.
