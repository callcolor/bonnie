import { MINUTES, SECONDS } from '../utilities/constants';
import { prisma } from '../utilities/prisma';
import { allBots } from './loginBot';
import sleep from '../utilities/sleep';

export let isClosing = false;

process.on('SIGINT', () => {
  handleClose('SIGINT', 0);
});

process.on('SIGTERM', () => {
  handleClose('SIGTERM', 0);
});

process.on('SIGQUIT', () => {
  handleClose('SIGQUIT', 0);
});

process.on('message', (msg) => {
  if (msg == 'shutdown') {
    handleClose('shutdown');
  }
});

const handleClose = async (errorOrString: unknown, delay = 5 * MINUTES) => {
  if (isClosing) return;
  isClosing = true;

  console.error('handleClose', errorOrString);

  // if something goes really wrong, still exit.
  setTimeout(() => {
    process.exit();
  }, 10 * MINUTES);

  allBots.map(async (bot) => {
    try {
      console.log('logout');
      const botRef = bot.bot;
      bot.bot = undefined;
      botRef?.agent?.shutdown?.();
      console.log('shutdown');
      await botRef?.close?.();
      console.log('close');
    } catch (e) {
      const error = e as Error;
      console.error(error.message);
    }
  });

  await Promise.all([
    prisma?.$disconnect(),
    sleep(12 * SECONDS), // Must wait for all message timeouts ( > 10 seconds ).
    await sleep(delay),
  ]);

  console.log('process.exit');
  process.exit();
};

export default handleClose;
