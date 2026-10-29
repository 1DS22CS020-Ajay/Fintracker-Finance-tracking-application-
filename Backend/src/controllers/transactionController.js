import prisma from "../lib/prisma.js";

export const createTransaction = async ( req, res) => {
    try{
        const { description, amount, category, type, date, budgetId} = req.body;
        const userId = req.user.id; //coming from the auth middleware
        
        if(typeof description !== "string" || !description.trim() || amount === undefined || amount === null || typeof category !== "string" || !category.trim() || typeof type !== "string" || !["income","expense"].includes(type.toLowerCase())){
            res.status(400).json({
                message : "Please provide description, amount, category, and type(income/expense).",
            });
            return;
        }

        const numericAmount = Number(amount);
        if(Number.isNaN(numericAmount) || numericAmount <= 0){
            res.status(400).json({
                message : "Amount must be a positive number.",
            });
        }

        if(date && Number.isNaN(new Date(date).getTime())){
            res.status(400).json({
                message : "Please provide a valid date.",
            });
        }
        
        let selectedBudgetId = null;

        if(budgetId !== undefined && budgetId !== null && budgetId !== ""){
            selectedBudgetId = Number(budgetId);

            if(!Number.isInteger(selectedBudgetId) || selectedBudgetId <= 0){
                res.status(400).json({
                    message : "Invalid budget Id.",
                });
                return;
            }

            const budget = await prisma.budget.findFirst({
                where : {
                    id : selectedBudgetId,
                    userId : req.user.id,
                },
            });

            if(!budget){
                res.status(400).json({
                    message : "Budget not found.",
                });
            }
        }
        const transaction = await prisma.transaction.create({
            data: {
                description : description.trim(),
                amount : numericAmount,
                category : category.trim(),
                type : type.toLowerCase(),
                date : date ? new Date(date) : undefined,
                userId,
                budgetId: selectedBudgetId,
            },
            select : {
                id: true,
                description: true,
                amount: true,
                category: true,
                type: true,
                date: true,
                createdAt: true,
             },
           });

           return res.status(201).json({
            message : "Transaction created successfully.",
            transaction,
           })
    }catch(error){
       console.error("Create transaction error : ",error);
       return res.status(500).json({
        message : "Something went wrong while creating the transaction.",
       });    
    }
};

export const getTransactions = async ( req, res) => {
    try{
       const transactions = await prisma.transaction.findMany({
        where : {userId : req.user.id },
        orderBy : { date : "desc"}
       })

       return res.status(200).json({
        transactions
       })
    }catch(error){
       console.error("get transactions error :",error);
       return res.status(500).json({
        message : "failed to fetch all transactions."
       });
    }
};

export const getTransactionById = async ( req, res) => {
    try{
       const id = Number(req.params.id);

       if(!Number.isInteger(id) || id <= 0){
        res.status(400).json({
            message : "Invalid transaction Id.",
        });
        return;
       }
       
       const transaction = await prisma.transaction.findFirst({
        where : {
            id,
            userId : req.user.id,
        },
       });

       if(!transaction){
        res.status(404).json({
            message : "Transaction not found.",
        });
        return;
       }

       return res.status(200).json({ transaction });

    }catch(error){
      console.error("Get transaction error :",error);
      return res.status(500).json({
        message : "Failed to fetch transaction."
      });
    }
};

export const deleteTransaction = async ( req,res) => {
    try{
       const id = Number(req.params.id);

       if(!Number.isInteger(id) || id <= 0) {
         res.status(400).json({
            message : "Invalid transaction Id",
         });
         return;
       }

       const result = await prisma.transaction.deleteMany({
          where : {
            id,
            userId : req.user.id,
          },
       });

       if( result.count === 0){
        res.status(400).json({
            message : "transaction not found.",
        });
        return;
       }

       return res.status(200).json({
        message : "Transaction deleted successfully."
       });
    }catch(error){

        console.error("Delete transaction error : ",error);
        return res.status(500).json({
            message : "Failec to delete transaction."
        });
        
    }
};