# AI-Driven WordPress User Enumeration Tool

## 1. Project Overview

The **AI-Driven WordPress User Enumeration Tool** is a Node.js + TypeScript security assessment utility designed to perform controlled and authorized testing on WordPress instances.

This tool simulates realistic enumeration scenarios observed during security assessments. It focuses on identifying exposed user accounts and validating weak credentials in intentionally vulnerable or self-hosted WordPress environments.

### Key Capabilities

- User enumeration via REST API (`/wp-json/wp/v2/users`)
- Fallback enumeration via author archive routing (`?author=1`)
- Controlled weak password testing using a small predefined wordlist
- Detection of rate limiting or protection mechanisms
- Structured JSON output mode (`--json`)
- Human-readable CLI output
- AI-generated professional security assessment summary

This tool is strictly intended for authorized lab environments.

---

## 2. Approach and Rationale

### Hybrid Architecture Design

This project follows a **hybrid architecture**:

- Core enumeration and login logic is implemented deterministically in code.
- The AI component is used only to generate a professional security assessment summary.

This separation ensures:

- Deterministic and testable logic
- Reduced LLM API calls
- Reliable JSON output
- Clean separation of concerns
- Improved maintainability

### Why Separate Deterministic Logic from AI Reasoning?

Security enumeration and credential validation are deterministic operations involving:

- HTTP request handling
- Response parsing
- Redirect detection
- Cookie inspection

These operations must remain predictable and reproducible. Using an LLM for such logic would introduce variability and unnecessary API usage.

The LLM is therefore used exclusively for:

- Interpreting structured results
- Generating a human-readable security summary
- Providing contextual security recommendations

### Ethical and Controlled Testing Focus

This tool intentionally limits:

- Wordlist size
- Number of login attempts
- Sequential execution (no parallel brute forcing)
- No bypass techniques
- No evasion methods

It simulates realistic security assessment behavior without causing excessive load or harm.

---

## 3. Architecture Overview

### Folder Structure
src/
├── agent/
│ wpAgent.ts
├── tools/
│ restEnumTool.ts
│ authorEnumTool.ts
│ loginAttemptTool.ts
├── services/
│ httpClient.ts
├── utils/
│ passwordGenerator.ts
├── index.ts



---

### Tool Responsibilities

#### restEnumTool
- Targets `/wp-json/wp/v2/users`
- Extracts exposed usernames
- Validates response format

#### authorEnumTool
- Uses `?author=1`
- Extracts username from redirect URL
- Acts as fallback if REST enumeration fails

#### loginAttemptTool
- Performs controlled weak password testing
- Detects successful login via redirect or cookie
- Detects rate limiting responses

---

## 4. Setup Instructions

### Requirements

- Node.js v18+
- npm
- Internet connection (for LLM summary generation)

### Install Dependencies
npm install

Create a .env file in the root directory.
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key_here

Ensure .env is included in .gitignore

### 5. Usage Instructions
Normal CLI Mode
npm run dev http://localhost:8080

Output:

Enumeration results

Weak credential findings

AI-generated professional security summary

## Run WordPress in Docker
docker run -d \
  --name wp-lab \
  -p 8080:80 \
  wordpress:latest

Access:

http://localhost:8080

Complete the WordPress installation.

Create a test admin user with a weak password (for controlled testing).

Then run:

npm run dev http://localhost:8080

```bash
