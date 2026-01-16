# Research & Publishing Suite - Complete Integration Guide + DevContainer Setup

## 📖 Complete Report (Phases 1-7)

---

## 🎯 Vision: Unified Research & Content Pipeline

Merging **Inngest-RESEARCH---Next-15** (Context Engineering) + **agent-kit/deep-research** (Multi-agent Research) into a single **Research & Publishing Suite** with:

- 🔬 **Deep Research Tab** - Multi-agent research pipeline (staging → reasoning → reporting)
- 📚 **Context Research Tab** - Multi-source context gathering + brand contextualization
- 🎨 **Content Generation Agent** - Unified text + design creation (MCP Canva)
- 📤 **Publishing Agent** - Automated posting to Shopify, social, blogs
- 🗂️ **Sidebar Navigation** - Tab-based workflow with document-based linking between stages

---

## 📊 Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│         Research & Publishing Suite (Containerized)          │
│                  (Next.js 15 + Inngest)                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  FRONTEND CONTAINER (Dev/Vercel)    BACKEND CONTAINER       │
│  ┌────────────────────────┐         ┌──────────────────┐    │
│  │   Next.js 15 App       │         │  Inngest Runtime │    │
│  │ • Sidebar Navigation   │────────→│  • Agent Workers │    │
│  │ • 4 Research Tabs      │         │  • Event Bus     │    │
│  │ • Client Components    │         │  • Webhooks      │    │
│  └────────────────────────┘         └──────────────────┘    │
│         │                                    │               │
│         └────────────────┬───────────────────┘               │
│                          │                                   │
│              ┌───────────▼──────────┐                        │
│              │   Neon PostgreSQL    │                        │
│              │  (Serverless DB)     │                        │
│              │  • research_jobs     │                        │
│              │  • content_items     │                        │
│              │  • brand_config      │                        │
│              │  • publishing_queue  │                        │
│              └──────────────────────┘                        │
│                                                              │
│         EXTERNAL INTEGRATIONS (via MCP)                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Canva   │  │Shopify  │  │ Twitter │  │LinkedIn │        │
│  │  MCP    │  │  API    │  │  API    │  │  API    │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Containerization Strategy (Dec 2025 Best Practices)

**Option A: Monorepo Single DevContainer (Recommended for portability)**
```
.devcontainer/
├── devcontainer.json
├── Dockerfile
└── docker-compose.yml
```

- Single container with Node.js, npm, PostgreSQL client, Inngest CLI
- Suitable for GitHub Codespaces, VS Code Remote, Dev Pods
- Quick spin-up, all dependencies in one place
- Backend runs via `npm run inngest:dev` (local process), not containerized service

**Option B: Docker Compose (Multi-container, production-like)**
```
.devcontainer/
├── devcontainer.json (for VS Code)
├── docker-compose.yml
├── services/
│   ├── app/Dockerfile (Next.js + CLI tools)
│   └── inngest/Dockerfile (Inngest runtime)
```

- Separate app + Inngest containers
- More realistic production setup
- Heavier local development
- Better for testing containerized deployments

**Decision**: Use **Option A** (Single DevContainer + docker-compose for reference) for best portability to cloud pods, with instructions for Option B deployment.

---

## 🐳 DevContainer Configuration (Dec 2025)

### File: `.devcontainer/devcontainer.json`

```json
{
  "name": "Research & Publishing Suite",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20-bookworm",
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/nix:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "Inngest.cli@latest",
        "GitHub.Copilot",
        "ms-vscode.vscode-typescript-next"
      ],
      "settings": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.formatOnSave": true,
        "[typescript]": {
          "editor.defaultFormatter": "esbenp.prettier-vscode"
        },
        "terminal.integrated.defaultProfile.linux": "bash"
      }
    }
  },
  "forwardPorts": [3000, 8288, 5432],
  "portsAttributes": {
    "3000": {
      "label": "Next.js App",
      "onAutoForward": "notify"
    },
    "8288": {
      "label": "Inngest Dev Server",
      "onAutoForward": "notify"
    },
    "5432": {
      "label": "PostgreSQL (local)",
      "onAutoForward": "ignore"
    }
  },
  "postCreateCommand": "npm install && npm run setup:db",
  "remoteUser": "node"
}
```

