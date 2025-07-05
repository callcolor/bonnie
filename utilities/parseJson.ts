const parseJson = (str: string) => {
  try {
    const message = JSON.parse(str);
    return message as Record<string, any>;
  } catch (e) {
    return null;
  }
};

export default parseJson;
