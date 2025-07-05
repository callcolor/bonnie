import { SimStatsEvent } from "@caspertech/node-metaverse/dist/lib/events/SimStatsEvent";
import { Bot } from "../loginBot";
import { MINUTES } from "../../utilities/constants";
import handleClose from "../handleClose";

const timeout = 5 * MINUTES;
const stats = {
  simStatus: {} as SimStatsEvent,
  updatedAt: new Date().getTime(),
};

setInterval(() => {
  const deltaT = new Date().getTime() - stats.updatedAt;
  if (deltaT > timeout) {
    handleClose(
      `Closing bot because sim status was not updated for ${
        deltaT / MINUTES
      } minutes.`
    );
  } else {
    console.log(`Sim FPS: ${stats.simStatus.fps}.`);
  }
}, timeout);

const closeOnDisconnect = (bot: Bot) => {
  if (!bot.bot) return;
  bot.bot.clientEvents.onSimStats.subscribe((simStatus: SimStatsEvent) => {
    stats.simStatus = simStatus;
    stats.updatedAt = new Date().getTime();
  });
};

export default closeOnDisconnect;
