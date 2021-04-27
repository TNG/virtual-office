import * as t from "io-ts";

const ClientConfigConfigCodec = t.intersection([
  t.type({
    viewMode: t.union([t.literal("list"), t.literal("grid")]),
    theme: t.union([t.literal("dark"), t.literal("light")]),
    sessionStartMinutesOffset: t.number,
  }),
  t.partial({
    backgroundUrl: t.string,
    timezone: t.string,
    title: t.string,
    logoUrl: t.string,
    faviconUrl: t.string,
    hideEndedSessions: t.boolean,
  }),
]);
export type ClientConfigConfig = t.TypeOf<typeof ClientConfigConfigCodec>;
export type ClientConfigDb = ClientConfigConfig & { id: string };
export type ClientConfig = ClientConfigConfig & { id: string };
