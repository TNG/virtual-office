import * as t from "io-ts";

export const RoomLinkCodec = t.intersection([
  t.type({
    href: t.string,
    text: t.string,
  }),
  t.partial({
    icon: t.string,
    linkGroup: t.string,
  }),
]);
export type RoomLink = t.TypeOf<typeof RoomLinkCodec>;
