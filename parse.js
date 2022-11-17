const fs = require("fs");
const crypto = require("crypto");
const { getFileParser } = require("./parser/file-type.factory");
const { download } = require("./parser/download");
const path = require("path");

async function startJob() {
  const uuid = crypto.randomUUID();
  const dir = path.resolve("./" + uuid);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    fs.mkdirSync(dir + "/chunk");
  }

  const url = process.argv[2];
  if (!url) {
    console.log("Please provide url. Use syntax 'node parse.js url'");
  }
  const filePath = await download(url, dir);

  const parser = await getFileParser(filePath);
  if (parser === "unknown") {
    console.warn("Unknown file type");
    return;
  }
  await parser.parseFile(filePath, dir);

  console.log("Success, you can find parsed files in ", dir);

  return uuid;
}

startJob();
