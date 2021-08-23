const splitToBulks = (arr: [], bulkSize = 20) => {
  const bulks = [];
  for (let i = 0; i < Math.ceil(arr.length / bulkSize); i++) {
    bulks.push(arr.slice(i * bulkSize, (i + 1) * bulkSize));
  }
  return bulks;
};

export { splitToBulks };
