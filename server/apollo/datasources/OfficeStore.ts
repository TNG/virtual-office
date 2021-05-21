import { DataSource } from "apollo-datasource";
import { Config } from "../../Config";
import { OfficeWithBlocks, OfficeWithBlocksConfig, OfficeWithBlocksDb } from "../../types/OfficeWithBlocks";
import { Service } from "typedi";
import { v4 as uuid } from "uuid";
import { getOfficeWithBlocksConfigFromOfficeConfig } from "../../express/utils/convertOffice";
import { Block, BlockConfig, BlockDb } from "../../types/Block";
import { OfficeConfig } from "../../types/Office";
import { BlockStore } from "./BlockStore";
import { SessionStore } from "./SessionStore";
import { RoomStore } from "./RoomStore";
import { GroupStore } from "./GroupStore";

@Service()
export class OfficeStore extends DataSource {
  private office: OfficeWithBlocksDb = {
    id: uuid(),
    version: "2",
    blocks: [],
  };

  constructor(
    config: Config,
    private blockStore: BlockStore,
    private roomStore: RoomStore,
    private sessionStore: SessionStore,
    private groupStore: GroupStore
  ) {
    super();
    const officeParsed: OfficeConfig = config.configOptions;
    this.createOffice(officeParsed);
  }

  initialize() {
    //this.context = config.context;
  }

  private createOffice(officeParsed: OfficeConfig) {
    const officeWithBlocks: OfficeWithBlocksConfig = getOfficeWithBlocksConfigFromOfficeConfig(officeParsed);
    officeWithBlocks.blocks.forEach((blockConfig: BlockConfig) => {
      const blockDb: BlockDb = this.blockStore.addBlock(blockConfig);
      this.office.blocks.push(blockDb.id);
    });
  }

  public getOffice(): OfficeWithBlocks {
    const officeDb: OfficeWithBlocksDb = this.office;
    return {
      id: officeDb.id,
      version: officeDb.version,
      blocks: officeDb.blocks
        .map((blockId: string) => this.blockStore.getBlock(blockId))
        .filter((block: Block | undefined): block is Block => block !== undefined),
    };
  }

  public updateOffice(officeInput: OfficeWithBlocks): boolean {
    this.office = {
      id: uuid(),
      version: "2",
      blocks: [],
    };
    this.blockStore.clear();
    this.groupStore.clear();
    this.sessionStore.clear();
    this.roomStore.clear();
    officeInput.blocks.forEach((blockConfig: BlockConfig) => {
      const blockDb: BlockDb = this.blockStore.addBlock(blockConfig);
      this.office.blocks.push(blockDb.id);
    });
    return true;
  }
}
