# Programmatic Item Creation

Patterns for creating 1Password items programmatically, especially for Claude Code workflows.

## Table of Contents

- [The Scaffold Pattern](#the-scaffold-pattern)
- [Creating Items](#creating-items)
- [Field Types and Specifiers](#field-types-and-specifiers)
- [Item Categories](#item-categories)
- [Claude Code Workflow](#claude-code-workflow)
- [Editing Existing Items](#editing-existing-items)
- [Templates for Common Services](#templates-for-common-services)

---

## The Scaffold Pattern

When Claude Code (or any automation) needs to set up credential infrastructure:

1. **Claude discovers** vault structure
2. **Claude creates** item with placeholder values
3. **User populates** actual credentials in 1Password
4. **Claude continues** with configuration using the item

### Why This Pattern?

| Benefit             | Explanation                                        |
|---------------------|----------------------------------------------------|
| **Security**        | Claude never sees or handles raw secrets           |
| **User control**    | Credentials entered in trusted 1Password interface |
| **Correctness**     | Item structure (field names, types) pre-configured |
| **Reproducibility** | Same setup works across team members               |
| **Audit trail**     | 1Password logs who created/modified items          |

---

## Creating Items

### Basic Syntax

```bash
op item create --category "CATEGORY" \
  --title "Item Title" \
  --vault "Vault Name" \
  --account account.1password.com \
  "Field Name[type]=value" \
  "Another Field[type]=value"
```

### Example: AWS Credentials

```bash
op item create --category "API Credential" \
  --title "AWS Production" \
  --vault "Engineering" \
  --account mycompany.1password.com \
  "Access Key ID[text]=REPLACE_ME" \
  "Secret Access Key[concealed]=REPLACE_ME" \
  "Region[text]=us-east-1" \
  "Account ID[text]=123456789012"
```

### Example: Database Credentials

```bash
op item create --category "Database" \
  --title "Production PostgreSQL" \
  --vault "Engineering" \
  --account mycompany.1password.com \
  "hostname[text]=db.example.com" \
  "port[text]=5432" \
  "database[text]=production" \
  "username[text]=REPLACE_ME" \
  "password[concealed]=REPLACE_ME"
```

### Example: API Key

```bash
op item create --category "API Credential" \
  --title "Stripe API Keys" \
  --vault "Engineering" \
  --account mycompany.1password.com \
  "Publishable Key[text]=pk_live_REPLACE_ME" \
  "Secret Key[concealed]=sk_live_REPLACE_ME" \
  "Webhook Secret[concealed]=whsec_REPLACE_ME"
```

---

## Field Types and Specifiers

### Available Type Specifiers

| Specifier     | Use For            | Displayed As    |
|---------------|--------------------|-----------------|
| `[text]`      | Visible text       | Plain text      |
| `[concealed]` | Secrets, passwords | Hidden (dots)   |
| `[url]`       | URLs               | Clickable link  |
| `[email]`     | Email addresses    | Email format    |
| `[phone]`     | Phone numbers      | Phone format    |
| `[date]`      | Dates              | Date picker     |
| `[monthYear]` | Expiration dates   | MM/YYYY         |
| `[totp]`      | TOTP secrets       | Generates codes |

### Examples

```bash
# Text field (visible)
"API Endpoint[text]=https://api.example.com"

# Concealed field (hidden, requires --reveal to read)
"API Key[concealed]=REPLACE_ME"

# URL field (clickable)
"Documentation[url]=https://docs.example.com"

# Email field
"Support Email[email]=support@example.com"
```

### Default Type

If no type specified, defaults to `[text]`:

```bash
# These are equivalent:
"username=admin"
"username[text]=admin"
```

---

## Item Categories

### Available Categories

| Category         | Use For                         |
|------------------|---------------------------------|
| `Login`          | Website/app credentials         |
| `API Credential` | API keys, tokens, access keys   |
| `Database`       | Database connection credentials |
| `Server`         | SSH, server access              |
| `Secure Note`    | Text notes, documentation       |
| `Password`       | Standalone passwords            |
| `Credit Card`    | Payment cards                   |
| `Identity`       | Personal information            |

### Category-Specific Fields

Some categories have pre-defined fields:

**Login:**

```bash
op item create --category "Login" \
  --title "GitHub" \
  --vault "Private" \
  --account mycompany.1password.com \
  --url "https://github.com" \
  "username=REPLACE_ME" \
  "password[concealed]=REPLACE_ME"
```

**Database:**

```bash
op item create --category "Database" \
  --title "MySQL Production" \
  --vault "Engineering" \
  --account mycompany.1password.com \
  "type[text]=mysql" \
  "hostname[text]=REPLACE_ME" \
  "port[text]=3306" \
  "database[text]=REPLACE_ME" \
  "username[text]=REPLACE_ME" \
  "password[concealed]=REPLACE_ME"
```

---

## Claude Code Workflow

### Complete Flow

```bash
# Step 1: Claude discovers available vaults
op vault list --account mycompany.1password.com

# Step 2: Claude checks for existing items
op item list --account mycompany.1password.com | grep -i "service-name"

# Step 3: Claude creates item with placeholders
op item create --category "API Credential" \
  --title "AWS Service-Name" \
  --vault "Engineering" \
  --account mycompany.1password.com \
  "Access Key ID[text]=REPLACE_ME" \
  "Secret Access Key[concealed]=REPLACE_ME"

# Step 4: Claude tells user to populate item
# "Please update 'AWS Service-Name' in 1Password with your credentials"

# Step 5: User confirms completion
# User: "done"

# Step 6: Claude verifies and continues
op item get "AWS Service-Name" --account mycompany.1password.com --fields "Access Key ID"
# If returns "REPLACE_ME", credentials not updated
# If returns actual key, proceed with configuration
```

### Verification Script

```bash
#!/bin/bash
# verify-item-populated.sh
ITEM="$1"
ACCOUNT="$2"
FIELD="$3"

VALUE=$(op item get "$ITEM" --account "$ACCOUNT" --fields "$FIELD" 2>/dev/null)

if [[ -z "$VALUE" ]]; then
    echo "ERROR: Item not found or field missing"
    exit 1
elif [[ "$VALUE" == "REPLACE_ME" ]]; then
    echo "PENDING: Please populate '$FIELD' in 1Password item '$ITEM'"
    exit 2
else
    echo "OK: Field is populated"
    exit 0
fi
```

### Handling User Responses

When Claude creates an item and asks user to populate:

**User says "done":**

- Verify field no longer contains `REPLACE_ME`
- If still placeholder, remind user to update

**User provides credentials directly:**

- Politely redirect: "For security, please enter credentials directly in 1Password rather than in chat"
- The scaffold pattern exists specifically to avoid handling raw secrets

---

## Editing Existing Items

### Update Field Value

```bash
op item edit "Item Name" \
  --vault "Vault" \
  --account mycompany.1password.com \
  "Field Name=new value"
```

### Add New Field

```bash
op item edit "Item Name" \
  --vault "Vault" \
  --account mycompany.1password.com \
  "New Field[text]=value"
```

### Update Concealed Field

```bash
op item edit "Item Name" \
  --vault "Vault" \
  --account mycompany.1password.com \
  "Secret Key[concealed]=new_secret_value"
```

### Delete Field

```bash
# Fields cannot be directly deleted via CLI
# Workaround: Edit in 1Password app or recreate item
```

---

## Templates for Common Services

### AWS IAM User

```bash
op item create --category "API Credential" \
  --title "AWS [Environment] - [Purpose]" \
  --vault "Engineering" \
  --account mycompany.1password.com \
  "Access Key ID[text]=REPLACE_ME" \
  "Secret Access Key[concealed]=REPLACE_ME" \
  "Region[text]=us-east-1" \
  "Account ID[text]=REPLACE_ME" \
  "IAM User ARN[text]=arn:aws:iam::ACCOUNT:user/USERNAME"
```

### Database Connection

```bash
op item create --category "Database" \
  --title "[Service] [Environment] Database" \
  --vault "Engineering" \
  --account mycompany.1password.com \
  "type[text]=postgresql" \
  "hostname[text]=REPLACE_ME" \
  "port[text]=5432" \
  "database[text]=REPLACE_ME" \
  "username[text]=REPLACE_ME" \
  "password[concealed]=REPLACE_ME" \
  "SSL Mode[text]=require" \
  "Connection String[concealed]=REPLACE_ME"
```

### Generic API Service

```bash
op item create --category "API Credential" \
  --title "[Service Name] API" \
  --vault "Engineering" \
  --account mycompany.1password.com \
  "API Key[concealed]=REPLACE_ME" \
  "API Secret[concealed]=REPLACE_ME" \
  "Base URL[url]=https://api.service.com" \
  "Environment[text]=production" \
  "Documentation[url]=https://docs.service.com"
```

### OAuth Application

```bash
op item create --category "API Credential" \
  --title "[Service] OAuth App" \
  --vault "Engineering" \
  --account mycompany.1password.com \
  "Client ID[text]=REPLACE_ME" \
  "Client Secret[concealed]=REPLACE_ME" \
  "Redirect URI[url]=https://app.example.com/callback" \
  "Scopes[text]=read write" \
  "Token Endpoint[url]=https://auth.service.com/oauth/token"
```

### SSH Key Reference

```bash
op item create --category "Server" \
  --title "[Server] SSH Access" \
  --vault "Engineering" \
  --account mycompany.1password.com \
  "hostname[text]=server.example.com" \
  "port[text]=22" \
  "username[text]=deploy" \
  "SSH Key[text]=Stored in 1Password SSH Agent" \
  "Notes[text]=Use 1Password SSH agent for key management"
```

---

## Quick Reference

```bash
# Create item
op item create --category "API Credential" \
  --title "Title" --vault "Vault" --account xxx \
  "field[type]=value"

# Edit item
op item edit "Title" --vault "Vault" --account xxx \
  "field=new_value"

# Verify item exists
op item get "Title" --account xxx >/dev/null 2>&1 && echo "exists"

# Check if placeholder still present
op item get "Title" --account xxx --fields "field" | grep -q "REPLACE_ME"

# List item fields
op item get "Title" --account xxx --format json | jq '.fields[] | .label'
```

### Field Type Quick Reference

```bash
"visible[text]=value"           # Plain text
"secret[concealed]=value"       # Hidden
"link[url]=https://..."         # Clickable URL
"contact[email]=user@..."       # Email format
```
