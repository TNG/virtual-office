import * as t from "io-ts";

export const TrackLegacyCodec = t.type({
  id: t.string,
  name: t.string,
});
export type TrackLegacy = t.TypeOf<typeof TrackLegacyCodec>;

export const SessionLegacyCodec = t.intersection([
  t.type({
    start: t.string,
    end: t.string,
  }),
  t.partial({
    roomId: t.string,
    groupId: t.string,
    trackId: t.string,
    alwaysActive: t.boolean,
  }),
]);
export type SessionLegacy = t.TypeOf<typeof SessionLegacyCodec>;

export const ScheduleLegacyCodec = t.type({
  tracks: t.array(TrackLegacyCodec),
  sessions: t.array(SessionLegacyCodec),
});
export type ScheduleLegacy = t.TypeOf<typeof ScheduleLegacyCodec>;
