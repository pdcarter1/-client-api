const express = require("express");
const { route,post } = require("./ticket-router");
const router = express.Router();
const { insertUser, getUserByEmail, getUserById, updatePassword, storeUserRefreshJWT } = require("../model/user/User.model");
const { hashPassword, comparePassword } = require('../helpers/bcrypt.helper');
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt.helper");
const { userAuthorization } = require("../middlewares/authorization.middleware");
const { resetPassReqValidation, updatePasswordValidation } = require("../middlewares/formValidation.middleware");
const { setPasswordResetPin, getPinByEmailPin, deletePin } = require("../model/resetPin/ResetPin.model");
const { emailProcessor } = require("../helpers/email.helper");
const { deleteJWT } = require("../helpers/redis.helper");

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

router.post('/reset-password', resetPassReqValidation, async (req, res) => {
    const {email} = req.body;

    const user = await getUserByEmail(email);

    if(user && user._id) {
        const setPin = await setPasswordResetPin(email);
        await emailProcessor({email, pin:setPin.pin, type:"request-new-password"});

        return res.json({
            status: "success",
            message: "If the email is exist in our database, the password reset pin will be sent shortly.",
        });

    }
    
    return res.json({
        status: "error", 
        message: "If the eamil exists in our database, the password reset pin will be sent shortly"
    });
});

// update password
router.patch('/reset-password', updatePasswordValidation, async (req, res) => {
    const { email, pin, newPassword } = req.body;

    const getPin = await getPinByEmailPin(email, pin);

    if(getPin._id) {
        const dbDate = getPin.addedAt;
        const expiresIn = 1;

        let expDate = dbDate.setDate(dbDate.getDate() + expiresIn);

        const today = new Date();

        if(today > expDate) {
            return res.json({status: "error", message: "Invalid or expired pin."});
        }

        const hashedPass = await hashPassword(newPassword);

        const user = await updatePassword(email, hashedPass);
       
        if(user._id) {

            await emailProcessor({ email, type: "update-password-success"});

            deletePin(email, pin);

            return res.json({ status: "success", message: "Your password has been updated." });
        }
    }
    res.json({ status: "error", message: "Unable to update your password please try again" });
    
});

// user logout and invalidate user jwts
router.delete("/logout", userAuthorization, async (req, res) => {    
    const {authorization} = req.headers;
    //this data is coming from the database
    const _id = req.userId;
    // delete accessJWT from redis database
    deleteJWT(authorization);
    //delete refreshJWT from the mongodb
    const result = await storeUserRefreshJWT(_id, '');
    
    if(result._id) {
        return res.json({status: "success", message: "You have logged out successfully"});
    }

    res.json({ status: "error", message: "Unale to log you out please try again later" });
});

module.exports = router;