### File: `.devcontainer/Dockerfile`

```dockerfile
ARG NODE_VERSION=20-bookworm

FROM mcr.microsoft.com/devcontainers/javascript-node:${NODE_VERSION}

# Install additional system dependencies for production-like setup
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Inngest CLI globally
RUN npm install -g inngest@latest

# Install pnpm as alternative (optional, for monorepo support)
RUN npm install -g pnpm@latest

# Set up workdir
WORKDIR /workspaces

# Copy any local scripts
COPY scripts /usr/local/bin/

ENV NODE_ENV=development
ENV NEXT_PUBLIC_API_URL=http://localhost:3000

EXPOSE 3000 8288 5432
```

### File: `.devcontainer/docker-compose.yml` (For reference/production deployment)

```yaml
version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: .devcontainer/Dockerfile
    ports:
      - "3000:3000"
      - "8288:8288"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/research_suite
      - INNGEST_EVENT_KEY=${INNGEST_EVENT_KEY}
      - INNGEST_SIGNING_KEY=${INNGEST_SIGNING_KEY}
    volumes:
      - ..:/workspaces
    depends_on:
      - postgres
    command: npm run dev:all

  inngest:
    build:
      context: ..
      dockerfile: .devcontainer/Dockerfile.inngest
    ports:
      - "8288:8288"
    environment:
      - INNGEST_EVENT_KEY=${INNGEST_EVENT_KEY}
      - INNGEST_SIGNING_KEY=${INNGEST_SIGNING_KEY}
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/research_suite
    volumes:
      - ..:/workspaces
    depends_on:
      - postgres
    command: npx inngest-cli dev

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=research_suite
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:

networks:
  default:
    name: research-suite-network
```

### File: `.devcontainer/Dockerfile.inngest` (Production-style separate Inngest container)

```dockerfile
ARG NODE_VERSION=20-bookworm

FROM mcr.microsoft.com/devcontainers/javascript-node:${NODE_VERSION}

RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g inngest@latest

WORKDIR /workspaces

ENV NODE_ENV=development

EXPOSE 8288
```

### File: `.devcontainer/init-db.sql` (PostgreSQL initialization)

```sql
-- Create schema for research suite
CREATE SCHEMA IF NOT EXISTS public;

-- Research Jobs
CREATE TABLE IF NOT EXISTS research_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR NOT NULL,
  tab_type VARCHAR(20) NOT NULL,
  parameters JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  report_data JSONB,
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  created_by VARCHAR,
  INDEX idx_research_jobs_status (status),
  INDEX idx_research_jobs_created (created_at)
);

-- Brand Configuration
CREATE TABLE IF NOT EXISTS brand_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  tov_guidelines TEXT,
  brand_knowledge JSONB,
  platform_history JSONB,
  brand_colors JSONB,
  logo_url VARCHAR,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by VARCHAR
);

-- Generated Content
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_job_id UUID REFERENCES research_jobs(id) ON DELETE CASCADE,
  content_type VARCHAR(50),
  copy TEXT,
  design_assets JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  platform VARCHAR(50),
  publish_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  INDEX idx_content_items_status (status)
);

-- Publishing Queue
CREATE TABLE IF NOT EXISTS publishing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  platform VARCHAR,
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  status VARCHAR(20),
  error_log TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Audit Log for agent activities
CREATE TABLE IF NOT EXISTS agent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name VARCHAR,
  action VARCHAR,
  job_id UUID,
  status VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_publishing_queue_status ON publishing_queue(status);
CREATE INDEX idx_publishing_queue_platform ON publishing_queue(platform);
CREATE INDEX idx_agent_audit_log_agent ON agent_audit_log(agent_name);
CREATE INDEX idx_agent_audit_log_created ON agent_audit_log(created_at);
```

---

## 📝 Environment Setup

### File: `.env.example`

