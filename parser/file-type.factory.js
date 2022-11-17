const fs = require("fs");
const events = require("events");
const readline = require("readline");
const config = require("../config.json");
const path = require("path");

async function identifyFileType(path) {
  const readStream = fs.createReadStream(path);
  let firstLine;

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  rl.on("line", (line) => {
    if (firstLine) {
      rl.close();
    }
    firstLine = line;
  });

  await events.once(rl, "close");

  if (firstLine.indexOf(",") !== -1) {
    return "csv";
  }

  return "unknown";
}

async function getFileParser(filePath) {
  const fileType = await identifyFileType(filePath);
  const parser = config[fileType];
  if (parser) {
    const parserPath = path.resolve(__dirname, parser);
    if (fs.existsSync(parserPath)) {
      return require("./csv-parser");
    }
  }

  return "unknown";
}

module.exports = { getFileParser };
