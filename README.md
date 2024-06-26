# Project Overview
  The aim of this project is to setup google and microsoft oauth to gain access to user emails. Assigning labels after reading the email context and dividing them into three categories "Interested", "Not interested" and "More information" using openAI. After assigning labels to emails, send automated emails to the user according the label
with the help of openai.
## Deployed Links 
- Backend : https://reachinbox-assignment-main.onrender.com
- API Documentation : https://documenter.getpostman.com/view/31963249/2sA35JyzDi
## Technologies used:
- Nodejs
- Expressjs
- openai API

## npm packages used:
- express
- cors
- dotenv
- googleapis
- ioredis
- axios
- bullmq
- openai
- azure/msal-node

## API Endpoints:

## Google

- ### GET /google/auth
  - To start google oauth process and authenticate users
- ### GET /gmail/userInfo/:userId
  - To get details of authenticated user
  - Example:
```json
GET /gmail/userInfo/dmdhaneef786gmail.com
Response:
{
    "emailAddress": "dmdhaneef786gmail..com",
    "messagesTotal": 58,
    "threadsTotal": 40,
    "historyId": "7202"
}
```
- ### POST /gmail/createLabel/:userId
    - To create custom labels for user
    - Request body contains the Label details
```json
{
    "name": "More Information",
    "messageListVisibility": "show",
    "labelListVisibility": "labelShow",
    "color":{
        "textColor": "#3c78d8",
        "backgroundColor": "#000000"
    }
}
```
- ### GET /gmail/list/:userId
  - To get list of emails of a user
  - Example:
```json
GET /gmail/list/dmdhaneef786gmail.com

Response:
{
    "messages": [
        {
            "id": "18e94c1ee9a46c66",
            "threadId": "18e94c129920d4ff"
        },
        {
            "id": "18e94c1579b51186",
            "threadId": "18e94c129920d4ff"
        },
        {
            "id": "18e945faa9cb1c9d",
            "threadId": "18e945faa9cb1c9d"
        },
        {
            "id": "18e944aab143c67e",
            "threadId": "18e944aab143c67e"
        },
        {
            "id": "18e94483145281bf",
            "threadId": "18e92a796487249a"
        }
  ]
}
```
- ### GET /gmail/read/:userId/messages/:id
 - This api endpoint reads the particular email and assigns a label according to the email content. And based on that label a reply would be generated using openai and sent to user
   ![image](https://github.com/SreeHarsha-Kamisetty/ReachInbox-Assignment/assets/146928943/2ca4a6e1-1938-4b13-a164-74afd7f2efa2)
- Label added to email according to the content.
  ![image](https://github.com/SreeHarsha-Kamisetty/ReachInbox-Assignment/assets/146928943/cadf8e33-fd58-48f7-b7ed-1a9625642ac1)
- Reply sent to the user based on the label
  - Example :
```json
GET /gmail/read/dmdhaneef786gmail.com/messages/18e94c1ee9a46c66

Response:
{
    "Message": "Label assigned. Reply scheduled"
}
```
 - if user is not interested, "Not Interested" label is assigned to their reply and reply would be sent.
    ![image](https://github.com/SreeHarsha-Kamisetty/Art-Gallery/assets/146928943/eeeade42-9c82-4ea2-9168-c4092431042f)
 - if user needs more information about the product "More Information" label is assigned.
    ![image](https://github.com/SreeHarsha-Kamisetty/Art-Gallery/assets/146928943/57335743-eb4c-461e-9804-a0e76a60c898)
- ### GET  /gmail/labels/:userId
    - To get a list of all available labels for a user including custom labels as well as default
    - Example:
      
```json
GET /gmail/labels/dmdhaneef786gmail.com
{
    "labels": [
        {
            "id": "CHAT",
            "name": "CHAT",
            "messageListVisibility": "hide",
            "labelListVisibility": "labelHide",
            "type": "system"
        },
        {
            "id": "SENT",
            "name": "SENT",
            "type": "system"
        },
        {
            "id": "INBOX",
            "name": "INBOX",
            "type": "system"
        },
        {
            "id": "IMPORTANT",
            "name": "IMPORTANT",
            "messageListVisibility": "hide",
            "labelListVisibility": "labelHide",
            "type": "system"
        },
        {
            "id": "TRASH",
            "name": "TRASH",
            "messageListVisibility": "hide",
            "labelListVisibility": "labelHide",
            "type": "system"
        },
        {
            "id": "DRAFT",
            "name": "DRAFT",
            "type": "system"
        },
        {
            "id": "SPAM",
            "name": "SPAM",
            "messageListVisibility": "hide",
            "labelListVisibility": "labelHide",
            "type": "system"
        },
        {
            "id": "CATEGORY_FORUMS",
            "name": "CATEGORY_FORUMS",
            "messageListVisibility": "hide",
            "labelListVisibility": "labelHide",
            "type": "system"
        },
        {
            "id": "CATEGORY_UPDATES",
            "name": "CATEGORY_UPDATES",
            "messageListVisibility": "hide",
            "labelListVisibility": "labelHide",
            "type": "system"
        },
        {
            "id": "CATEGORY_PERSONAL",
            "name": "CATEGORY_PERSONAL",
            "messageListVisibility": "hide",
            "labelListVisibility": "labelHide",
            "type": "system"
        },
        {
            "id": "CATEGORY_PROMOTIONS",
            "name": "CATEGORY_PROMOTIONS",
            "messageListVisibility": "hide",
            "labelListVisibility": "labelHide",
            "type": "system"
        },
        {
            "id": "CATEGORY_SOCIAL",
            "name": "CATEGORY_SOCIAL",
            "messageListVisibility": "hide",
            "labelListVisibility": "labelHide",
            "type": "system"
        },
        {
            "id": "STARRED",
            "name": "STARRED",
            "type": "system"
        },
        {
            "id": "UNREAD",
            "name": "UNREAD",
            "type": "system"
        },
        {
            "id": "Label_1",
            "name": "My Custom Label",
            "messageListVisibility": "show",
            "labelListVisibility": "labelShow",
            "type": "user"
        },
        {
            "id": "Label_3",
            "name": "Interested",
            "messageListVisibility": "show",
            "labelListVisibility": "labelShow",
            "type": "user",
            "color": {
                "textColor": "#42d692",
                "backgroundColor": "#000000"
            }
        },
        {
            "id": "Label_4",
            "name": "Not Interested",
            "messageListVisibility": "show",
            "labelListVisibility": "labelShow",
            "type": "user",
            "color": {
                "textColor": "#cc3a21",
                "backgroundColor": "#000000"
            }
        },
        {
            "id": "Label_5",
            "name": "More Information",
            "messageListVisibility": "show",
            "labelListVisibility": "labelShow",
            "type": "user",
            "color": {
                "textColor": "#3c78d8",
                "backgroundColor": "#000000"
            }
        }
    ]
}
```
## Outlook

- ### GET /outlook/list/:userId
  - This will fetch all the available mails in user inbox

- ### GET /outlook/read/:userId/:messageId
  - This endpoint is used to read a particular mail of a user and generate reply according to the email content
  - Original Email
    ![image](https://github.com/SreeHarsha-Kamisetty/ReachInbox-Assignment/assets/146928943/803fa008-c3f6-4ec9-8e17-3f1aaa37ae9b)
  - User Reply
    ![image](https://github.com/SreeHarsha-Kamisetty/ReachInbox-Assignment/assets/146928943/07030649-6185-4338-8f4a-88990e9e5a71)
  - Follow-up mail generated using openai
    ![image](https://github.com/SreeHarsha-Kamisetty/ReachInbox-Assignment/assets/146928943/54b28dd8-eae8-44ee-b3da-4a1abe977cd7)


### Video walkthrough
https://drive.google.com/file/d/1YKFF9HglYuzUy6qoGn8RCIuvpNw2Y8Pp/view?usp=sharing