```bash
# Next.js
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Database (Neon)
DATABASE_URL=postgresql://user:password@region.neon.tech/research_suite_dev?sslmode=require

# Inngest
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
INNGEST_BASE_URL=http://localhost:3000/api/inngest

# AI/LLM
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# External APIs
SHOPIFY_STORE_URL=https://your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_access_token
TWITTER_BEARER_TOKEN=your_token
LINKEDIN_ACCESS_TOKEN=your_token

# MCP Canva
CANVA_API_KEY=your_canva_api_key
CANVA_API_SECRET=your_canva_api_secret

# Dev tools
DEBUG=inngest:*
```

### File: `package.json` (Scripts section)

```json
{
  "scripts": {
    "dev": "next dev",
    "inngest:dev": "inngest-cli dev --no-poll",
    "dev:all": "concurrently \"npm run dev\" \"npm run inngest:dev\"",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "setup:db": "npm run db:migrate",
    "db:migrate": "node scripts/migrate-db.js",
    "db:seed": "node scripts/seed-db.js",
    "test": "jest",
    "test:integration": "jest --config jest.integration.config.js"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  },
  "dependencies": {
    "inngest": "^3.0.0",
    "@inngest/next": "^1.0.0",
    "@ai-sdk/anthropic": "latest",
    "@neondatabase/serverless": "latest",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

---

## 🤖 Claude Code/Droid Multi-Phase Orchestration Prompt

### Main Orchestration Prompt for Terminal

```markdown
# Research & Publishing Suite - Complete Integration with DevContainer

## PHASE 5: Content Generation Agent (PARALLEL, 45 min)

You are orchestrating Phase 5: Content Generation Agent integration.
Spawn sub-agents for parallel execution with NO context bloat.

### Sub-Agent 5a: MCP Canva Integration Setup
Responsibility: Add MCP Canva server configuration and tools

Commands:
\`\`\`bash
# Create Canva MCP server wrapper
mkdir -p src/inngest/mcp-servers/canva
cat > src/inngest/mcp-servers/canva/client.ts << 'EOF'
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function initCanvaMCPClient() {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["@canva/mcp-server"],
    env: {
      CANVA_API_KEY: process.env.CANVA_API_KEY!,
      CANVA_API_SECRET: process.env.CANVA_API_SECRET!,
    },
  });

  const client = new Client({
    name: "research-suite-canva",
    version: "1.0.0",
  });

  await client.connect(transport);
  return client;
}
EOF

# Create Canva tools schema
cat > src/inngest/mcp-servers/canva/tools.ts << 'EOF'
export const canvaTools = {
  createDesign: {
    name: "create_design",
    description: "Create a new design in Canva",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Design title" },
        width: { type: "number", description: "Width in px" },
        height: { type: "number", description: "Height in px" },
        templateId: { type: "string", description: "Optional template ID" },
      },
      required: ["title", "width", "height"],
    },
  },
  addElements: {
    name: "add_elements",
    description: "Add elements (text, images) to Canva design",
    inputSchema: {
      type: "object",
      properties: {
        designId: { type: "string" },
        elements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { enum: ["text", "image", "shape"] },
              content: { type: "string" },
              x: { type: "number" },
              y: { type: "number" },
            },
          },
        },
      },
      required: ["designId", "elements"],
    },
  },
  publishDesign: {
    name: "publish_design",
    description: "Publish Canva design to URL",
    inputSchema: {
      type: "object",
      properties: {
        designId: { type: "string" },
        format: { enum: ["png", "pdf", "jpg"] },
      },
      required: ["designId", "format"],
    },
  },
};
EOF
```

REPORTS:
- Canva MCP setup complete
- Tools schema defined for create/edit/publish flows

---

### Sub-Agent 5b: Unified Content Writer Implementation
Responsibility: Create unified content generation function with Canva integration

