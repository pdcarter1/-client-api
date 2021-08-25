const express = require("express");
const { route } = require("./ticket-router");
const router = express.Router();
const { insertUser, getUserByEmail, getUserById } = require("../model/user/User.model");
const { hashPassword, comparePassword } = require('../helpers/bcrypt.helper');
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt.helper");
const { userAuthorization } = require("../middlewares/authorization.middleware");

router.all("/", (req, res, next)=>{    
    //res.json({message: "return from user router"});
    next();
});

//get user profile router
router.get("/", userAuthorization, async (req, res) => {
    //this data is coming from the database
    const _id = req.userId;

    const userProf = await getUserById(_id);
    
    res.json({ user: userProf });
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
    console.log(user);
    
    const passFromDB = user && user._id ? user.password : null;

    if(!passFromDB) 
     return res.json({ status: "error", message: "Invalid email or password" });


    const result = await comparePassword(password, passFromDB);

    if(!result){
        return res.json({ status: "error", message: "Invalid email or password" });
        
    }
    
    const accessJWT = await createAccessJWT(user.email, `${user._id}`);
    const refreshJWT = await createRefreshJWT(user.email, `${user._id}`);

    res.json({ 
        status: "scuccess",
        message: "Login Successfully",
        accessJWT,
        refreshJWT,
    });
});

module.exports = router;