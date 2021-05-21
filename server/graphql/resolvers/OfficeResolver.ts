import { FieldResolver, Query, Resolver, ResolverInterface, Root } from "type-graphql";
import { OfficeStore } from "../../apollo/datasources/OfficeStore";
import { Service } from "typedi";
import { Office } from "../types/Office";
import { Block } from "../types/Block";
import { BlockStore } from "../../apollo/datasources/BlockStore";

@Service()
@Resolver((of) => Office)
export class OfficeResolver implements ResolverInterface<Office> {
  constructor(private readonly officeStore: OfficeStore, private readonly blockStore: BlockStore) {}

  @Query((returns) => Office, { nullable: true })
  async getOffice() {
    return this.officeStore.getOffice();
  }

  @FieldResolver()
  async blocks(@Root() office: Office) {
    return office.blockIds
      .map((blockId) => this.blockStore.getBlock(blockId))
      .filter((block: Block | undefined): block is Block => block !== undefined);
  }
}