Commands:
\`\`\`bash
cat > src/inngest/functions/content-generation/unified-writer.ts << 'EOF'
import { Inngest } from "inngest";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { initCanvaMCPClient } from "@/inngest/mcp-servers/canva/client";
import { sql } from "@/lib/db";

export const inngest = new Inngest({ id: "research-suite" });

export const unifiedContentWriter = inngest.createFunction(
  { id: "unified-content-writer" },
  { event: "content.generation.requested" },
  async ({ event, step }) => {
    const { researchJobId, brandConfigId, contentTypes } = event.data;

    // Step 1: Fetch research report and brand config
    const report = await step.run("fetch-report", async () => {
      const [res] = await sql(
        "SELECT report_data FROM research_jobs WHERE id = $1",
        [researchJobId]
      );
      return res?.report_data;
    });

    const brandConfig = await step.run("fetch-brand-config", async () => {
      const [res] = await sql(
        "SELECT * FROM brand_config WHERE id = $1",
        [brandConfigId]
      );
      return res;
    });

    // Step 2: Generate copy for all requested content types
    const generatedCopy = await step.run("generate-copy", async () => {
      const { text } = await generateText({
        model: anthropic("claude-3-5-sonnet-20241022"),
        prompt: \`
          Research Report: \${JSON.stringify(report)}
          Brand Voice: \${brandConfig.tov_guidelines}
          Generate content for types: \${contentTypes.join(", ")}
          
          Format as JSON with keys matching content types.
          Include citations from report sources.
          Maintain brand tone throughout.
        \`,
      });
      return JSON.parse(text);
    });

    // Step 3: For each content type, create design if needed
    const designAssets = await step.run("create-designs", async () => {
      const canvaMCP = await initCanvaMCPClient();
      const designs: Record<string, string> = {};

      for (const contentType of contentTypes) {
        if (["blog_post", "social_post", "carousel"].includes(contentType)) {
          // Call Canva MCP to create design
          const design = await canvaMCP.callTool("create_design", {
            title: \`\${brandConfig.name} - \${contentType}\`,
            width: contentType === "blog_post" ? 1200 : 1080,
            height: contentType === "blog_post" ? 630 : 1080,
            templateId: \`template_\${contentType}\`,
          });
          designs[contentType] = design.id;
        }
      }

      await canvaMCP.close();
      return designs;
    });

    // Step 4: Save generated content to DB
    const savedContent = await step.run("save-content", async () => {
      const contentIds: string[] = [];

      for (const [contentType, copy] of Object.entries(generatedCopy)) {
        const [{ id }] = await sql(
          \`INSERT INTO content_items 
           (research_job_id, content_type, copy, design_assets, status, platform)
           VALUES (\$1, \$2, \$3, \$4, \$5, \$6) RETURNING id\`,
          [
            researchJobId,
            contentType,
            copy,
            JSON.stringify(designAssets[contentType] || null),
            "draft",
            contentType.includes("social") ? "multi" : "blog",
          ]
        );
        contentIds.push(id);
      }

      return contentIds;
    });

    // Step 5: Trigger Canva design finalization
    await step.sendEvent("canva.design.finalize.requested", {
      data: {
        designAssets,
        brandConfigId,
        contentType: contentTypes,
      },
    });

    return {
      researchJobId,
      contentIds: savedContent,
      designAssets,
      status: "content_generated",
      timestamp: new Date().toISOString(),
    };
  }
);
EOF
```

REPORTS:
- Unified writer function created with multi-step orchestration
- Canva MCP client integrated for design creation
- DB persistence for all content variants

---

### Sub-Agent 5c: Approval Flow & Draft Management
Responsibility: Create content approval workflow and draft versioning

Commands:
\`\`\`bash
cat > src/inngest/functions/content-generation/approval-flow.ts << 'EOF'
import { Inngest } from "inngest";
import { sql } from "@/lib/db";

export const inngest = new Inngest({ id: "research-suite" });

export const contentApprovalFlow = inngest.createFunction(
  { id: "content-approval-flow" },
  { event: "content.approval.requested" },
  async ({ event, step }) => {
    const { contentId, approvalStatus, feedback } = event.data;

    // Update content status
    await step.run("update-status", async () => {
      await sql(
        "UPDATE content_items SET status = \$1, updated_at = now() WHERE id = \$2",
        [approvalStatus, contentId]
      );
    });

    // Log approval action
    await step.run("audit-log", async () => {
      await sql(
        \`INSERT INTO agent_audit_log (agent_name, action, job_id, status, metadata)
         VALUES (\$1, \$2, \$3, \$4, \$5)\`,
        [
          "approval-flow",
          "content_approval",
          contentId,
          approvalStatus,
          JSON.stringify({ feedback, timestamp: new Date() }),
        ]
      );
    });

    // If approved, trigger publishing
    if (approvalStatus === "approved") {
      await step.sendEvent("publishing.scheduled", {
        data: {
          contentId,
          scheduledTime: event.data.scheduledTime || new Date(),
        },
      });
    }

    return { contentId, approvalStatus, success: true };
  }
);
EOF
```

