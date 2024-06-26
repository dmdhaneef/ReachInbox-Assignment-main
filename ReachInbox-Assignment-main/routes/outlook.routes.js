const  axios  = require("axios");
const express = require("express")
const { redisConnection } = require("../utils/redis.utils");
const { readMailAndAssignLabel } = require("../utils/openAI.utils");
const {Queue} = require("bullmq")
const OutlookQueue = new Queue("outlook-reply",{connection:redisConnection})
const OutlookRouter = express.Router();

OutlookRouter.get("/list/:userId",async(req,res)=>{
  try {
    let {userId} = req.params
    let accessToken = await redisConnection.get(userId)
     const mails = await axios('https://graph.microsoft.com/v1.0/me/messages', {
       headers: {
         Authorization: `Bearer ${accessToken}`,
       },
     });
     
     let message = mails.data.value[0].bodyPreview.split("On")[0]
     
     res.status(200).send(mails.data)
  } catch (error) {
    console.log(error)
    res.status(400).json({Error:"Error while getting mail list"})
  }
})

OutlookRouter.get("/read/:userId/:messageId",async(req,res)=>{
  try {
    let {userId,messageId} = req.params
    let accessToken = await redisConnection.get(userId)
     const mails = await axios(`https://graph.microsoft.com/v1.0/me/messages/${messageId}`, {
       headers: {
         Authorization: `Bearer ${accessToken}`,
       },
     });
     let message = mails.data
     
     let content = message.bodyPreview.split("On")[0]
     let sender = message.sender.emailAddress.address
     
     let label = await readMailAndAssignLabel(content);
     OutlookQueue.add("send reply",{label:label,sender:sender,accessToken:accessToken})

     
     res.status(200).send("Email lablled. Reply scheduled")
  } catch (error) {
    console.log(error)
    res.status(400).json({Error:"Error while reading mail"})
  }
})


module.exports={
  OutlookRouter
}