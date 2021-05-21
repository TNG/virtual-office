import { Field, InterfaceType, registerEnumType } from "type-graphql";

export enum MutationType {
  ADD = "ADD",
  REMOVE = "REMOVE",
  UPDATE = "UPDATE",
}

registerEnumType(MutationType, {
  name: "MutationType",
});

@InterfaceType()
export abstract class MutationResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field()
  mutationType!: MutationType;
}
