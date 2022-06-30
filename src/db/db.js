const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const conn = new sqlite3.Database("./cocoa.sqlite3");

function loadSql(filename) {
  return new Promise((resolve, reject) =>
    fs.readFile(path.join(__dirname, filename), (err, data) =>
      err ? reject(err) : resolve(data.toString())
    )
  );
}

function allPromise(sql, ...params) {
  return new Promise((resolve, reject) => {
    conn.all(sql, params, (error, rows) => {
      if (error) {
        return reject(error);
      }
      resolve(rows);
    });
  });
}

function runPromise(sql, ...params) {
  return new Promise((resolve, reject) => {
    conn.run(sql, params, (result, error) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
  });
}

function getPromise(sql, ...params) {
  return new Promise((resolve, reject) => {
    conn.get(sql, params, (error, row) => {
      if (error) {
        return reject(error);
      }
      resolve(row);
    });
  });
}

async function runAllSql(script) {
  console.log(`Running script:
${script}`);
  for (const comm of script.split(";")) {
    await runPromise(comm);
  }
}

let isLoaded = false;
const loading = (async function loadingFunction() {
  const init = await loadSql("./init.sql");
  await runAllSql(init);
  const versions = (await allPromise(`SELECT VersionId FROM AppVersions`)).map(it => it.VersionId);
  console.log(`Current versions: ${versions.join(", ")}`);
  if (!versions.includes("ServerCharacters-UserId")) {
    const serverCharacterUserId = await loadSql("./ServerCharacters-UserId.sql");
    await runAllSql(serverCharacterUserId);
  }
  isLoaded = true;
})();

async function all(sql, ...params) {
  if (!isLoaded) await loading;
  const results = await allPromise(sql, ...params);
  return results;
}

async function get(sql, ...params) {
  if (!isLoaded) await loading;
  const result = await getPromise(sql, ...params);
  return result;
}

async function run(sql, ...params) {
  if (!isLoaded) await loading;
  const result = await runPromise(sql, ...params);
  return result;
}

module.exports = {
  all,
  get,
  run,
};
