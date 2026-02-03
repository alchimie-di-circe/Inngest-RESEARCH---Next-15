Tools
Tools represent the capabilities of an MCP server. Here's the list of tools exposed by the local MCP server:

migrate-status: Checks your migration status via the prisma migrate status command.
migrate-dev: Creates and executes a migration via the prisma migrate dev --name <name> command. The LLM will provide the <name> option.
migrate-reset: Resets your database via the prisma migrate reset --force command.
Prisma-Postgres-account-status: Checks your authentication status with Prisma Console via the platform auth show --early-access command.
Create-Prisma-Postgres-Database: Creates a new Prisma Postgres database via the 'init --db --name' <name> '--region' <region> '--non-interactive' command. The LLM will provide the <name> and <region> options.
Prisma-Login: Authenticates with Prisma Console via the platform auth login --early-access command.
Prisma-Studio: Open Prisma Studio via the prisma studio command.
Usage
The local Prisma MCP server follows the standard JSON-based configuration for MCP servers. Here's what it looks like:

{
  "mcpServers": {
    "Prisma-Local": {
      "command": "npx",
      "args": ["-y", "prisma", "mcp"]
    }
  }
}

Sample prompts
Here are some sample prompts you can use when the MCP server is running:

"Log me into the Prisma Console."
"Create a database in the US region."
"Create a new Product table in my database."