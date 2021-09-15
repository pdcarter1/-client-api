const express = require("express");
const { updateLanguageServiceSourceFile } = require("typescript");
const router = express.Router();
const { insertTicket, getTickets } = require("../model/ticket/Ticket.model");
const { userAuthorization } = require("../middlewares/authorization.middleware");
    
    // receive new ticket data
    // Autorize every request with jwt
    // insert in mongodb
    // Retrieve all the ticket for the specific user
    // Retrieve a ticket from mongodb
    // Update message conversation in the ticket database
    // update ticket status
    // delete ticket from mongodb 
    

router.all('/',  (req, res, next) => {
    //res.json({ message: "return from ticket router" });
    next();
});

router.post("/", userAuthorization, async (req, res) => {
    try {
        const { subject, sender, message } = req.body;

        const userid = req.userId;

        const ticktObj = {
            clientId: userid,
            subject,
            conversation: [
                {
                    sender,
                    message,
                }
            ]
        };

        // insert in mongodb
        const result = await insertTicket(ticktObj);
        

        if (result._id) {            
            return res.json({ status: 'success', message: "New ticket has been created" });
        }

        res.json({ status: 'error', message: "unable to create new ticket please try again later" });
        
    } catch (error) {
        res.json({ status: 'error', message: error.message });
    }
    
});

//Get all tickets for a specific user
router.get("/", userAuthorization, async (req, res) => {
    try {

        const userId = req.userId;
        
        const result = await getTickets(userId);

        return res.json({ status: 'success', result });        
       
    } catch (error) {
        res.json({ status: 'error', message: error.message });
    }

});
module.exports = router;