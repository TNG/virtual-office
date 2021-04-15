import React, { createContext } from "react";
import { SocketService } from "./SocketService";

export const SocketContext: React.Context<SocketService> = createContext(new SocketService());
export const SearchContext: React.Context<string> = createContext("");
export const SearchProvider = SearchContext.Provider;
