import bcrypt  from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const registerUser = async (req,res) => {
    try{
        const { username, password } = req.body;

        if(typeof username !== "string" || typeof password !== "string" || !username.trim() || password.length<8){
            return res.status(400).json({
                message : "Enter a username and a password of atleast 8 characters.",
            });
        }

        const normalizedUsername = username.trim();

        const existingUser = await prisma.user.findUnique({
            where : {
                username : normalizedUsername,
            },
        });

        if(existingUser){
            return res.status(409).json({
                message : "username already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password,12);

        const user = await prisma.user.create({
            data : {
                username : normalizedUsername,
                passwordHash : passwordHash
            },
            select: {
                id : true,
                username : true,
                createdAt : true,
            },
        });

        return res.status(200).json({
            message : "Registration successful.",
            user,
        });
    } catch(error){
        // two simultaneous registrations with the same username.
        if (error.code === "P2002") {
          return res.status(409).json({
          message: "Username is already registered.",
          });
        }

        console.error("Registration error : ",error);

        return res.status(500).json({
          message: "Something went wrong during registration.",
          });
        }
    };

    

export const loginUser = async ( req,res) => {
    try{
        const { username,password } = req.body;
        
        if(typeof username !== "string" || typeof password !== "string" || !username.trim() || !password){
            return res.status(400).json({
                message : "username and password required.",
            });
        }

        const user = await prisma.user.findUnique({
            where : {
                username : username.trim()
            },
        });


        if(!user){
            return res.status(401).json({
                message : "Invalid username.",
            });
        }
        
        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if(!passwordMatches){
            return res.status(401).json({
                message : "Invalid password."
            })
        }

        if(!process.env.JWT_SECRET){
            throw new Error("JWT_SECRET is not configured.");
        }

        const token = jwt.sign({},
            process.env.JWT_SECRET,
            {
                subject : String(user.id),
                expiresIn : process.env.JWT_EXPIRES_IN || "1h"
            }
        );

        return res.status(200).json({
            message : "Login successful.",
            token : token,
            user : {
                id : user.id,
                username : user.username,
            },
        });
    }
    catch(error){
        console.error("Login error : ",error);

        return res.status(500).json({
            message : "Something went wrong during login."
        });
    }
};    