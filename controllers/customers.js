const joi = require("joi");
const database = require("./database");
const filemgmt = require("../shared/filemgmt");
const bcrypt = require("bcrypt");

module.exports = {
  addCustomer: async function (req, res, next) {
    const reqBody = req.body;

    const schema = joi.object({
      id: joi.number().required(),
      name: joi.string().required().min(2).max(50),
      email: joi
        .string()
        .required()
        .regex(/^[^@]+@[^@]+$/),
      password: joi
        .string()
        .required()
        .regex(/^[a-zA-Z0-9!@#$%^&*].{4,16}$/),
      type: joi.string().required(),
    });

    const { error, value } = schema.validate(reqBody);

    if (error) {
      console.log(error);
      res.status(400).send("Error 400 - Bad Request");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    reqBody.password = await bcrypt.hash(reqBody.password, salt);

    const sql =
      "INSERT INTO customers(id, name, email, password, type )" +
      " VALUES(?,?,?,?,?);";

    try {
      const result = await database.query(sql, [
        reqBody.id,
        reqBody.name,
        reqBody.email,
        reqBody.password,
        reqBody.type,
      ]);
      res.json(value);
    } catch (err) {
      console.log(err);
      return;
    }

    res.status(200).json;
  },

  customersList: async function (req, res, next) {
    const param = req.query;

    const schema = joi.object({
      column: joi.string().valid("name", "email").default("name"),
      sort: joi.string().valid("ASC", "DESC").default("ASC"),
    });

    const { error, value } = schema.validate(param);

    if (error) {
      console.log(error);
      res.status(400).send("add failed");
      return;
    }

    const fieldsMap = new Map([
      ["name", "customers.name"],
      ["email", "customers.email"],
    ]);

    const sql = `SELECT * FROM customers.id, customers.name, customers.email,
            ORDER BY ${fieldsMap.get(value.column)} ${value.sort}`;

    try {
      const result = await database.query(sql);
      res.send(result[0]);
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  },

  exportCustomers: function (req, res, next) {
    const sql =
      "SELECT cust.name, cust.email, " +
      filemgmt.exportToFile(res, sql, "customers");
  },

  findCustomer: async function (req, res, next) {
    const param = req.query;

    const schema = joi.object({
      search: joi.string().required().min(2),
    });

    const { error, value } = schema.validate(param);

    if (error) {
      res.status(400).send(`search error: ${error}`);
      throw error;
    }

    const searchQuery = `%${value.search}%`;

    const sql = `SELECT customers.id, customers.name, customers.email,   
            ORDER BY customers.name ASC;`;

    try {
      const result = await database.query(sql, [
        searchQuery,
        searchQuery,
        searchQuery,
      ]);

      res.send(result[0]);
    } catch (err) {
      res.status(400).send(`search error: ${err}`);
      throw error;
    }
  },

  getCustomer: async function (req, res, next) {
    const sql = `SELECT * FROM customers WHERE id=?`;
    try {
      const result = await database.query(sql, [req.params.id]);
      res.json(result[0]);
    } catch (err) {
      console.log(err);
      res.json("error get customer");
    }
  },

  deleteCustomer: async function (req, res, next) {
    const schema = joi.object({
      id: joi.number.required(),
    });
    const { error, value } = schema.validate(req.params);
    if (error) {
      res.status(400).send("error delete customer");
      console.log(error.details[0].message);
      return;
    }
    const sql = `DELETE FROM customers WHERE id=?`;

    try {
      const result = await database.query(sql, [value.id]);
      res.json(result[0]);
    } catch (err) {
      res.status(400).send("error delete customer");
      console.log(err.message);
      return;
    }
  },
};
