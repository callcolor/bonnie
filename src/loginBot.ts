import {
  Bot as nmvBot,
  BotOptionFlags,
  LoginParameters as LoginParametersNM,
  Utils,
} from "@caspertech/node-metaverse";
import { MINUTES, SECONDS } from "../utilities/constants";
import handleClose, { isClosing } from "./handleClose";
import sleep from "../utilities/sleep";
import { AgentMovementCompleteMessage } from "@caspertech/node-metaverse/dist/lib/classes/MessageClasses";
import { Message } from "@caspertech/node-metaverse/dist/lib/enums/Message";

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export type LoginParameters = Without<
  LoginParametersNM,
  "passwordPrehashed" | "getHashedPassword"
> & {
  extras: { [key: string]: any };
};

export interface Bot {
  loginParameters: LoginParameters;
  bot: nmvBot | undefined;
}

export const allBots: Bot[] = [];

const tryLoginBot = async (bot: Bot): Promise<boolean> => {
  if (!bot.bot) return false;

  const loginParameters = bot.loginParameters;
  try {
    loginParameters.extras.successes = -999;

    try {
      await bot.bot.login();

      console.log("Login complete.");
      loginParameters.extras.successes = -990;
    } catch (e) {
      const error = e as Error;
      const ipBan = `Unknown XML-RPC tag 'TITLE'`;
      if (error.message.includes(ipBan)) {
        // do not retry.
        handleClose(ipBan, 30 * MINUTES);
        throw new Error(ipBan);
      } else {
        console.log(error.message);
        return false;
      }
    }

    await bot.bot.currentRegion.circuit.subscribeToMessages(
      [Message.AgentMovementComplete],
      (packet) => {
        if (!bot.bot) return;
        const amc = packet.message as AgentMovementCompleteMessage;
        const channelVersion = Utils.BufferToString(
          amc.SimData.ChannelVersion
        ).result;
        const regionHandle = amc.Data.RegionHandle;
        bot.loginParameters.extras.agentMovementComplete = {
          channelVersion,
          regionHandle,
        };
      }
    );

    await bot.bot.connectToSim();
    console.log("Connected.");
    loginParameters.extras.successes = -980;

    const timeoutRef = setTimeout(async () => {
      await bot?.bot?.close();
      handleClose("Fucking SL sucks.");
    }, 6000);

    await bot.bot.waitForEventQueue(5000);
    console.log("Event Queue started.");
    clearTimeout(timeoutRef);
    loginParameters.extras.successes = -970;

    await bot.bot.clientCommands.region.waitForHandshake(20000);
    console.log("Region handshake complete");
    loginParameters.extras.successes = -960;

    bot.bot.clientEvents.onDisconnected.subscribe((DisconnectEvent) => {
      console.log("Disconnected from simulator: " + DisconnectEvent.message);
      if (!DisconnectEvent.requested) {
        handleClose("DisconnectEvent");
      }
    });

    await bot.bot.currentRegion.waitForParcelOverlay();
    console.log("Parcel overlay complete");
    loginParameters.extras.successes = -950;

    await bot.bot.currentRegion.waitForTerrain();
    console.log("Terrain complete");
    loginParameters.extras.successes = -940;

    await bot.bot.clientCommands.agent.waitForAppearanceComplete();
    console.log("Appearance complete.");
    loginParameters.extras.successes = -920;

    loginParameters.extras.successes = -900;
    console.log("loginBot complete.");
    return true;
  } catch (e) {
    console.error("tryLoginBot error", e);
    try {
      await bot.bot?.close();
    } catch (ee) {
      console.error(ee);
    } finally {
      loginParameters.extras.successes = {
        e,
        successes: loginParameters.extras.successes,
      };
      console.error(e, loginParameters.firstName);
    }
    return false;
  }
};

const loginBot = async (
  loginParameters: LoginParameters,
  retries = 1,
  options?: BotOptionFlags
): Promise<Bot | undefined> => {
  while (retries > 0) {
    retries--;

    if (isClosing) return;

    const bot = {
      bot: new nmvBot(
        loginParameters as unknown as LoginParametersNM,
        options === undefined
          ? BotOptionFlags.LiteObjectStore |
            BotOptionFlags.StoreMyAttachmentsOnly
          : options
      ),
      loginParameters,
    };
    allBots.push(bot);

    const success = await new Promise((resolve) => {
      setTimeout(async () => {
        const isStuckLogin =
          loginParameters.extras.successes < -900 ||
          loginParameters.extras.successes.e;
        if (isStuckLogin) {
          try {
            await bot.bot?.close();
          } catch (e) {
            // nothing
          } finally {
            const e = new Error("Timeout while attempting login.");
            loginParameters.extras.successes = {
              e,
              successes: loginParameters.extras.successes,
            };
            console.error(e, loginParameters.firstName);
            resolve(false);
          }
        }
      }, 60 * SECONDS);

      tryLoginBot(bot).then((s) => {
        resolve(s);
      });
    });

    if (success) {
      return bot;
    } else {
      await sleep(60 * SECONDS);
    }
  }
};

export default loginBot;
