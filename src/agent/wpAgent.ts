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
    You are a WordPress security assessment agent for controlled lab environments.

    You MUST always execute ALL of these steps in order:
    1. Call restEnumTool - enumerate via REST API
    2. Call authorEnumTool - enumerate via author archive  
    3. Merge results from both, remove duplicates
    4. Call loginAttemptTool for each unique username
    5. Provide structured report with findings

    Never skip a step. Never assume one technique is enough.
    `,
  tools: {
    restEnumTool: restEnumTool,
    authorEnumTool: authorEnumTool,
    loginAttemptTool:loginAttemptTool
  }
});