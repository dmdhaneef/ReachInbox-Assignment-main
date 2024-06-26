const express = require("express")


const MicrosoftRouter = express.Router()

const { redisConnection } = require("../utils/redis.utils")
const { PublicClientApplication, ConfidentialClientApplication } = require('@azure/msal-node');
const  axios  = require("axios");
require("dotenv").config()
const app = express();

// MSAL configuration
const config = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID, 
    authority: 'https://login.microsoftonline.com/common', 
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    // redirectUri: 'http://localhost:8080/microsoft/auth/callback' 
    redirectUri: 'https://reachinbox-assignment-main.onrender.com/microsoft/auth/callback'
  },
};

const pca = new ConfidentialClientApplication(config);

// Route to start the MS authentication flow
MicrosoftRouter.get('/auth', async (req, res) => {
    const authCodeUrlParameters = {
        
        scopes:['user.read','Mail.Read','Mail.Send'],
        redirectUri: 'https://reachinbox-assignment-main.onrender.com/microsoft/auth/callback',
      };
      

  try {
    // Get the authorization URL to redirect the user
    const authCodeUrl = await pca.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(authCodeUrl);
  } catch (error) {
    console.error('Error generating auth code URL:', error);
    res.status(500).send('Error generating auth code URL');
  }
});

// Route to handle the callback after MS authentication
MicrosoftRouter.get('/auth/callback', async (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    
    scopes:['user.read','Mail.Read','Mail.Send'],
    redirectUri: 'https://reachinbox-assignment-main.onrender.com/microsoft/auth/callback', // The same redirect URI used in the authorization URL
  };
  
  try {
    // Exchange the authorization code for an access token
    const response = await pca.acquireTokenByCode(tokenRequest);
    const accessToken = response.accessToken;
    
    // Use the access token to make requests to MS Graph API or other protected resources
    
    const userProfile = await axios('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const userData = userProfile.data;
    
    await redisConnection.set(userData.mail,accessToken);
    let message = `${userData.mail} . User authenticated`
    res.status(200).json({Message:message});
  } catch (error) {
    
    res.status(500).send(error);
  }
});

module.exports={
    MicrosoftRouter
}