jest.mock("../src/services/httpClient", () => ({
  httpClient: {
    get: jest.fn()
  }
}));

import { authorEnumTool } from "../src/tools/authorEnumTool";
import { httpClient } from "../src/services/httpClient";
const mockGet = httpClient.get as jest.Mock;

beforeEach(() => {
  mockGet.mockReset();
});
test("should return username when author redirect found", async () => {
  mockGet.mockResolvedValueOnce({
    success: true,
    headers: { location: "https://target.com/author/johndoe/" }
  });

  mockGet.mockResolvedValue({
    success: true,
    headers: {}
  });

  const result = await authorEnumTool.execute({ url: "https://target.com" });

  expect(result.success).toBe(true);
  expect(result.usernames).toContain("johndoe");
  expect(result.technique).toBe("AUTHOR_ARCHIVE");
});
test("should return failure when no author redirects found", async () => {
  mockGet.mockResolvedValue({
    success: true,
    headers: {}
  });

  const result = await authorEnumTool.execute({ url: "https://target.com" });

  expect(result.success).toBe(false);
  expect(result.message).toBe("No author archive usernames discovered");
  expect((result as any).usernames).toBeUndefined();
});

test("should not have duplicate usernames in result", async () => {
  mockGet.mockResolvedValue({
    success: true,
    headers: { location: "https://target.com/author/admin/" }
  });

  const result = await authorEnumTool.execute({ url: "https://target.com" });

  expect(result.success).toBe(true);
  expect(result.usernames).toHaveLength(1);
});

test("should handle exception and return error", async () => {
  mockGet.mockRejectedValue(new Error("ECONNREFUSED"));

  const result = await authorEnumTool.execute({ url: "https://target.com" });

  expect(result.success).toBe(false);
  expect(result.error).toBe("ECONNREFUSED");
});
test("should clean trailing slash from url", async () => {
  mockGet.mockResolvedValue({
    success: true,
    headers: { location: "https://target.com/author/admin/" }
  });

  await authorEnumTool.execute({ url: "https://target.com/" }); 
  expect(mockGet).toHaveBeenCalledWith(
    "https://target.com/?author=1", 
    expect.any(Object)
  );
});