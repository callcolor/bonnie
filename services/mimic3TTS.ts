import fs from "fs";
import { InstantMessageEvent, UUID } from "@caspertech/node-metaverse";
import { Bot } from "../src/loginBot";
import uploadSound, { getWavDurationMs } from "../src/uploadSound";
import runCommand from "../utilities/runCommand";
import { prisma } from "../utilities/prisma";
import { SECONDS } from "../utilities/constants";
import sleep from "../utilities/sleep";
import adjustPitchNormalize from "../utilities/adjustPitchNormalize";

interface TTSRequest {
  bot: Bot;
  voice: string;
  body: string;
  scale: number;
  pitch: number;
}

export interface TTSResponse {
  uuid?: string;
  duration: number;
  body?: string;
}

const running: { [key: string]: boolean } = {};

const isAlphanumeric = (str: string) => {
  return /^[a-zA-Z0-9/#_-]+$/.test(str);
};

const mimic3TTS = async (
  { bot, voice: voiceInput, body, scale, pitch }: TTSRequest,
  event?: InstantMessageEvent
): Promise<TTSResponse | void> => {
  const voice = isValidVoice(voiceInput) ? voiceInput : "en_US/vctk_low#p336";
  const tempFilename = `/tmp/${UUID.random()}`;
  const uniqueId = `${body} ~~~ ${scale} ~~~ ${pitch}`;

  if (!isAlphanumeric(voice)) {
    throw new Error("Invalid voice.");
  }

  if (voice.length > 40) {
    throw new Error("Invalid voice.");
  }

  while (running[uniqueId]) {
    await sleep(1 * SECONDS);
  }
  running[uniqueId] = true;
  setTimeout(() => {
    running[uniqueId] = false;
  }, 30 * SECONDS);

  try {
    const existing = await prisma.tts.findUnique({
      where: { body_voice: { body: uniqueId, voice } },
    });
    if (existing) {
      await sleep(1 * SECONDS);
      return {
        duration: (existing.duration_ms || 0) / 1000,
        uuid: existing.uuid,
      };
    }

    await fs.promises.writeFile(`${tempFilename}.txt`, body);

    const result = await runCommand(
      `cat ${tempFilename}.txt | mimic3 --length-scale ${scale} --voice ${voice} > ${tempFilename}.wav`,
      [],
      {
        shell: true,
      }
    );
    if (!result) return;

    await adjustPitchNormalize(`${tempFilename}.wav`, pitch);

    const uuid = (await uploadSound(bot, `${tempFilename}.wav`))?.[0];

    const duration_ms = await getWavDurationMs(`${tempFilename}.wav.000.ogg`);

    runCommand(`rm ${tempFilename}.*`, [], { shell: true });

    if (uuid) {
      const update = {
        body: uniqueId,
        duration_ms,
        uuid,
        voice,
      };
      await prisma.tts.upsert({
        create: update,
        update,
        where: {
          body_voice: {
            body: uniqueId,
            voice,
          },
        },
      });
      return {
        duration: duration_ms / 1000,
        uuid,
      };
    }
  } catch (e) {
    console.error(e);
  } finally {
    running[uniqueId] = false;
  }
};

const isValidVoice = (voiceRequest: string) => {
  try {
    const voices: string[] = [
      "af_ZA/google-nwu_low",
      "bn/multi_low",
      "de_DE/m-ailabs_low",
      "de_DE/thorsten-emotion_low",
      "de_DE/thorsten_low",
      "el_GR/rapunzelina_low",
      "en_UK/apope_low en_UK",
      "en_US/cmu-arctic_low",
      "en_US/hifi-tts_low",
      "en_US/ljspeech_low",
      "en_US/m-ailabs_low",
      "en_US/vctk_low",
      "es_ES/carlfm_low",
      "es_ES/m-ailabs_low",
      "fa/haaniye_low",
      "fi_FI/harri-tapani-ylilammi_low",
      "fr_FR/m-ailabs_low",
      "fr_FR/siwis_low fr_FR",
      "fr_FR/tom_low",
      "gu_IN/cmu-indic_low",
      "ha_NE/openbible_low",
      "hu_HU/diana-majlinger_low",
      "it_IT/mls_low",
      "it_IT/riccardo-fasol_low",
      "jv_ID/google-gmu_low",
      "ko_KO/kss_low",
      "ne_NP/ne-google_low",
      "nl/bart-de-leeuw_low",
      "nl/flemishguy_low",
      "nl/nathalie_low",
      "nl/pmk_low",
      "nl/rdh_low",
      "pl_PL/m-ailabs_low",
      "ru_RU/multi_low",
      "sw/lanfrica_low",
      "te_IN/cmu-indic_low",
      "tn_ZA/google-nwu_low",
      "uk_UK/m-ailabs_low",
      "vi_VN/vais1000_low",
      "yo/openbible_low",
    ];
    const voice = voiceRequest.split("#")[0];
    if (!voices.includes(voice)) {
      return false;
    }

    return true;
  } catch (e) {
    console.warn("Invalid voice.", voiceRequest);
    return false;
  }
};

export default mimic3TTS;
