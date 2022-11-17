const fs = require("fs");

function isEmail(email) {
  const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return !!(email !== "" && email.match(emailFormat));
}

function isValid(record, lineIndex) {
  const errors = [];
  if (!record.ref) {
    errors.push("Ref is empty");
  }

  if (!record.name) {
    errors.push("Name is empty");
  }

  if (!isEmail(record.email)) {
    errors.push("Email is not valid");
  }

  if (errors.length) {
    console.error(`Line ${lineIndex} has invalid record: `, errors.join(","));
    return false;
  }

  return true;
}

const MAX_CHUNK = 1000;

class RecordProcessor {
  chunk = 0;
  buffer = [];
  currentLine = 0;
  errors = 0;

  constructor(path) {
    this.path = path;
    this.createMetaFile();
    this.startDate = new Date();
    console.log("File processing started", this.startDate);
  }

  createMetaFile(status = "INIT") {
    const filePath = this.path + "/meta.json";
    const meta = {
      status: status,
      dir: this.path,
      chunks: this.chunk,
      successfulRecordsCount: this.currentLine,
      errorRecordsCount: this.errors,
      chunkSize: MAX_CHUNK,
    };
    fs.writeFileSync(filePath, JSON.stringify(meta), {
      encoding: "utf8",
    });
  }

  writeToFile(status = "PROCESSING") {
    const filePath = this.path + "/chunk/" + this.chunk + ".json";
    fs.writeFileSync(filePath, JSON.stringify(this.buffer), {
      encoding: "utf8",
    });

    this.createMetaFile(status);
    console.log("File created: ", filePath);
  }

  process(record, lineIndex) {
    if (!isValid(record, lineIndex)) {
      this.errors = this.errors + 1;
      return;
    }
    this.currentLine = this.currentLine + 1;
    this.buffer.push(record);

    if (this.buffer.length === MAX_CHUNK) {
      this.writeToFile();
      this.buffer = [];
      this.chunk = this.chunk + 1;
    }
  }

  finish() {
    this.writeToFile("DONE");
    const finishDate = new Date();
    console.log(
      "File processing finished at ",
      finishDate,
      " took: ",
      (finishDate.getTime() - this.startDate.getTime()) / 1000,
      "s"
    );
  }
}

module.exports = { RecordProcessor };
