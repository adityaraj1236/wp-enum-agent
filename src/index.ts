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
                content:`Perform a complete WordPress security assessment on: ${targetUrl}
                STRICT EXECUTION RULES:
                1. You MUST call restEnumTool first.
                2. You MUST always call authorEnumTool even if REST succeeds.
                3. You MUST merge all discovered usernames.
                4. You MUST call loginAttemptTool for EVERY discovered username.
                5. Do NOT stop after first successful technique.
                6. Do NOT fabricate results.
                7. Provide structured findings.
                Return complete results only after all tools are executed.`
            }
        ])
        console.log(result.text)
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();