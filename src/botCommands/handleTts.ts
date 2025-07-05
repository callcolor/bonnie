import mimic3TTS from "../../services/mimic3TTS";
import { Command } from "../../types/Message";

const handleTts: Command = async ({ bot, event, message }) => {
  if (!bot?.bot) return;

  const { key, voice, body, scale, pitch, token, voice_settings } = message;
  if (!body) return;

  const ttsResponse = await mimic3TTS(
    {
      body,
      bot,
      pitch: pitch ? Number(pitch) : 0,
      scale: scale ? Number(scale) : 1,
      voice,
    },
    event
  );

  if (ttsResponse) {
    return JSON.stringify({ key, voice, ...ttsResponse });
  }
};

export default handleTts;
