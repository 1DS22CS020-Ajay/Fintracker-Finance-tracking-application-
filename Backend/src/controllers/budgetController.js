import prisma from "../lib/prisma.js";

const getBudgetDates = (startDate,endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if(Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())){
        return null;
    }

    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    if(start > end){
        return null;
    }

    return { start, end };
};

export const createBudget = async (req,res) => {
    try{
       const { name, amount, startDate, endDate, category} = req.body;
       const userId = req.user.id;

       if(typeof name !== "string" || !name.trim() || amount === undefined || amount === null || amount === "" || !startDate || !endDate){
        res.status(400).json({
            message : "Please provide all the details."
        });
        return;
       }

       const numericAmount = Number(amount);

       if(!Number.isFinite(numericAmount) || numericAmount <= 0){
        res.status(400).json({
            message : "Budget must be a positive amount."
        });
        return;
       }

       if(category !== undefined && category !== null && typeof category !== "string"){
        res.status(400).json({
            message : "Category must be a string."
        });
        return;
       }

       const dates = getBudgetDates(startDate,endDate);

       if(!dates){
        res.status(400).json({
            message : "Please provide valid date range.start date should be before the end date.",
        });
        return;
       }

       const budget = await prisma.budget.create({
        data : {
            name : name.trim(),
            amount : numericAmount,
            startDate : dates.start,
            endDate : dates.end,
            category : category?.trim() || null,
            userId,
        },
       });

       return res.status(201).json({
        message : "Budget created successfully.",
        budget,
       });
    }catch(error){
        console.error("Create budget error:",error);

        return res.status(500).json({
            message : "Failed to create budget.",
        });
    }
};

export const getBudgets = async ( req, res) => {
    try{
        const budgets = await prisma.budget.findMany({
           where : {
            userId : req.user.id,
           },
           orderBy : {
            createdAt : "desc",
           },
           include: {
            transactions: {
                where:{
                    userId : req.user.id,
                    type : "expense",
                },
                select:{
                    amount : true,
                    date : true,

                },
            },
           },
        });

        const budgetsWithSpending = budgets.map((budget) => {
            const transactionsInPeriod = budget.transactions.filter(
               (transaction) => 
                transaction.date >= budget.startDate &&
                transaction.date <= budget.endDate
               
            );

            const totalSpent = transactionsInPeriod.reduce(
                (total, transaction) => total + Number(transaction.amount),
                0
            );

            const budgetAmount = Number(budget.amount);

            const { transactions, ...budgetDetails} = budget;
            return {
                ...budgetDetails,
                totalSpent,
                remaining: budgetAmount - totalSpent,
                percentageSpent: (totalSpent/budgetAmount)*100,
            };
        });

        return res.status(200).json({
            budgets : budgetsWithSpending
        });
    }catch(error){
        console.error("Get budgets error:",error);

        return res.status(500).json({
            message : "Failed to fetch budgets.",
        });
    }
};

export const getBudgetById = async (req, res) => {
    try{
       const id = Number(req.params.id);
       if(!Number.isInteger(id) || id <= 0){
        res.status(400).json({
            message : "Invalid budget ID.",
        });
       }

       const budget = await prisma.budget.findFirst({
        where : {
            id,
            userId: req.user.id
        },
        include:{
            transactions: {
                where:{
                    userId: req.user.id,
                    type: "expense",
                },
                orderBy:{
                    date:"desc",
                },
            },
        },
       });

       if(!budget){
        res.status(404).json({
            message:"Budget not found"
        });
        return;
       }

       const transactionsInPeriod = budget.transactions.filter(
        (transaction) =>
            transaction.date >= budget.startDate &&
            transaction.date <= budget.endDate
       );

       const totalSpent = transactionsInPeriod.reduce(
          (total,transaction) => total + Number(transaction.amount),
          0
       );

       const budgetAmount = Number(budget.amount);
       return res.status(200).json({
        budget: {
        ...budget,
        totalSpent,
        remaining: budgetAmount - totalSpent,
        percentageSpent: (totalSpent / budgetAmount) * 100,
        },
       });
    }catch(error){
       console.error("Get budget by ID error:",error);
       return res.status(500).json({
          message: "Failed to fetch budget.",
       });
    }
};

export const deleteBudget = async (req,res) => {
    try{
       const id = Number(req.params.id);

       if(!Number.isInteger(id) || id <= 0){
          res.status(400).json({
            message:"Invalid budget ID.",
          });
       }

       const result = await prisma.budget.deleteMany({
        where:{
            id,
            userId:req.user.id,
        },
       });

       if(result.count === 0){
        res.status(404).json({
            message : "Budget not found.",
        });
       }

       return res.status(200).json({
        message: "Budget deleted successfully.",
       });

    }catch(error){
       console.error("Delete budget error:",error);

       return res.status(500).json({
        message: "Failed to delete budget.",
       });
    }
}

