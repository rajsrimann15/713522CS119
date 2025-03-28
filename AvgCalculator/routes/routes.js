const express = require("express");
const { processNumbers } = require("../controllers/calculatorController");

const router = express.Router();

router.get("/:numberid", processNumbers);

module.exports = router;