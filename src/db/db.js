const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const conn = new sqlite3.Database("./cocoa.sqlite3");

let isLoaded = false;

const loading = new Promise((resolve, reject) => {
  const init = fs.readFileSync(path.join(__dirname, "./init.sql"));
  console.log(`Running script:
${init}`);
  const commands = init.toString().split(";");
  let lastCommand = Promise.resolve();
  for (const comm of commands) {
    lastCommand = lastCommand.then(() => {
      return new Promise((resolve, reject) => {
        conn.run(comm, (result, error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
          isLoaded = true;
        });
      });
    });
  }
  lastCommand.then(resolve, reject);
});

async function all(sql, ...params) {
  if (!isLoaded) await loading;
  const results = await new Promise((resolve, reject) =>
    conn.all(sql, params, (error, rows) => {
      if (error) {
        return reject(error);
      }
      resolve(rows);
    })
  );
  return results;
}

async function get(sql, ...params) {
  if (!isLoaded) await loading;
  const result = await new Promise((resolve, reject) =>
    conn.get(sql, params, (error, row) => {
      if (error) {
        return reject(error);
      }
      resolve(row);
    })
  );
  return result;
}

async function run(sql, ...params) {
  if (!isLoaded) await loading;
  const result = await conn.run(sql, params);
  return result;
}

module.exports = {
  all,
  get,
  run,
};
