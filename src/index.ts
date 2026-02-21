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
        console.log("gent logic would be implemented here. Initial setup completed");
        const result =  await wpAgent.generate([
            {
                role: "user",
                content:`Perform a complete WordPress security assessment on: ${targetUrl}

You MUST execute ALL of the following steps in order:
1. Call restEnumTool to enumerate users via REST API
2. If no users found, call authorEnumTool as fallback
3. For EVERY discovered username, call loginattemptTool to test weak passwords
4. Report all findings including any discovered credentials`
            }
        ])
        console.log(result.text)
        
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();