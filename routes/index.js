var express = require("express");
var router = express.Router();
const customers = require("../controllers/customers");
const mwAuth = require("../midware/authn");
const authn = require("../controllers/authn");

router.get("/signin", function (req, res, next) {});

router.post("/login", authn.login);

router.get("/logout", mwAuth, function (req, res, next) {
  return res
    .clearCookie("access_token")
    .status(200)
    .send("Successfully logged out.");
});

router.get("/", mwAuth, function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/customers", customers.customersList);
router.get("/customers/:id", customers.getCustomer);
router.delete("/customers/", customers.deleteCustomer);
router.post("/customers", customers.addCustomer);

module.exports = router;
