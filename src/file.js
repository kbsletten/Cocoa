const fs = require("fs");
const path = require("path");

function loadFile(filename) {
  return new Promise((resolve, reject) =>
    fs.readFile(path.join(__dirname, filename), (err, data) =>
      err ? reject(err) : resolve(data.toString())
    )
  );
}

module.exports = {
  loadFile,
};
