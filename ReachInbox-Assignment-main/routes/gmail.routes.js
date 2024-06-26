const express = require("express")
const axios = require("axios")
const { redisConnection } = require("../utils/redis.utils")
const { readMailAndAssignLabel } = require("../utils/openAI.utils")
const {Queue,Worker} = require("bullmq")
const LabelQueue = new Queue("reply",{connection:redisConnection})
const GmailRouter = express.Router()

// Get userinfo
GmailRouter.get("/userInfo/:userId",async(req,res)=>{
    try {
        let {userId} = req.params
        let access_token = await redisConnection.get(userId)
        
        let response = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/${userId}/profile`,{
            headers:{
                "Content-Type" : "application/json",
                "Authorization" :`Bearer ${access_token}`
            }
        })
       
        res.status(200).json(response.data)
    } catch (error) {
        console.log(error)
        res.status(400).json({Error:"Error while getting user data"})
    }
})


// create a custom label

GmailRouter.post("/createLabel/:userId",async(req,res)=>{
    try {
        let {userId} = req.params
        let access_token = await redisConnection.get(userId)
        
        let labelContent = req.body

        let response = await axios.post(`https://gmail.googleapis.com/gmail/v1/users/${userId}/labels`,labelContent,{
            headers:{
                "Content-Type" : "application/json",
                "Authorization" :`Bearer ${access_token}`
            }
        })

        res.status(200).json(response.data)
    } catch (error) {
        console.log(error)
        res.status(400).json({Error:"Error while creating new label"})
    }
})
// list of emails of user
GmailRouter.get("/list/:userId",async(req,res)=>{
    try {
        let {userId} = req.params
        let access_token = await redisConnection.get(userId)
        
        let response = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/${userId}/messages`,{
            headers:{
                "Content-Type" : "application/json",
                "Authorization" :`Bearer ${access_token}`
            }
        })
       
        res.status(200).json(response.data)
    } catch (error) {
        console.log(error)
        res.status(400).json({Error:"Error while getting email list"})
    }
})
// read mail/message by id assign label and  send reply
GmailRouter.get("/read/:userId/messages/:id",async(req,res)=>{
    try {
        let {userId,id} = req.params
        
        let access_token = await redisConnection.get(userId)
        
        let response = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${id}`,{
            headers:{
                "Content-Type" : "application/json",
                "Authorization" :`Bearer ${access_token}`
            }
        })
        const fromHeaderValue = response.data.payload.headers.find(header => header.name === 'From').value;
        const senderEmail = fromHeaderValue.match(/<([^>]+)>/)[1];
        if(senderEmail == userId){
            senderEmail = response.data.payload.headers.find(header => header.name === 'To').value.match(/<([^>]+)>/)[1]
        }
        
       let label = await readMailAndAssignLabel(response.data)
      
       if(!label) return res.status(400).json({Error:"Error while assigning label"});

       if(label == "Interested"){
        
       await assignLabel("Label_3", userId, id, access_token);
       }
       else if(label == "Not Interested"){
        
        await assignLabel("Label_4", userId, id, access_token);
       }
       else if(label == "More Information"){
        await assignLabel("Label_5", userId, id, access_token);
       }
       let jobData={
        userId:userId,
        id:id,
        access_token:access_token,
        label:label,
        reply:response.data.snippet,
        sender:senderEmail
       }
       LabelQueue.add("Send Reply",jobData);

        res.status(200).json({Message:"Label assigned. Reply scheduled"})
    } catch (error) {
        console.log(error)
        res.status(400).json({Error:"Error while reading message"})
    }
})


// get a list of labels available for user (custom and default)
GmailRouter.get("/labels/:userId",async(req,res)=>{
    try {
        let {userId,id} = req.params
        
        let access_token = await redisConnection.get(userId)
        
        let response = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/${userId}/labels`,{
            headers:{
                "Content-Type" : "application/json",
                "Authorization" :`Bearer ${access_token}`
            }
        })
       
        res.status(200).json(response.data)
    } catch (error) {
        console.log(error)
        res.status(400).json({Error:"Error while getting labels list"})
    }
})

// adding label to a mail
GmailRouter.post("/addLabel/:userId/messages/:id",async(req,res)=>{
    try {
        let {userId,id} = req.params
        
        let access_token = await redisConnection.get(userId)
        
        let response = await axios.post(`https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${id}/modify`,req.body,{
            headers:{
                "Content-Type" : "application/json",
                "Authorization" :`Bearer ${access_token}`
            }
        })
       
        res.status(200).json(response.data)
    } catch (error) {
        console.log(error)
        res.status(400).json({Error:"Error while adding label to message"})
    }
})


async function assignLabel(label,userId,id,access_token){
    try {
        let labelOptions={
            "addLabelIds":[`${label}`]
        }
        await axios.post(`https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${id}/modify`,labelOptions,{
            headers:{
                "Content-Type" : "application/json",
                "Authorization" :`Bearer ${access_token}`
            }
        })
        return true;
    } catch (error) {
        return false;
    }
}

module.exports={
    GmailRouter
}