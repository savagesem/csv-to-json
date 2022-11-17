const fs = require("fs");
const https = require("https");

function download(from, path) {
  const filePath = path + "/original.csv";
  const file = fs.createWriteStream(filePath);

  console.log(`Downloading file ${from}`);

  return new Promise((resolve, reject) => {
    const request = https.get(from, function (response) {
      response.pipe(file);

      file.on("error", (error) => {
        reject(error);
      });

      file.on("finish", () => {
        console.log(`Downloading complete`);
        file.close();
        resolve(filePath);
      });
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
}

module.exports = { download };
