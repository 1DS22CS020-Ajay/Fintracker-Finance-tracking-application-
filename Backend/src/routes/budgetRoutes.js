import express from "express";
import { createBudget, getBudgets, getBudgetById, deleteBudget } from "../controllers/budgetController.js";
import { authenticate } from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/create", authenticate, createBudget);

router.get("/all", authenticate, getBudgets);

router.get("/:id", authenticate, getBudgetById);

router.delete("/:id", authenticate, deleteBudget);

export default router;
