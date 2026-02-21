import { Agent } from "@mastra/core/agent";
import { restEnumTool } from "../tools/restEnumTool";
import { authorEnumTool } from "../tools/authorEnumTool";
import { loginAttemptTool } from "../tools/loginattemptTool";

export const wpAgent = new Agent({
  id: "wp_enum_agent",
  name: "wp_enum_agent",
  description:
    "AI-driven WordPress security assessment agent for controlled lab environments.",

  model: "google/gemini-2.5-flash",

  instructions: `
You are a WordPress security assessment agent operating in a controlled lab environment.

Follow this workflow strictly:

1. Attempt user enumeration using the REST API tool.
2. If REST enumeration fails, attempt author archive enumeration.
3. If a valid username is discovered, attempt controlled weak password testing.
4. Stop immediately if protection mechanisms or rate limiting are detected.
5. Do not fabricate data.
6. Only use the provided tools for technical actions.

Provide a structured report including:
- Enumeration technique used
- Discovered usernames
- Weak credential findings (if any)
- Observed protections
- Overall security assessment summary
`,
  tools: {
    restEnumTool: restEnumTool,
    authorEnumTool: authorEnumTool,
    loginAttemptTool:loginAttemptTool
  }
});