---
tags: [database, prisma, mcp, all-agents]
description: Prisma MCP configuration
alwaysApply: false
---

{
  "mcpServers": {
    "Prisma-Local": {
      "command": "npx",
      "args": ["-y", "prisma", "mcp"]
    }
  }
}



npx prisma init --db