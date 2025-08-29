// server/routes/createUser.js
import express from "express";
import { supabaseAdmin } from "../supabaseAdminClient.js";

const router = express.Router();

router.post("/create-user", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data });
});

export default router;
