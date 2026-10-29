import "dotenv/config"
import express from "express"
import cors from "cors"
import authRoutes from "./src/routes/authRoutes.js"
import transactionRoutes from "./src/routes/transactionRoutes.js"
import budgetRoutes from "./src/routes/budgetRoutes.js"

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
    res.json({message : "Backend running.."})
})

app.use("/api/auth",authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets",budgetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`API running at http://localhost:${PORT}`);
});