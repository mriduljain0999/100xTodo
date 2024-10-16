const express = require('express');
const jwt = require('jsonwebtoken');
const {auth,JWT_SECRET} = require('./auth')
const mongoose = require('mongoose');
const { z } = require('zod');
const cors = require('cors');
const bcrypt = require('bcrypt')
const {UserModel , TodoModel} = require('./db');
const app = express();

mongoose.connect("mongodb+srv://mriduljain012:ahnw9kt8H5@cluster0.th8on.mongodb.net/100xTodo")

app.use(cors({
    origin: "https://100x-todo-frontend.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.json());

app.get("/",function(req,res){
    res.json("Hello");
})

app.post("/signup",async function(req,res){
    try{
        const reqBody = z.object({
            name:z.string(),
            email:z.string().email({message:"Invalid email address"}),
            password:z.string().regex(
                /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                { message: "Password must contain at least one uppercase letter, one number, special character, and be at least 8 characters long" })
        })
    
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
    
        const validateDataSuccess = reqBody.safeParse(req.body);
        if(!validateDataSuccess.success){
            let msg = "";
            for(i=0;i<validateDataSuccess.error.issues.length;i++){
                msg += validateDataSuccess.error.issues[i].message;
                if(i != validateDataSuccess.error.issues.length-1) msg += " and ";
            }
            res.send(msg);
            return;
        }
        const hashedPassword = await bcrypt.hash(password,10);
        await UserModel.create({
            name,
            email,
            password:hashedPassword
        });
        res.send("Signed up sucessfully!")
    }
    catch(e){
        res.status(500).send("Error while storing user data to database")
    }
})

app.post("/signin", async function(req,res){
    const email = req.body.email;
    const password = req.body.password;

    try{
        const user = await UserModel.findOne({
            email
        })
        if(!user){
            res.send("User not found!");
            return;
        }
        const passwordMatch = await bcrypt.compare(password,user.password);
        if(user && passwordMatch){
            const token = jwt.sign({
                userId:user._id.toString()
            },JWT_SECRET);

            res.json({
                status:true,
                token
            })
        }
        else{
            res.status(403).send("Bad credentials!");
        }
    }
    catch(e){
        res.status(403).send("Bad credentials")
    }

})

app.use(auth);

app.post("/add-todo",auth,async function(req,res){
    const desc = req.body.desc;
    const status = req.body.status;
    const userId = req.userId;

    const response = await TodoModel.create({
        desc,
        status,
        userId
    })
    res.send(response)
})

app.get("/username",auth,async function(req,res){
    const userId = req.userId;
    const user = await UserModel.findOne({
        _id:userId
    })
    res.send(user.name)
})

app.get("/get-todos",auth,async function(req,res){
    const userId = req.userId;
    const response = await TodoModel.find({
        userId
    })
    res.send(response)
})

app.delete("/delete",auth,async function(req,res){
    const { todo } = req.body; 
    const userId = req.userId
    const response = await TodoModel.findOneAndDelete({
        userId,
        desc:todo
    })
    if(!response){
        res.send("Todo not found!")
    }
    else{
        res.send("Todo deleted successfully!")
    }
})

app.put("/update-status",auth,async function(req,res){
    
    const userId = req.userId;
    const desc = req.body.desc;
    const status = req.body.status;
    const response = await TodoModel.findOneAndUpdate(
        {userId,desc},
        {status},
        {new : true}
    )
    res.send(response)
})

app.listen(3000);
