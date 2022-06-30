const joi = require("joi");
const database = require("./database");
const filemgmt = require("../shared/filemgmt");

module.exports = {
  addCards: async function (req, res, next) {
    const reqBody = req.body;

    const schema = joi.object({
      id: joi.number().required(),
      bname: joi.string().required().min(2).max(50),
      description: joi.string().required().min(2).max(200),
      address: joi.string().required().min(2).max(200),
      phone: joi.number().required(),
    });

    const { error, value } = schema.validate(reqBody);

    if (error) {
      console.log(error);
      res.status(400).send("Error 400 - Bad Request");
      return;
    }

    const sql =
      "INSERT INTO cards(bname, description, price)" + " VALUES(?,?,?,?,?);";

    try {
      const result = await database.query(sql, [
        reqBody.id,
        reqBody.bname,
        reqBody.description,
        reqBody.address,
        reqBody.phone,
      ]);
    } catch (err) {
      console.log(err);
      return;
    }

    res.status(200).json;
  },

  cardsList: async function (req, res, next) {
    const param = req.query;

    const schema = joi.object({
      column: joi.string().valid("id").default("id"),
      sort: joi.string().valid("ASC", "DESC").default("ASC"),
    });

    const { error, value } = schema.validate(param);

    if (error) {
      res.status(400).send("List failed");
      throw error;
    }

    const sql = `SELECT * FROM cards ORDER BY cards.${value.column} ${value.sort};`;

    try {
      const result = await database.query(sql);
      res.send(result[0]);
    } catch (err) {
      console.log(err);
    }
  },

  editCards: async function (req, res, next) {
    const reqBody = req.body;

    const schema = joi.object({
      bname: joi.string().min(2).max(50),
      description: joi.string().min(2).max(300),
      address: joi.number(),
      phone: joi.string().min(5).max(200),
    });

    const { error, value } = schema.validate(reqBody);

    if (error) {
      res.status(400).send(`error update cards: ${error}`);
      return;
    }

    const keys = Object.keys(value);
    const values = Object.values(value);
    const fields = keys.map((key) => `${key}=?`).join(",");
    values.push(req.params.id);
    const sql = `UPDATE cards SET ${fields} WHERE id=?`;

    try {
      const result = await database.query(sql, values);
      res.json(value);
    } catch (err) {
      console.log(err);
      return;
    }
  },

  deleteCards: async function (req, res, next) {
    const schema = joi.object({
      id: joi.number().required(),
    });

    const { error, value } = schema.validate(req.params);

    if (error) {
      res.status(400).send("error delete cards");
      console.log(error.details[0].message);
      return;
    }

    const sql = `DELETE FROM cards WHERE id=?`;

    try {
      const result = await database.query(sql, [value.id]);
      res.json({
        id: value.id,
      });
    } catch (err) {
      res.status(400).send("error delete cards");
      console.log(err.message);
    }
  },
};
