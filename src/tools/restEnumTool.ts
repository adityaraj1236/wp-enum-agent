import { createTool } from "@mastra/core/tools";
import { httpClient } from "../services/httpClient";
import { z } from "zod";

interface WPUser {
  id: number;
  slug: string;
  name: string;
}

export const restEnumTool = createTool({
  id: "rest_enum_tool",
//   name: "rest_enum_tool",
  description:
    "Enumerate WordPress users via REST API endpoint (/wp-json/wp/v2/users).",

  inputSchema: z.object({
    url: z.string().describe("Base URL of the WordPress target")
  }),

  execute: async (inputData: { url: string }) => {
    const { url } = inputData;
    
    try {
      const cleanUrl = url.replace(/\/$/, "");
      const endpoint = `${cleanUrl}/wp-json/wp/v2/users`;

      const response = await httpClient.get<WPUser[]>(endpoint);

      if (!response.success) {
        return {
          success: false,
          message: "network error during rest enumeration",
          error: response.error
        };
      }

      if (response.status !== 200) {
        return {
          success: false,
          message: "rest endpoint not accessible",
          status: response.status
        };
      }

      if (!Array.isArray(response.data)) {
        return {
          success: false,
          message: "unexpected response format from REST endpoint"
        };
      }

      const users = response.data.map((user) => ({
        id: user.id,
        username: user.slug,
        name: user.name
      }));

      return {
        success: true,
        technique: "REST_API",
        endpoint,
        count: users.length,
        users
      };

    } catch (error: any) {
      return {
        success: false,
        message: "unexpected error during REST enumeration",
        error: error.message
      };
    }
  }
});