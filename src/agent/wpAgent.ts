import { Agent } from "@mastra/core/agent";
import { restEnumTool } from "../tools/restEnumTool";
import { authorEnumTool } from "../tools/authorEnumTool";
import { loginAttemptTool } from "../tools/loginattemptTool";

export const wpAgent = new Agent({
  id: "wp_enum_agent",
  name: "wp_enum_agent",
  description:
    "AI-driven WordPress security assessment agent for controlled lab environments.",

  model: 'google/gemini-2.5-flash',
  

   instructions: `
You are an expert WordPress security assessment agent operating in a controlled lab environment.

## OBJECTIVE
Systematically enumerate WordPress users and attempt credential validation using multiple techniques.

## MANDATORY EXECUTION STEPS - FOLLOW IN EXACT ORDER

### Step 1: REST API Enumeration
- Call restEnumTool with the target URL
- Extract ALL usernames and user IDs from the response
- Note any errors or blocked responses

### Step 2: Author Archive Enumeration  
- Call authorEnumTool with the target URL
- Extract ALL usernames discovered via author parameter fuzzing
- Note any redirects or blocked responses

### Step 3: Merge & Deduplicate
- Combine results from Step 1 and Step 2
- Remove duplicate usernames
- Create a final unique username list
- If both techniques failed, still proceed and report failure

### Step 4: Login Attempts
- Call loginAttemptTool for EACH unique username found
- Use common passwords for each attempt
- Do NOT skip any username
- Record success/failure for each attempt

### Step 5: Final Report
Provide a structured report with:
- Target URL
- Usernames found (source: REST / Author / Both)
- Login attempt results (success/failure per username)
- Overall risk assessment
- Recommendations

## RULES
- NEVER skip any step even if previous step returns no results
- NEVER assume the target is not vulnerable without running all tools
- Always run Step 4 even if only 1 username is found
- Be precise and systematic
`,
  tools: {
    restEnumTool: restEnumTool,
    authorEnumTool: authorEnumTool,
    loginAttemptTool:loginAttemptTool
  }
});
