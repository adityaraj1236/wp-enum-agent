export function generateCommonPasswords(username: string): string[] {
  return [
    username,
    `${username}123`,
    `${username}@123`,
    "admin",
    "admin123",
    "password",
    "123456",
    "qwerty",
    "editor123",
    "editor2"
  ];
}