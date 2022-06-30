var express = require("express");
var router = express.Router();
const cards = require("../controllers/cards");

res.sendFile();

router.get("/:id", cards.cardsList);
router.get("/cards", cards.cardsList);
router.post("/cards", cards.addCards);
router.get("/export", cards.exportCards);
router.put("/:id", cards.editCards);
router.delete("/:id", cards.deleteCards);
