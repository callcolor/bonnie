import { PacketFlags, UUID, Vector3 } from "@caspertech/node-metaverse";
import { AgentRequestSitMessage } from "@caspertech/node-metaverse/dist/lib/classes/messages/AgentRequestSit.js";
import handleClose from "../handleClose";
import { Bot } from "../loginBot";

const sit = (bot: Bot, target: UUID) => {
  if (!bot.bot) return;
  try {
    const msg = new AgentRequestSitMessage();
    msg.AgentData = {
      AgentID: bot.bot.agentID(),
      SessionID: bot.bot.currentRegion.circuit.sessionID,
    };
    msg.TargetObject = {
      Offset: Vector3.getZero(),
      TargetID: target,
    };
    bot.bot.currentRegion.circuit.sendMessage(
      msg,
      undefined as unknown as PacketFlags
    );
  } catch (e) {
    handleClose(e);
  }
};

export default sit;
