import { AssetType, InventoryType } from "@caspertech/node-metaverse";
import { md5 } from "../utilities/hash";
import { prisma } from "../utilities/prisma";
import { Bot } from "./loginBot";
import * as fs from "fs";
import runCommand from "../utilities/runCommand";
import getUploadFolder, { UploadFolderName } from "./helpers/getUploadFolder";
import handleClose from "./handleClose";
import { SECONDS } from "../utilities/constants";
import sleep from "../utilities/sleep";

let lock = -1;

export const getWavDurationMs = async (filename: string): Promise<number> => {
  const duration = await runCommand(`sox`, ["--i", "-D", filename]);
  if (duration) {
    const number = Number(duration);
    if (number) {
      return Math.ceil(number * 1000);
    }
  }
  return 0;
};

const uploadSound = async (
  bot: Bot,
  sourceFileName: string,
  clipDuration = 29.9
): Promise<string[]> => {
  if (!bot.bot) return [];

  const asset_type = "Sound";
  const assets = [];

  while (lock !== -1) {
    await sleep(1 * SECONDS);
    if (lock > new Date().getTime() - 60 * SECONDS) {
      lock = -1;
    }
  }
  lock = new Date().getTime();

  try {
    await runCommand(
      `ffmpeg`,
      [
        "-i",
        sourceFileName,
        "-f",
        "segment",
        "-segment_time",
        `${clipDuration}`,
        "-ac",
        "1",
        "-ar",
        "44100",
        "-fflags",
        "+bitexact",
        "-flags:v",
        "+bitexact",
        "-flags:a",
        "+bitexact",
        `${sourceFileName}.%03d.ogg`,
      ],
      {},
      { warn: null }
    );

    let fileNumber = 0;
    while (fileNumber >= 0 && fileNumber < 300) {
      const oggFile = `${sourceFileName}.${fileNumber
        .toString()
        .padStart(3, "0")}.ogg`;
      fileNumber++;
      try {
        console.log(`Reading ${oggFile}.`);
        const fileContents = fs.readFileSync(oggFile);
        const file64 = fileContents.toString("base64");
        const asset_hash = md5(file64);

        const existingAsset = await prisma.asset_uploads.findUnique({
          where: {
            asset_hash_asset_type: {
              asset_hash,
              asset_type,
            },
          },
        });

        if (existingAsset) {
          assets.push(existingAsset.asset_uuid);
        } else {
          const folder = await getUploadFolder(bot, UploadFolderName.Sound);
          if (!folder) throw new Error(`Folder not found.`);

          const asset = await folder.uploadAsset(
            AssetType.Sound,
            InventoryType.Sound,
            fileContents,
            asset_hash,
            "(No Description)"
          );
          const asset_uuid = asset.assetID.toString();

          await prisma.asset_uploads.create({
            data: {
              asset_hash,
              asset_inventory_item_id: asset.itemID.toString(),
              asset_type,
              asset_uuid,
            },
          });

          assets.push(asset_uuid);
        }
      } catch (e) {
        const error = e as Error;
        if (!error?.message?.includes("no such file or directory")) {
          console.error(e);
        }
        if (error?.message?.includes("Response code 404")) {
          handleClose(error.message, 10 * SECONDS);
        }
        fileNumber = -1;
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    lock = -1;
  }
  console.log("uploadSound", { assets });
  return assets;
};

export default uploadSound;
