Virtual Office
===============================

Did you ever wonder where your colleague currently is? In what Zoom.us room she/he hides?

Virtual Office tries to give you transparency on what Zoom.us rooms are currently taken and who is currently there.

### Features

* Web UI
* Uses [https://marketplace.zoom.us/docs/guides/tools-resources/webhooks](Zoom.us Webhooks) to give a real-time status update on who currently participates in what Zoom.us room
* Login via Slack

## Configuration

You have to provide configuration parameters to both client & server by environment variables.
As a convenient alternative you can provide them via `.env` files (see `.env-example`) that will be loaded by [dotenv](https://www.npmjs.com/package/dotenv).

See [CONTRIBUTING.md](Contributing) for details.
