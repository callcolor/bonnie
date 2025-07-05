const sleep = (m: number): Promise<void> => new Promise((r) => setTimeout(r, m));

export default sleep;
