import React, { createContext } from "react";
import { SocketService } from "./SocketService";

export const SocketContext: React.Context<SocketService> = createContext(new SocketService());
