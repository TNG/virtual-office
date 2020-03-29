import React from "react";
import { SocketContext } from "../socket/Context";

export class Dashboard extends React.Component {
  static contextType = SocketContext;

  componentDidMount() {
    this.context.init();

    const stateUpdate = this.context.onNotify();
    stateUpdate.subscribe((incomingMessage: any) => {
      console.log(`Notify: ${JSON.stringify(incomingMessage)}`);
    });
  }

  componentWillUnmount() {
    this.context.disconnect();
  }

  render() {
    return <h1>Dashboard</h1>;
  }
}