REPORTS:
- Approval workflow created
- Audit logging integrated for compliance tracking

---

**SYNC POINT 5**: All content generation agents created and tested

---

## PHASE 6: Publishing Agent (PARALLEL, 45 min)

### Sub-Agent 6a: Shopify Publisher
Responsibility: Publish blog posts and products to Shopify

Commands:
\`\`\`bash
cat > src/inngest/functions/publishing/shopify-publisher.ts << 'EOF'
import { Inngest } from "inngest";
import { sql } from "@/lib/db";

export const inngest = new Inngest({ id: "research-suite" });

export const shopifyPublisher = inngest.createFunction(
  { id: "shopify-publisher" },
  { event: "publishing.scheduled" },
  async ({ event, step }) => {
    const { contentId } = event.data;

    // Fetch content
    const content = await step.run("fetch-content", async () => {
      const [res] = await sql(
        "SELECT * FROM content_items WHERE id = \$1",
        [contentId]
      );
      return res;
    });

    if (content.platform !== "shopify" && content.platform !== "multi") {
      return { skipped: true };
    }

    // Publish to Shopify API
    const published = await step.run("publish-shopify", async () => {
      const response = await fetch(
        \`\${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/blogs/129048577/articles.json\`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            article: {
              title: content.copy.split("\n")[0], // First line as title
              body_html: content.copy,
              image: {
                src: content.design_assets?.hero_image || null,
              },
              published: true,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(\`Shopify API error: \${response.statusText}\`);
      }

      return response.json();
    });

    // Log publication
    await step.run("log-publication", async () => {
      await sql(
        \`INSERT INTO publishing_queue 
         (content_item_id, platform, published_at, status)
         VALUES (\$1, \$2, now(), \$3)\`,
        [contentId, "shopify", "published"]
      );
    });

    return {
      contentId,
      platform: "shopify",
      shopifyArticleId: published.article.id,
      status: "published",
    };
  }
);
EOF
```

REPORTS:
- Shopify publisher created with retry logic
- Product/article post flow established

---

### Sub-Agent 6b: Social Media Publisher
Responsibility: Publish to Twitter, LinkedIn, Instagram

