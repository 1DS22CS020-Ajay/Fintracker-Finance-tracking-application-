import express from "express";
import { createTransaction,getTransactions,getTransactionById, deleteTransaction } from "../controllers/transactionController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router()

router.post("/create",authenticate,createTransaction);
router.get("/all",authenticate,getTransactions);
router.get("/:id",authenticate,getTransactionById);
router.delete("/:id",authenticate,deleteTransaction);

export default router;