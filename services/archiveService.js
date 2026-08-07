const archiveAllSeason = async (models) => {
  const operations = Object.values(models).map((Model) => Model.updateMany({}, { $set: { archived: true } }));
  await Promise.all(operations);
};

module.exports = {
  archiveAllSeason,
};