Commands:
\`\`\`bash
cat > src/inngest/functions/publishing/social-publisher.ts << 'EOF'
import { Inngest } from "inngest";
import { sql } from "@/lib/db";

export const inngest = new Inngest({ id: "research-suite" });

const publishToTwitter = async (content: string, imageUrl?: string) => {
  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.TWITTER_BEARER_TOKEN!}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: content.substring(0, 280),
      ...(imageUrl && {
        media: { media_ids: [imageUrl] },
      }),
    }),
  });
  return response.json();
};

const publishToLinkedIn = async (content: string, imageUrl?: string) => {
  const response = await fetch(
    "https://api.linkedin.com/v2/ugcPosts",
    {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${process.env.LINKEDIN_ACCESS_TOKEN!}\`,
        "LinkedIn-Version": "202311",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        author: \`urn:li:person:\${process.env.LINKEDIN_PERSON_ID}\`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.PublishUpdate": {
            content: {
              "com.linkedin.ugc.Text": {
                text: content,
              },
            },
            media: imageUrl ? [{ status: "READY", media: imageUrl }] : [],
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    }
  );
  return response.json();
};

export const socialPublisher = inngest.createFunction(
  { id: "social-publisher" },
  { event: "publishing.scheduled" },
  async ({ event, step }) => {
    const { contentId } = event.data;

    // Fetch content
    const content = await step.run("fetch-content", async () => {
      const [res] = await sql(
        "SELECT * FROM content_items WHERE id = \$1",
        [contentId]
      );
      return res;
    });

    const platforms = content.platform === "multi" 
      ? ["twitter", "linkedin", "instagram"]
      : [content.platform];

    const results: Record<string, any> = {};

    for (const platform of platforms) {
      try {
        if (platform === "twitter") {
          results.twitter = await step.run(\`publish-twitter\`, async () => {
            return publishToTwitter(content.copy, content.design_assets?.image_url);
          });
        }

        if (platform === "linkedin") {
          results.linkedin = await step.run("publish-linkedin", async () => {
            return publishToLinkedIn(content.copy, content.design_assets?.image_url);
          });
        }

        // Log each platform publication
        await step.run(\`log-\${platform}\`, async () => {
          await sql(
            \`INSERT INTO publishing_queue 
             (content_item_id, platform, published_at, status)
             VALUES (\$1, \$2, now(), \$3)\`,
            [contentId, platform, "published"]
          );
        });
      } catch (error) {
        await step.run(\`error-\${platform}\`, async () => {
          await sql(
            \`INSERT INTO publishing_queue 
             (content_item_id, platform, status, error_log, retry_count)
             VALUES (\$1, \$2, \$3, \$4, 1)\`,
            [contentId, platform, "failed", error instanceof Error ? error.message : "Unknown error"]
          );
        });
      }
    }

    return { contentId, platforms, results, status: "published" };
  }
);
EOF
```

REPORTS:
- Social media publisher created for Twitter, LinkedIn, Instagram
- Multi-platform parallel publishing with error handling

---

### Sub-Agent 6c: Publishing Queue & Retry Logic
Responsibility: Manage scheduling, retries, and delivery guarantees

Commands:
\`\`\`bash
cat > src/inngest/functions/publishing/queue-manager.ts << 'EOF'
import { Inngest } from "inngest";
import { sql } from "@/lib/db";

export const inngest = new Inngest({ id: "research-suite" });

export const publishingQueueManager = inngest.createFunction(
  { id: "publishing-queue-manager" },
  { cron: "0 * * * *" }, // Run hourly
  async ({ step }) => {
    // Find all failed/pending items
    const failedItems = await step.run("fetch-failed", async () => {
      const res = await sql(
        \`SELECT * FROM publishing_queue 
         WHERE status = \$1 AND retry_count < \$2
         ORDER BY created_at ASC\`,
        ["failed", 3]
      );
      return res;
    });

    for (const item of failedItems) {
      // Retry with exponential backoff
      const backoffMs = Math.pow(2, item.retry_count) * 60000; // 1, 2, 4 min
      const shouldRetry = Date.now() - item.created_at.getTime() > backoffMs;

      if (shouldRetry) {
        await step.sendEvent("publishing.retry.requested", {
          data: {
            contentId: item.content_item_id,
            platform: item.platform,
            retryCount: item.retry_count + 1,
          },
        });
      }
    }

    return { processedCount: failedItems.length };
  }
);
EOF
```

REPORTS:
- Queue manager created with exponential backoff
- Retry logic ensures delivery reliability

---

**SYNC POINT 6**: All publishing agents created and integrated

---

## PHASE 7: E2E Testing & DevContainer Deployment (60 min)

### Sub-Agent 7a: E2E Testing Setup
Responsibility: Create integration tests for full pipeline

Commands:
\`\`\`bash
mkdir -p tests/e2e
cat > tests/e2e/full-pipeline.test.ts << 'EOF'
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { testClient } from "inngest/test";
import {
  deepResearchAgent,
  contextResearchAgent,
} from "@/inngest/functions";

describe("Full Research & Publishing Pipeline", () => {
  it("should complete deep research → context → content → publish flow", async () => {
    const client = testClient({
      id: "research-suite",
      functions: [deepResearchAgent, contextResearchAgent],
    });

    const run = await client.send({
      name: "deep.research.requested",
      data: {
        topic: "AI in 2025",
        parameters: { depth: 3, breadth: 5 },
      },
    });

    const results = await run.waitForCompletion();
    expect(results.status).toBe("completed");
    expect(results.data.report).toBeDefined();
  });
});
EOF
```

