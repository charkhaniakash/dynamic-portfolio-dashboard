const express = require("express");
const router = express.Router();

// Fully implemented in Step 5 — wired to Yahoo/Google services
router.get("/", (_req, res) => {
  res.json({ message: "Portfolio API — coming in Step 5" });
});

module.exports = router;
