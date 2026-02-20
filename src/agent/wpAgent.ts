import {Agent} from "@mastra/core/agent";
import { restEnumTool } from "../tools/restEnumTool";

export const wpAgent = new Agent({
    id: "wp_enum_agent",
  name: "wp_enum_agent",
  description:
    "An AI-assisted WordPress security assessment tool designed for controlled testing environments. It focuses on enumerating users via the REST API endpoint.",
    model: "google/gemini-2.5-flash",
    instructions: `
            You are a WordPress security assessment agent operating in a controlled lab environment.

            Your objectives:
            1. Attempt user enumeration using available tools.
            2. Analyze tool responses carefully before proceeding.
            3. If enumeration succeeds, report discovered usernames clearly.
            4. If the technique fails or the endpoint is inaccessible, explain why.
            5. Do not fabricate data.
            6. Only use the provided tools for technical actions.

            Provide structured and concise findings.` ,
    tools: {
    restEnumTool: restEnumTool
  }
});