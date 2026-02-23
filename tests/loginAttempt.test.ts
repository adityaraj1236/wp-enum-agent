jest.mock("../src/services/httpClient", () => ({
  httpClient: {
    post: jest.fn()
  }
}));

jest.mock("../src/utils/passwordgenerator", () => ({
  generateCommonPasswords: jest.fn(() => ["password123", "admin123", "123456"])
}));

import { loginAttemptTool } from "../src/tools/loginAttemptTool";
import { httpClient } from "../src/services/httpClient";

const mockPost = httpClient.post as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("loginAttemptTool", () => {
  test("should return success when wordpress_logged_in cookie found", async () => {
    mockPost.mockResolvedValue({
      success: true,
      status: 200,
      headers: {
        "set-cookie": ["wordpress_logged_in_abc=xyz; Path=/; HttpOnly"]
      },
      data: ""
    });

    const result = await loginAttemptTool.execute({
      url: "https://target.com",
      username: "admin"
    });

    expect(result.success).toBe(true);
    expect(result.technique).toBe("WEAK_PASSWORD");
    expect(result.username).toBe("admin");
    expect(result.password).toBe("password123");
  });
  test("should return success when 302 redirect to wp-admin found", async () => {
    mockPost.mockResolvedValue({
      success: true,
      status: 302,
      headers: {
        location: "https://target.com/wp-admin/",
        "set-cookie": []
      },
      data: ""
    });

    const result = await loginAttemptTool.execute({
      url: "https://target.com",
      username: "admin"
    });

    expect(result.success).toBe(true);
    expect(result.technique).toBe("WEAK_PASSWORD");
  });

  test("should detect rate limiting on 429 status", async () => {
    mockPost.mockResolvedValue({
      success: true,
      status: 429,
      headers: {},
      data: ""
    });

    const result = await loginAttemptTool.execute({
      url: "https://target.com",
      username: "admin"
    });

    expect(result.success).toBe(false);
    expect(result.protectionDetected).toBe(true);
    expect(result.message).toBe("Rate limiting detected");
  });
  test("should detect rate limiting on 403 status", async () => {
    mockPost.mockResolvedValue({
      success: true,
      status: 403,
      headers: {},
      data: ""
    });

    const result = await loginAttemptTool.execute({
      url: "https://target.com",
      username: "admin"
    });

    expect(result.success).toBe(false);
    expect(result.protectionDetected).toBe(true);
  });
  test("should detect rate limiting from response body text", async () => {
    mockPost.mockResolvedValue({
      success: true,
      status: 200,
      headers: {},
      data: "Too many login attempts. Try again later."
    });

    const result = await loginAttemptTool.execute({
      url: "https://target.com",
      username: "admin"
    });

    expect(result.success).toBe(false);
    expect(result.protectionDetected).toBe(true);
    expect(result.message).toBe("Rate limiting detected");
  });
  test("should return no credentials if all passwords fail", async () => {
    mockPost.mockResolvedValue({
      success: true,
      status: 200,
      headers: {},
      data: "incorrect password"
    });

    const result = await loginAttemptTool.execute({
      url: "https://target.com",
      username: "admin"
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("No valid credentials");
    expect(mockPost).toHaveBeenCalledTimes(3); 
  });
  test("should skip iteration if response.success is false", async () => {
    mockPost
      .mockResolvedValueOnce({ success: false })
      .mockResolvedValueOnce({ success: false })
      .mockResolvedValueOnce({
        success: true,
        status: 302,
        headers: { location: "https://target.com/wp-admin/" },
        data: ""
      });

    const result = await loginAttemptTool.execute({
      url: "https://target.com",
      username: "admin"
    });

    expect(result.success).toBe(true);
    expect(result.password).toBe("123456"); 
  });

  test("should handle exception and return error", async () => {
    mockPost.mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await loginAttemptTool.execute({
      url: "https://target.com",
      username: "admin"
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("ECONNREFUSED");
  });
  test("should clean trailing slash from url", async () => {
    mockPost.mockResolvedValue({
      success: true,
      status: 200,
      headers: {},
      data: ""
    });

    await loginAttemptTool.execute({
      url: "https://target.com/",
      username: "admin"
    });

    expect(mockPost).toHaveBeenCalledWith(
      "https://target.com/wp-login.php",
      expect.any(String),
      expect.any(Object)
    );
  });
  test("should handle set-cookie as array and detect login", async () => {
    mockPost.mockResolvedValue({
      success: true,
      status: 200,
      headers: {
        "set-cookie": [
          "some_other_cookie=abc;",
          "wordpress_logged_in_xyz=token; Path=/"
        ]
      },
      data: ""
    });

    const result = await loginAttemptTool.execute({
      url: "https://target.com",
      username: "admin"
    });

    expect(result.success).toBe(true);
    expect(result.technique).toBe("WEAK_PASSWORD");
  });

});