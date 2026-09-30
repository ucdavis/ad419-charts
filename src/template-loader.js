module.exports = function templateLoader(source) {
  return `module.exports = ${JSON.stringify(source)};`;
};
