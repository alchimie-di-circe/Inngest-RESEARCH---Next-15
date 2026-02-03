# Discovery Commands

Commands to find accounts, vaults, items, and fields in 1Password.

## Table of Contents

- [Account Discovery](#account-discovery)
- [Vault Discovery](#vault-discovery)
- [Item Discovery](#item-discovery)
- [Field Discovery](#field-discovery)
- [Search and Filter](#search-and-filter)
- [Common Patterns](#common-patterns)

---

## Account Discovery

### List All Accounts

```bash
op account list
```

**Example output:**

```text
URL                              EMAIL                    USER ID
mycompany.1password.com          you@company.com          XXXXXXXXXXXXXXXXXXXX
personal.1password.com           you@gmail.com            YYYYYYYYYYYYYYYYYYYY
```

### Get Current Account Details

```bash
op account get --account mycompany.1password.com
```

### Check Sign-In Status

```bash
op whoami
# Returns account info if signed in, error if not

op whoami --account mycompany.1password.com
# Check specific account
```

---

## Vault Discovery

### List All Vaults

```bash
op vault list --account mycompany.1password.com
```

**Example output:**

```text
ID                            NAME
xxxxxxxxxxxxxxxxxxxxxxxxxx    Private
yyyyyyyyyyyyyyyyyyyyyyyyyy    Shared
zzzzzzzzzzzzzzzzzzzzzzzzzz    Engineering
```

### Get Vault Details

```bash
op vault get "Private" --account mycompany.1password.com
```

### List Vaults with Item Counts

```bash
op vault list --account mycompany.1password.com --format json | \
  jq -r '.[] | "\(.name): \(.items // 0) items"'
```

---

## Item Discovery

### List All Items in Account

```bash
op item list --account mycompany.1password.com
```

### List Items in Specific Vault

```bash
op item list --vault "Private" --account mycompany.1password.com
```

### List Items by Category

```bash
# API Credentials only
op item list --categories "API Credential" --account mycompany.1password.com

# Multiple categories
op item list --categories "API Credential,Login" --account mycompany.1password.com
```

**Available categories:**

- `Login`
- `API Credential`
- `Database`
- `Server`
- `Secure Note`
- `Password`
- `Credit Card`
- `Identity`
- `Document`

### Get Item Details

```bash
# Basic info
op item get "Item Name" --account mycompany.1password.com

# Full JSON output
op item get "Item Name" --account mycompany.1password.com --format json

# By item ID (useful in scripts)
op item get abc123def456 --account mycompany.1password.com
```

---

## Field Discovery

### List All Fields in an Item

```bash
op item get "Item Name" --account mycompany.1password.com --format json | \
  jq '.fields[] | {label, type, id}'
```

**Example output:**

```json
{"label": "username", "type": "STRING", "id": "username"}
{"label": "password", "type": "CONCEALED", "id": "password"}
{"label": "Access Key ID", "type": "STRING", "id": "accesskeyid"}
{"label": "Secret Access Key", "type": "CONCEALED", "id": "secretaccesskey"}
```

### Get Specific Field Value

```bash
# Text field
op item get "Item Name" --account mycompany.1password.com --fields "username"

# Concealed field (MUST use --reveal)
op item get "Item Name" --account mycompany.1password.com --fields "password" --reveal

# Multiple fields
op item get "Item Name" --account mycompany.1password.com --fields "username,password" --reveal
```

### Field Names Are Case-Sensitive

```bash
# These are DIFFERENT fields:
op item get "Item" --fields "Access Key ID"      # Correct
op item get "Item" --fields "access key id"      # Won't match
op item get "Item" --fields "AccessKeyId"        # Won't match
```

### Common Field Names by Category

**Login:**

- `username`
- `password`
- `website` (URL)

**API Credential:**

- `credential` (often the API key)
- `username` (if applicable)
- `Access Key ID` (AWS-style)
- `Secret Access Key` (AWS-style)

**Database:**

- `username`
- `password`
- `hostname`
- `port`
- `database`

---

## Search and Filter

### Search by Title

```bash
# Case-insensitive search
op item list --account mycompany.1password.com | grep -i aws

# JSON output for parsing
op item list --account mycompany.1password.com --format json | \
  jq -r '.[] | select(.title | test("aws"; "i")) | .title'
```

### Search by Tag

```bash
op item list --tags "production" --account mycompany.1password.com
```

### Search by Vault and Category

```bash
op item list --vault "Engineering" --categories "API Credential" \
  --account mycompany.1password.com
```

### Full-Text Search

```bash
# Search across all fields (slower)
op item list --account mycompany.1password.com --format json | \
  jq -r '.[] | select(. | tostring | test("searchterm"; "i")) | .title'
```

---

## Common Patterns

### Find AWS Credentials

```bash
# List all AWS-related items
op item list --account mycompany.1password.com | grep -i aws

# Get specific AWS item fields
op item get "AWS Production" --account mycompany.1password.com --format json | \
  jq '.fields[] | select(.label | test("key"; "i")) | {label, value}'
```

### Find Database Credentials

```bash
# List database items
op item list --categories "Database" --account mycompany.1password.com

# Get connection details
op item get "Production DB" --account mycompany.1password.com --format json | \
  jq '{host: .fields[] | select(.label=="hostname") | .value,
       port: .fields[] | select(.label=="port") | .value,
       user: .fields[] | select(.label=="username") | .value}'
```

### Verify Item Exists Before Using

```bash
# Check if item exists (useful in scripts)
if op item get "Item Name" --account mycompany.1password.com >/dev/null 2>&1; then
    echo "Item exists"
else
    echo "Item not found"
fi
```

### Export Item List to CSV

```bash
op item list --account mycompany.1password.com --format json | \
  jq -r '["Title","Category","Vault"], (.[] | [.title, .category, .vault.name]) | @csv'
```

### Find Items Modified Recently

```bash
op item list --account mycompany.1password.com --format json | \
  jq -r 'sort_by(.updated_at) | reverse | .[:10][] | "\(.title) - \(.updated_at)"'
```

---

## Debugging Field Names

When `op item get --fields "fieldname"` returns nothing:

### Step 1: Get All Fields

```bash
op item get "Item Name" --account mycompany.1password.com --format json | jq '.fields'
```

### Step 2: Find the Exact Label

```bash
op item get "Item Name" --account mycompany.1password.com --format json | \
  jq -r '.fields[] | .label'
```

### Step 3: Use Exact Match

```bash
# Use the exact label from Step 2
op item get "Item Name" --account mycompany.1password.com --fields "Exact Label Here"
```

### Step 4: Check Field Type

If field is `CONCEALED`, you must use `--reveal`:

```bash
op item get "Item Name" --account mycompany.1password.com --format json | \
  jq '.fields[] | select(.label=="Secret Access Key") | .type'
# Output: "CONCEALED" → must use --reveal
```

---

## Quick Reference

```bash
# Accounts
op account list
op whoami

# Vaults
op vault list --account xxx

# Items
op item list --account xxx
op item list --vault "Vault" --account xxx
op item list --categories "API Credential" --account xxx

# Item details
op item get "Item" --account xxx
op item get "Item" --account xxx --format json

# Fields
op item get "Item" --account xxx --fields "fieldname"
op item get "Item" --account xxx --fields "secret" --reveal

# Debug field names
op item get "Item" --account xxx --format json | jq '.fields[] | .label'
```
