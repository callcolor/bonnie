import runCommand from "../utilities/runCommand";

const adjustPitchNormalize = async (
  sourceFileName: `${string}.mp3` | `${string}.wav`,
  pitch: number
): Promise<void> => {
  const extension = sourceFileName.split(".").pop();

  try {
    await runCommand(`sox`, [
      sourceFileName,
      `${sourceFileName}.pitch.${extension}`,
      `pitch`,
      `${pitch}`,
      `norm`,
      `0.0`,
    ]);
    await runCommand(`mv`, [
      `${sourceFileName}.pitch.${extension}`,
      sourceFileName,
    ]);
  } catch (e) {
    console.error(e);
  }
};

export default adjustPitchNormalize;
