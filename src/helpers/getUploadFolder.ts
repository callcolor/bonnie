import { InventoryFolder } from "@caspertech/node-metaverse/dist/lib/classes/InventoryFolder";
import { Bot } from "../loginBot";
import { FolderType } from "@caspertech/node-metaverse";

export enum UploadFolderName {
  Image = "uploaded images",
  Sound = "uploaded sounds",
}

const folders: Record<UploadFolderName, InventoryFolder | null> = {
  [UploadFolderName.Image]: null,
  [UploadFolderName.Sound]: null,
};

const getUploadFolder = async (
  bot: Bot,
  folderName: UploadFolderName
): Promise<InventoryFolder | undefined | null> => {
  if (!bot.bot) return;
  if (folders[folderName]) return folders[folderName];

  const rootFolder = bot.bot.clientCommands.inventory.getInventoryRoot();
  await rootFolder.populate(false);

  const existingFolder = rootFolder.folders.find((f) => f.name === folderName);
  if (existingFolder) {
    folders[folderName] = existingFolder;
  } else {
    folders[folderName] = await rootFolder.createFolder(
      folderName,
      FolderType.None
    );
  }
  return folders[folderName];
};

export default getUploadFolder;
