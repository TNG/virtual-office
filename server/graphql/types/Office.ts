import { Field, ID, ObjectType } from "type-graphql";
import { Block } from "./Block";

@ObjectType()
export class Office {
  @Field((type) => ID)
  id!: string;

  @Field()
  version!: string;

  @Field((type) => [String])
  blockIds!: string[];

  @Field((type) => [Block])
  blocks!: Block[];

  constructor(id: string, version: string, blockIds: string[]) {
    this.id = id;
    this.version = version;
    this.blockIds = blockIds;
  }
}
