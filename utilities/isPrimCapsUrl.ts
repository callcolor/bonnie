const regexMatcher = /^https?:\/\/simhost-[a-f0-9]*.agni.secondlife.io:12046\/cap\/[a-f0-9-]*$/;

const isPrimCapsUrl = (url: string | undefined) => {
  if (!url) return false;
  if (!url.includes('secondlife.io:12046/cap/')) return false;
  if (!regexMatcher.test(url)) return false;

  return true;
};

export default isPrimCapsUrl;
