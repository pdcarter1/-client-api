const express = require("express");
const { updateLanguageServiceSourceFile } = require("typescript");
const router = express.Router();
const { insertTicket, getTickets, getTicketById, updateClientReply, updateStatusClose, deleteTicket } = require("../model/ticket/Ticket.model");
const { userAuthorization } = require("../middlewares/authorization.middleware");
const { createNewTicketValidation, replyTicketMessageValidation } = require("../middlewares/formValidation.middleware");


router.all('/',  (req, res, next) => {
    //res.json({ message: "return from ticket router" });
    next();
});

router.post("/", createNewTicketValidation, userAuthorization, async (req, res) => {
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
        console.log(req);

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

//Get tickets by Id for a specific user
router.get("/:_id", userAuthorization, async (req, res) => {
    
    try {
        const {_id} = req.params;

        const clientId = req.userId;

        const result = await getTicketById(_id, clientId);

        return res.json({ status: 'success', result });

    } catch (error) {
        res.json({ status: 'error', message: error.message });
    }

});

//Update reply message from client
router.put("/:_id", replyTicketMessageValidation, userAuthorization, async (req, res) => {
    
    try {
        const {message, sender} = req.body;
        const { _id } = req.params;

        const result = await updateClientReply({ _id, message, sender});

        if(result._id){
            return res.json({ status: 'success', message: "your message updated" });
        }

        return res.json({ status: 'error', message: "unable to update your message please try again later" });

    } catch (error) {
        res.json({ status: 'error', message: error.message });
    }

});

//Update ticket status to closed
router.patch("/close-ticket/:_id", userAuthorization, async (req, res) => {
    
    try {        
        const { _id } = req.params;
        const clientId = req.userId;

        const result = await updateStatusClose({ _id, clientId });

        if(result._id){
            return res.json({ status: 'success', message: "The ticket has been closed" });
        }

        return res.json({ status: 'error', message: "unable to update the ticket" });

    } catch (error) {
        res.json({ status: 'error', message: error.message });
    }

});

//Delete a ticket
router.delete("/:_id", userAuthorization, async (req, res) => {

    try {
        const { _id } = req.params;
        const clientId = req.userId;

        const result = await deleteTicket({ _id, clientId });
                
        return res.json({ status: 'success', message: "The ticket has been deleted" });        

    } catch (error) {
        res.json({ status: 'error', message: error.message });
    }

});
module.exports = router;