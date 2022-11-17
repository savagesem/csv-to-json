const fs = require("fs");
const { parse } = require("csv-parse");

const { RecordProcessor } = require("./record-proccessor");

function getHeader(arr) {
  return arr.reduce((acc, el, idx) => {
    acc[el] = idx;
    return acc;
  }, {});
}

function transformToJson(header, data) {
  return {
    ref: data[header.ref],
    name: data[header.name],
    email: data[header.email],
    address: data[header.address],
    country_code: data[header.country_code],
  };
}

async function parseFile(filePath, path) {
  const recordProcessor = new RecordProcessor(path);
  let header;
  let lineIndex = -1;

  const readStream = fs.createReadStream(filePath);
  const parser = parse({
    delimiter: ",",
  });

  readStream.pipe(parser);

  return new Promise((resolve, reject) => {
    // Use the readable stream api to consume records
    parser.on("readable", function () {
      let record;
      while ((record = parser.read()) !== null) {
        lineIndex++;
        if (!header) {
          header = getHeader(record);
        } else {
          const json = transformToJson(header, record);
          recordProcessor.process(json, lineIndex);
        }
      }
    });
    // Catch any error
    parser.on("error", function (err) {
      reject(err);
    });
    // Test that the parsed records matched the expected records
    parser.on("end", function () {
      recordProcessor.finish();
      resolve(true);
    });
  });
}

module.exports = { parseFile };
