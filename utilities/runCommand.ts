import { spawn } from "node:child_process";

const runCommand = async (
  command: string,
  args: string[],
  options?: { shell?: boolean },
  logger: Console | { warn: null } = console
): Promise<string | false> => {
  return await new Promise((resolve) => {
    try {
      let last_data = "";
      const dep = spawn(command, args, options);

      dep.stdout.on("data", (data) => {
        last_data = data;
        logger.warn?.(`stdout: ${data}`);
      });

      dep.stderr.on("data", (data) => {
        last_data = data;
        logger.warn?.(`stderr: ${data}`);
      });

      dep.on("close", (code) => {
        if (code === 0) {
          console.warn(`${command} exited with code ${code}.`);
        } else {
          console.error(`${command} exited with code ${code}.`);
        }
        resolve(last_data.toString().trim());
      });
    } catch (e) {
      console.error(e);
      resolve(false);
    }
  });
};

export default runCommand;
