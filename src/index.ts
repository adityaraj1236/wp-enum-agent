import * as  dotenv from 'dotenv';
import { wpAgent } from './agent/wpAgent';
dotenv.config();

async function main() {
    
    try {
        const targetUrl = process.argv[2] || process.env.TARGET_URL;

        if(!targetUrl) {    
            console.error("TARGET_URL is not defined in the environment variables.");
            return;
        }   
        console.log(`Starting enumeration for: ${targetUrl}`);

        //Agent logic goes here
        console.log("Agent logic would be implemented here. Initial setup completed");
        const result =  await wpAgent.generate([
            {
                role: "user",
                content: `Perform WordPress user enumeration on the following target URL: ${targetUrl}. 
                          Use the available tools to enumerate users via the REST API endpoint and report your findings.`
            }
        ])
        console.log(result.text)
        
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();