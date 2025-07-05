import { UUID } from "@caspertech/node-metaverse";
import handleClose from "./src/handleClose";
import loginBot, { LoginParameters } from "./src/loginBot";
import sit from "./src/helpers/sit";
import closeOnDisconnect from "./src/helpers/closeOnDisconnect";
import botCommands from "./src/botCommands/botCommands";
import { firstName } from "./config";
import { lastName } from "./config";
import { password } from "./config";

const bonnie = async () => {
  const loginParameters: LoginParameters = {
    agreeToTOS: true,
    extras: {},
    firstName,
    lastName,
    password,
    start: "uri:UH Aquaculture Program&172&120&1",
    url: "https://login.agni.lindenlab.com/cgi-bin/login.cgi",
  };

  const bot = await loginBot(loginParameters, 3);
  if (!bot?.bot) return;

  setTimeout(async () => {
    closeOnDisconnect(bot);
    // sit(bot, new UUID("79ab4605-ac3b-cd83-ee3e-b3b0ce54f9e8"));
  }, 20000);

  botCommands(bot);
};

try {
  bonnie();
} catch (e) {
  handleClose(e);
}
