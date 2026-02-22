import * as  dotenv from 'dotenv';
import { wpAgent } from './agent/wpAgent';
dotenv.config();

async function main() {
    
    try {
        const targetUrl = process.argv[2] || process.env.TARGET_URL;

        if(!targetUrl) {    
            console.error("targret url is not defined in the environment variables.");
            return;
        }   
        console.log(`Starting enumeration for: ${targetUrl}`);

        //Agent logic goes here
        const result =  await wpAgent.generate([
            {
                role: "user",
               content: `Perform a complete WordPress security assessment on: ${targetUrl}

                MANDATORY STEPS - execute ALL in order:
                1. Call restEnumTool
                2. Call authorEnumTool  
                3. Merge & deduplicate all discovered usernames
                4. Call loginAttemptTool for EVERY unique username
                5. Return structured report

                Do NOT skip any step. Do NOT fabricate data.`
            }
        ])
        console.log(result.text)
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();