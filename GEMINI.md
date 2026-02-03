# Research & Publishing Suite

## Project Overview

This project is a **Research & Publishing Suite** designed to unify deep research, context gathering, content generation, and multi-channel publishing into a single workflow. It leverages **AI Agents** orchestrated by **Inngest** to automate complex tasks.

**Key Technologies:**
*   **Framework:** Next.js 15 (App Router)
*   **Orchestration:** Inngest (Durable execution, workflows)
*   **AI:** Vercel AI SDK (Anthropic Claude models), AgentKit
*   **Database:** Neon PostgreSQL (Serverless) with Prisma ORM
*   **Vector DB:** Pinecone (Optional/Fallback)
*   **Language:** TypeScript

## Building and Running

### Prerequisites
*   Node.js 20+
*   PostgreSQL database (Neon recommended)
*   Required Environment Variables (see `.env.example`)

### Key Commands

*   **Install Dependencies:**
    ```bash
    npm install
    ```

*   **Database Setup:**
    ```bash
    npx prisma db push
    # or
    npm run setup:db  # if defined in scripts
    ```

*   **Start Development Servers:**
    To run both Next.js and Inngest dev server concurrently:
    ```bash
    npm run devall
    ```
    
    Or individually:
    ```bash
    npm run dev          # Next.js App (http://localhost:3000)
    npm run inngestdev   # Inngest Dev Server (http://localhost:8288)
    ```

*   **Linting & Formatting:**
    ```bash
    npm run lint
    npx prettier --write .
    ```

## Development Conventions

### Agent Guidelines
**CRITICAL:** This project relies heavily on specific agent workflows documented in `AGENTS.md` and `CLAUDE.md`.

*   **Testing:** Do **not** run full test suites locally on limited hardware. The project follows a "Delegate Testing" philosophy using tools like TestSprite MCP or Wallaby MCP (see `AGENTS.md`).
*   **Pre-commit:** Always run Prettier on modified files before committing:
    ```bash
    npx prettier --write <modified-files>
    ```

### Project Structure
*   `src/app`: Next.js App Router pages and API routes.
*   `src/inngest`: Inngest functions, agents, and workflow definitions.
*   `src/lib`: Shared utilities, DB clients, and API wrappers.
*   `prisma`: Database schema definition.
*   `.taskmaster`: Project management and task definitions.
*   `.claude/knowledge`: Documentation on architecture and patterns.
    *   `prisma/`: Prisma & Neon specific guides and best practices.

### Workflow
1.  **Deep Research:** Multi-step research orchestration.
2.  **Context Research:** Analysis and brand contextualization.
3.  **Content Generation:** AI-driven drafting and design (Canva MCP).
4.  **Publishing:** Multi-channel distribution (Shopify, Socials).
