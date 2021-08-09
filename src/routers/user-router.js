const express = require("express");
const { route } = require("./ticket-router");
const router = express.Router();
const { insertUser, getUserByEmail} = require("../model/user/User.model");
const { hashPassword, comparePassword } = require('../helpers/bcrypt.helper');
const { json } = require("body-parser");

router.all("/", (req, res, next)=>{    
    //res.json({message: "return from user router"});
    next();
});

//Create new user route
router.post("/", async (req, res) => {
    const { name, company, address, phoner, email, password } = req.body;
    try {
        const hashedPass = await hashPassword(password);

        const newUserObj = {
            name, company, address, phoner, email, password: hashedPass,
        };

        const result = await insertUser(newUserObj);
        console.log(result);
        
        res.json({ status: "success", message: "New user created", result });

    } catch (error) {
        console.log(error);
        res.json({ status: "error", message: error}) ;
    }    
});

//User sign in Router
router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    
    //get user with email from db
    //hash our password and compare with db

    if(!email || !password) {
        return res.json({ status: "error", message: "Invalid form submition" });
    }

    const user = await getUserByEmail(email);
    
    const passFromDB = user && user._id ? user.password : null;

    if(!passFromDB) 
     return res.json({ status: "error", message: "Invalid email or password" });

    const result = await comparePassword(password, passFromDB);
    console.log(result);

    res.json({ status: "scuccess", message: "Login Successfully"});
});

module.exports = router;