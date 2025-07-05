import { InstantMessageEvent } from "@caspertech/node-metaverse";
import { Bot } from "../src/loginBot";

export type Command = (params: {
  bot: Bot;
  event: InstantMessageEvent;
  message: Message;
}) => Promise<string | void | null>;

interface TextToTextureMessage {
  bgColor: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  margin: number;
  maxWidth: number;
  customHeight: number;
  textAlign: CanvasTextAlign;
  textColor: string;
  verticalAlign: string;
}

interface Message extends TextToTextureMessage {
  body: string;
  command: string;
  id: number;
  key: string;
  groupUUID: string;
  memberUUID: string;
  name: string;
  scale: string;
  subject: string;
  url: string;
  uuid: string;
  voice: string;
  youtubeId: string;
  prompt: string;
  model: string;
  targetUUID: string;
  targetVector: number[];
  type: number;
  pitch: number;
  token: string;
  data: string;
  voice_settings: unknown;
  flags: number;
  size: number;
  secret: string;
  durationLimit: number;
}

export interface ChatCompletionMessage {
  temperature: number;
  max_tokens: number;
  messages: {
    role: string;
    content: string;
  }[];
  use_cache?: string;
  model?: string;
}

export default Message;
