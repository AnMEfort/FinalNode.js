const path = require("path");
const fs = require("fs");
const database = require("../controllers/database");

module.exports = {
  exportToFile: async function (res, sql, filePrefix) {
    try {
      const result = await database.query(sql);

      const now = new Date().getTime(); // moment.js
      const filePath = path.join(
        __dirname,
        "../files",
        `${filePrefix}-${now}.txt`
      );
      const stream = fs.createWriteStream(filePath);

      stream.on("open", function () {
        stream.write(JSON.stringify(result[0]));
        stream.end();
      });

      stream.on("finish", function () {
        res.send(`Success. File at: ${filePath}`);
      });
    } catch (err) {
      throw err;
    }
  },
};
