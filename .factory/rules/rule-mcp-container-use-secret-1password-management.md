Secrets Management
Secure secret management for agents. Configure API keys, database credentials, and other sensitive data with 1Password, environment variables, and file references.

Container Use provides secure secret management for agents working with sensitive data like API keys, database credentials, and authentication tokens. Secrets are resolved within the container environment - agents can use your credentials without the AI model ever seeing the actual values.
​
How It Works
When you configure secrets, Container Use:
Stores secret references in your configuration (agents only see op://vault/item/field, not actual values)
Resolves references dynamically when commands run and injects actual values as environment variables in the container
Strips secrets from logs and command outputs to prevent leaks
Prevents easy extraction by agents (e.g., echo $API_KEY won’t show in logs)
This means:
✅ Your application code can access secrets normally
✅ Agents can run your code that uses secrets
❌ The AI model never sees actual secret values
❌ Secrets don’t appear in chat logs or model context
Secrets are configured per-project and apply to all new environments. Existing environments continue using their original configuration.
​
Secret Types
Container Use supports four secure secret reference formats:
🔐 1Password
🌍 Environment Variables
🏛️ HashiCorp Vault
📁 File References
Access secrets stored in 1Password vaults using the op:// schema:
# Basic format: op://vault/item/field
container-use config secret set API_KEY "op://vault/item/field"
container-use config secret set DB_PASSWORD "op://production/database/password"
container-use config secret set JWT_SECRET "op://team-vault/auth-service/jwt_secret"
Requires 1Password CLI to be installed and authenticated on your system.
​
Configuration Commands
# Set a secret using any supported schema
container-use config secret set <KEY_NAME> <secret_reference>

# Examples for each type
container-use config secret set DATABASE_URL "env://DATABASE_URL"
container-use config secret set API_TOKEN "op://vault/api/token"
container-use config secret set GITHUB_TOKEN "vault://credentials.github"
container-use config secret set SSH_KEY "file://~/.ssh/deploy_key"

# List all configured secrets (values are masked)
container-use config secret list

# Remove a secret
container-use config secret unset API_KEY

# Clear all secrets
container-use config secret clear

# View complete configuration including secrets
container-use config show
​
Using Secrets in Your Code
Once configured, secrets are available as environment variables inside agent environments:
🐍 Python
🟢 Node.js
🐚 Shell
import os
import requests

api_key = os.getenv("API_KEY")
response = requests.get("https://api.example.com", 
                      headers={"Authorization": f"Bearer {api_key}"})
Security Note: While your code can access secrets normally, Container Use automatically strips secret values from logs and command outputs. This means echo $API_KEY or similar commands won’t expose secrets in the development logs that agents or users can see.