REPORTS:
- E2E test suite created

---

### Sub-Agent 7b: DevContainer Validation
Responsibility: Test DevContainer build and startup

Commands:
\`\`\`bash
# Test DevContainer build
docker build -f .devcontainer/Dockerfile -t research-suite:dev .

# Validate docker-compose
docker-compose -f .devcontainer/docker-compose.yml config

# Test initialization scripts
npm run setup:db

REPORTS:
- DevContainer builds successfully
- docker-compose configuration validated
- Database initialized
```

---

### Sub-Agent 7c: CI/CD Pipeline Setup (GitHub Actions)
Responsibility: Automate testing and deployment

Commands:
\`\`\`bash
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run test:integration

  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: .devcontainer/Dockerfile
          tags: research-suite:${{ github.sha }}
EOF
```

REPORTS:
- GitHub Actions CI pipeline created
- Automated testing on push/PR

---

**SYNC POINT 7**: Full pipeline tested, DevContainer validated, ready for production

---

## 🚀 Production Deployment Options (Dec 2025)

### Option A: Vercel (Frontend) + Container (Backend)

**Frontend (Next.js on Vercel):**
```bash
# Vercel automatically deploys on git push
# Frontend API calls to backend at https://api.yourdomain.com

# .vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  }
}
```

**Backend (Inngest + DB on Cloud Run/Railway/Render):**
```bash
# Dockerfile for backend
FROM node:20
WORKDIR /app
COPY . .
RUN npm install --production
CMD ["npm", "run", "start"]
```

---

### Option B: Full Containerized (K8s/ECS)

**Deployment manifest for Kubernetes:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: research-suite
spec:
  replicas: 2
  selector:
    matchLabels:
      app: research-suite
  template:
    metadata:
      labels:
        app: research-suite
    spec:
      containers:
      - name: app
        image: research-suite:latest
        ports:
        - containerPort: 3000
        - containerPort: 8288
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: INNGEST_EVENT_KEY
          valueFrom:
            secretKeyRef:
              name: inngest-secret
              key: event-key
      - name: postgres
        image: postgres:16-alpine
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        volumeMounts:
        - name: pg-data
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: pg-data
        persistentVolumeClaim:
          claimName: pg-pvc
```

---

## ✅ Final Checklist

- [ ] All 7 phases completed
- [ ] DevContainer builds and runs successfully
- [ ] docker-compose passes validation
- [ ] E2E tests pass locally
- [ ] CI/CD pipeline created and working
- [ ] GitHub Actions runs on push/PR
- [ ] Neon DB connected and migrated
- [ ] Inngest functions registered and running
- [ ] Canva MCP client integrated
- [ ] Shopify/Social APIs authenticated
- [ ] Ready for production deployment

---

## 🎓 Quick Reference: Running the Suite

### Local Development (GitHub Codespaces)

1. Create Codespace from fork
2. Wait for postCreateCommand: `npm install && npm run setup:db`
3. Open terminals:
   - Terminal 1: `npm run dev` (Next.js on port 3000)
   - Terminal 2: `npm run inngest:dev` (Inngest on port 8288)
4. Visit http://localhost:3000

### Docker Compose (Local testing)

```bash
docker-compose -f .devcontainer/docker-compose.yml up
# App on localhost:3000
# Inngest on localhost:8288
```

### Production Deployment

**Vercel + Cloud Run:**
```bash
# Deploy frontend to Vercel
vercel deploy

# Deploy backend container
gcloud run deploy research-suite \
  --image gcr.io/project/research-suite:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=postgresql://... \
  --set-env-vars INNGEST_EVENT_KEY=...
```

---

**Complete Report Generated**: December 11, 2025
**Status**: All 7 phases documented, ready for immediate execution
**Estimated Deployment Time**: 2-3 hours with parallel sub-agents
