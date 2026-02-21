import { createTool } from "@mastra/core/tools";
import { httpClient } from "../services/httpClient";
import { z } from "zod";

export const authorEnumTool = createTool({
  id: "author_enum_tool",
  description:
    "Enumerate WordPress usernames via author archive redirection (?author=1).",

  inputSchema: z.object({
    url: z.string().describe("Base URL of the WordPress target")
  }),

//   execute: async ({ url }) => {
//     try {
//       const cleanUrl = url.replace(/\/$/, "");
//       const endpoint = `${cleanUrl}/?author=1`;

//       const response = await httpClient.get(endpoint, {
//         maxRedirects: 0,
//         validateStatus: () => true
//       });

//       if (!response.success) {
//         return {
//           success: false,
//           message: "Network error during author enumeration"
//         };
//       }
//       const location =
//         (response as any)?.headers?.location || "";

//       if (location && location.includes("/author/")) {
//         const username = location.split("/author/")[1].split("/")[0];

//         return {
//           success: true,
//           technique: "AUTHOR_ARCHIVE",
//           username
//         };
//       }

//       return {
//         success: false,
//         message: "No author redirect detected"
//       };

//     } catch (error: any) {
//       return {
//         success: false,
//         message: "Unexpected error during author enumeration",
//         error: error.message
//       };
//     }
//   }

execute: async ({ url }) => {
  try {
    const cleanUrl = url.replace(/\/$/, "");
    const discoveredUsers = new Set<string>();

    // scanning authors id 1 to 10 can be adjusted   as we need 
    for (let i = 1; i <= 10; i++) {
      const endpoint = `${cleanUrl}/?author=${i}`;

      const response = await httpClient.get(endpoint, {
        maxRedirects: 0,
        validateStatus: () => true
      });

      if (!response.success) continue;

      const location = (response as any)?.headers?.location || "";

      if (location && location.includes("/author/")) {
        const username = location.split("/author/")[1].split("/")[0];

        if (username) {
          discoveredUsers.add(username);
        }
      }
    }

    if (discoveredUsers.size > 0) {
      return {
        success: true,
        technique: "AUTHOR_ARCHIVE",
        usernames: Array.from(discoveredUsers)
      };
    }

    return {
      success: false,
      message: "No author archive usernames discovered"
    };

  } catch (error: any) {
    return {
      success: false,
      message: "Unexpected error during author enumeration",
      error: error.message
    };
  }
}

});