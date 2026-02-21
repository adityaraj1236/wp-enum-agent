# AI-Driven WordPress User Enumeration Tool

## 1. Project Overview

The **AI-Driven WordPress User Enumeration Tool** is a Node.js + TypeScript security assessment utility designed to perform controlled and authorized testing on WordPress instances.

This tool simulates realistic enumeration scenarios observed during security assessments. It focuses on identifying exposed user accounts and validating weak credentials in intentionally vulnerable or self-hosted WordPress environments.

### Key Capabilities

- User enumeration via REST API (`/wp-json/wp/v2/users`)
- Fallback enumeration via author archive routing (`?author=1`)
- Controlled weak password testing using a predefined wordlist
- Detection of rate limiting or protection mechanisms
- Human-readable CLI output
- AI-generated professional security assessment summary

> **This tool is strictly intended for authorized lab environments. Do not run against production or unauthorized websites.**

---

## 2. Approach and Rationale

### Hybrid Architecture Design

This project follows a **hybrid architecture**:

- Core enumeration and login logic is implemented deterministically in code.
- The AI component (Mastra Agent + Gemini) orchestrates the workflow and generates a professional security assessment summary.

This separation ensures:

- Deterministic and testable core logic
- Reduced LLM API calls
- Reliable structured output
- Clean separation of concerns
- Improved maintainability

### Why Separate Deterministic Logic from AI Reasoning?

Security enumeration and credential validation are deterministic operations involving HTTP request handling, response parsing, redirect detection, and cookie inspection. These operations must remain predictable and reproducible. Using an LLM for such logic would introduce variability and unnecessary API usage.

The LLM is therefore used exclusively for:

- Orchestrating which tool to invoke next
- Interpreting structured results
- Generating a human-readable security summary
- Providing contextual security recommendations

### Ethical and Controlled Testing Focus

This tool intentionally limits:

- Wordlist size (small, common passwords only)
- Number of login attempts (sequential, not parallel)
- No bypass techniques or evasion methods
- Stops immediately on detection of rate limiting

---

## 3. Architecture Overview

### Folder Structure

```
src/
├── agent/
│   └── wpAgent.ts          # Mastra AI agent definition and tool bindings
├── tools/
│   ├── restEnumTool.ts     # REST API user enumeration
│   ├── authorEnumTool.ts   # Author archive fallback enumeration
│   └── loginAttemptTool.ts # Weak password credential testing
├── services/
│   └── httpClient.ts       # Shared HTTP client with error handling
├── utils/
│   └── passwordGenerator.ts # Common password wordlist generator
└── index.ts                # Entry point — CLI arg parsing and agent invocation
```

### Agent Workflow

```
START
  │
  ▼
restEnumTool  ──── success? ──── YES ──▶ get list of usernames
  │                                            │
  NO                                           │
  │                                            │
  ▼                                            │
authorEnumTool ── success? ── YES ──▶ get single username
  │                                            │
  NO                                           │
  │                                            ▼
  ▼                                   loginAttemptTool (per username)
 STOP                                          │
(no users found)                               ▼
                                      AI Summary Report
```

### Tool Responsibilities

**`restEnumTool`**
Targets `/wp-json/wp/v2/users`. Extracts all exposed usernames from the REST API response. Primary enumeration technique.

**`authorEnumTool`**
Uses `?author=1` and inspects the redirect URL for a username. Acts as fallback if REST enumeration fails or is blocked.

**`loginAttemptTool`**
Performs controlled weak password testing against `/wp-login.php`. Detects successful login via redirect or `wordpress_logged_in` cookie. Stops on rate limiting detection.

---

## 4. Setup Instructions

### Requirements

- Node.js v18+
- npm
- Docker Desktop (for running the test WordPress instance)
- A Google Gemini API key

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key_here
TARGET_URL=http://localhost:8080   # optional, can also be passed as CLI arg
```

> Make sure `.env` is listed in your `.gitignore` and never committed.

---

## 5. Usage Instructions

### Run the Tool

Pass the target URL as a CLI argument:

```bash
npm run dev http://localhost:8080
```

Or set `TARGET_URL` in your `.env` and run without arguments:

```bash
npm run dev
```

### Expected Output

```
Starting enumeration for: http://localhost:8080

[REST API] Found 2 users: admin, editor
[LOGIN] Testing admin...   ✓ Weak password found: admin123
[LOGIN] Testing editor...  ✗ No weak password found

AI Security Assessment Summary:
The target WordPress instance exposes user accounts via the unauthenticated
REST API endpoint /wp-json/wp/v2/users. Two user accounts were discovered.
The admin account was found to use a weak password (admin123), posing a
significant security risk. It is recommended to disable the REST API user
endpoint and enforce a strong password policy immediately.
```

---

## 6. Testing

### Lab Environment

The tool was tested against a local WordPress instance running in Docker:

| Container | Image | Port |
|-----------|-------|------|
| `wp-lab` | `wordpress:latest` | `8080:80` |
| `wp-db` | `mysql:5.7` | internal only |

### Docker Setup (docker-compose.yml)

```yaml
version: '3.8'
services:
  db:
    image: mysql:5.7
    container_name: wp-db
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wpuser
      MYSQL_PASSWORD: wppass

  wordpress:
    image: wordpress:latest
    container_name: wp-lab
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_NAME: wordpress
      WORDPRESS_DB_USER: wpuser
      WORDPRESS_DB_PASSWORD: wppass
    depends_on:
      - db
```

Start the containers:

```bash
docker-compose up -d
```

### Test Configuration

1. Open `http://localhost:8080` and complete the WordPress setup wizard.
2. Create a test admin user with username `admin` and a weak password (e.g., `admin123`).
3. Verify the REST API is accessible: `http://localhost:8080/wp-json/wp/v2/users`
4. Run the tool:

```bash
npm run dev http://localhost:8080
```

### Test Results

- REST API enumeration successfully discovered username: `admin`
- `loginAttemptTool` successfully matched password: `admin123`
- AI-generated summary correctly identified the vulnerability and provided remediation advice
- Rate limiting detection triggered correctly when tested against a hardened instance

---

## 7. Known Limitations

- **Author enumeration only checks `?author=1`** — discovers at most one user. If the admin is not user ID 1, they will be missed by the fallback technique.
- **Wordlist is intentionally small** — not suitable for real-world security assessments; designed for controlled lab testing only.
- **No WAF bypass support** — the tool will be blocked by Cloudflare or similar protections and will correctly report this.
- **Login detection is cookie/redirect based** — may not work on WordPress installations with customized login flows or SSO.
- **Sequential execution only** — no parallel brute forcing by design, to avoid causing load or triggering lockouts.
- **Single session HTTP client** — no cookie persistence between requests beyond what is explicitly passed.

---