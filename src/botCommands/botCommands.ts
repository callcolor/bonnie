import { Bot } from "../loginBot";
import parseJson from "../../utilities/parseJson";
import { InstantMessageEvent } from "@caspertech/node-metaverse";
import Message, { Command } from "../../types/Message";
import handleTts from "./handleTts";
import isPrimCapsUrl from "../../utilities/isPrimCapsUrl";
import axios from "../../utilities/axios";
import { secret } from "../../config";

const publicCommandMap: Record<string, Command> = {
  tts: handleTts,
};

const errors: Record<string, number> = {};
let sequence = 0;

const isBanned = (uuid: string): boolean => {
  const banList: Record<string, boolean> = {};
  return banList[uuid] || false;
};

const botCommands = (bot: Bot) => {
  if (!bot?.bot) return;
  const handler = async (event: InstantMessageEvent) => {
    if (!bot?.bot) return;

    const message = parseJson(event.message) as Message;
    if (!message) return;
    const { command, body, url } = message;

    const currentSequence = sequence++;
    console.log(`-----> ${currentSequence}`, {
      ...message,
      binaryBucket: event.binaryBucket,
    });

    if (isBanned(event.owner.toString())) return;

    // public commands.
    if (!publicCommandMap[command]) return;

    if (secret && message.secret !== secret) {
      console.log(`You didn't say the magic word.`);
      return;
    }

    if (
      !isPrimCapsUrl(message.url) &&
      event.from.toString() !== event.owner.toString()
    ) {
      console.log(`No valid URL to respond to command: ${command}.`);
      return;
    }

    try {
      if (url && errors[url] > 3) {
        console.error(`Too many errors from this CAPS url.`, {
          binaryBucket: event.binaryBucket,
          command,
          owner: event.owner.toString(),
          url,
        });
        return;
      }

      const response = await publicCommandMap[command]({ bot, event, message });
      if (!response) return;

      console.log(`<----- ${currentSequence}`, {
        binaryBucket: event.binaryBucket,
        body,
        command,
        from: event.from.toString(),
        owner: event.owner.toString(),
        response,
      });

      if (isPrimCapsUrl(url)) {
        errors[url] = errors[url] ?? 1;
        try {
          await axios.post(url, response, {
            headers: { "Content-Type": "application/json;charset=utf-8" },
          });
        } catch (e) {
          const error = e as Error;
          if (error?.message?.toLowerCase()?.includes("cap not found")) {
            console.error(error.message);
          } else {
            console.error(error);
          }
          errors[message.url]++;
        }
      } else if (event.from.toString() === event.owner.toString()) {
        await bot.bot.clientCommands.comms.sendInstantMessage(
          event.from,
          response
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  bot.bot.clientEvents.onInstantMessage.subscribe(handler);
};

export default botCommands;
