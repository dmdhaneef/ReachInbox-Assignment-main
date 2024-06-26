const openAI = require("openai")
require("dotenv").config()

const openai = new openAI({
    apiKey:process.env.OPENAI_APIKEY
})


const readMailAndAssignLabel = async(data)=>{
    try {
        const chatCompletion = await openai.chat.completions.create({
            messages:[{role:'assistant',content:`I will pass in an email reply based on the content decide the label for the content as "Interested","Not Interested" and "More Information". If the reply is positive label it as interested if it is negative label it as not interested if user asks for more information label it as more information. This is the reply ${data.snippet} . Make sure you are only giving the answer as "Interested" , "Not Interested" and "More Information" do not include any other information in your response`,
        }],
        model: 'gpt-3.5-turbo'
        })
        let content = await chatCompletion.choices[0].message.content
        return content
    } catch (error) {
        console.log(error)
        return false
    }
}

const readLabelAndReply = async(data) =>{
    try {
        
        const chatCompletion = await openai.chat.completions.create({
            messages:[{role:'assistant',content:`I will pass in an email reply which also contains its label This is the reply ${data.reply} and this is the label ${data.label}. Now according to the label send a reply. if user is interested or need more information send a mail asking if they are available to schedule a demo call and suggest a particular date and time for example Monday 4pm you can also include date. If user is not interested ask them why they are not interested and if possible please provide any reasons for their disinterest and also highlight the product features so that it could attract the user interest. Use "Thanks and Regards,Sree Harsha Kamisetty,+917989050382" as the signature . Generate the subject and content seperately so that i can split them and extract. Do not add Recipient's Name in the content just greet them like Hello, and continue`,
        }],
        model: 'gpt-3.5-turbo'
        })
        let content = await chatCompletion.choices[0].message.content
        content = content.split("Content")
        return content
    } catch (error) {
        console.log(error)
        return false;
    }
}
readLabelAndReply("Interested")
module.exports={
    readMailAndAssignLabel,readLabelAndReply
}