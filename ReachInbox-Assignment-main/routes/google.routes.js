const express = require("express")
const {google} = require("googleapis")
const {OAuth2Client} = require('google-auth-library')
require("dotenv").config()
const axios = require("axios")
const { redisConnection } = require("../utils/redis.utils")
const oAuth2Client = new OAuth2Client({
    clientId:process.env.GOOGLE_CLIENTID,
    clientSecret:process.env.GOOGLE_CLIENTSECRET,
    redirectUri:process.env.GOOGLE_REDIRECTURI
})

const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://mail.google.com/",
"https://www.googleapis.com/auth/gmail.modify",
"https://www.googleapis.com/auth/gmail.compose",
"https://www.googleapis.com/auth/gmail.insert",
"https://www.googleapis.com/auth/gmail.labels",
"https://www.googleapis.com/auth/gmail.send",
"https://www.googleapis.com/auth/userinfo.profile",
"https://www.googleapis.com/auth/userinfo.email"
]

const GoogleRouter = express.Router()

GoogleRouter.get("/auth",(req,res)=>{
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope:scopes
    });
    res.redirect(authUrl)
})

GoogleRouter.get("/auth/callback",async(req,res)=>{
    const {code} = req.query;
    console.log(code)
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        const accessToken = tokens.access_token;
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        
        const userEmail = userInfoResponse.data.email;
        console.log('User Email:', userEmail);
        redisConnection.set(userEmail,accessToken)
        const message = `${userEmail} Authenticated`
        res.status(200).json({Message:message})
    } catch (error) {
        
        res.send("Error during authentication")
    }
})



module.exports={
    GoogleRouter
}