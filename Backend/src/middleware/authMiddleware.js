import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";


export const authenticate = async ( req ,res ,next) => {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({
                message : "Authentication required,please provide a valid token.",
            });
            return;
        }

        const token = authHeader.split(" ")[1];

        if(!process.env.JWT_SECRET){
            throw new Error("jwt_token is not configured.");
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const userId = Number(decoded.sub);

        if(!userId || Number.isNaN(userId)){
            res.status(401).json({
                message : "Invalid token.",
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where : { id : userId},
            select : {
                id : true,
                username : true
            },
        });

        if(!user){
            res.status.json({
                message : "User no longer exists.",
            });
            return;
        }

        req.user = user;
        next();
    }catch(error){
        if(error.name === "TokenExpiredError"){
             res.status(401).json({
                message : "Token has expired.Please login again"
             });
             return;
        }

        if(error.name === "JsonWebTokenError"){
            res.status(401).json({
                message : "Invalid token"
            });
            return;
        }

        console.error("Authentication error:",error);
        return res.status(500).json({
            message : "Something went wrong during authentication.",
        });
    }
}