Environment Configuration
Set up and manage your project’s environment configurations.

Environment configuration works in two layers:
Default Configuration: Your project’s baseline environment that all agents start from
Agent Adaptations: Changes agents make during work (ephemeral until imported)
Configuration changes only apply to new environments. Agent modifications remain in their environment until you import them with container-use config import.
​
The Configuration Workflow
1
Set Default Configuration

Configure your project’s baseline environment that all agents will start from
2
Agent Starts with Defaults

When an agent creates a new environment, it begins with your default configuration
3
Agent Adapts as Needed

During work, the agent may modify its environment configuration - adding tools, changing base images, or setting variables
4
View Agent Changes

Use container-use config show <env> to see what configuration changes the agent made
5
Import Useful Changes

Use container-use config import <env> to adopt the agent’s configuration improvements as your new defaults
​
Default Configuration
Configure the baseline environment that all agents will start from when working on your project. Instead of using the generic environment, you can specify exactly what base image, dependencies, and setup your project needs as defaults.
By default, environments use Ubuntu 24.04 with standard tools (git, curl, bash, apt).
​
Example: Python Project
To customize for your project:
# Set the base image to Python 3.11
container-use config base-image set python:3.11

# Add setup commands for system dependencies
container-use config setup-command add "apt-get update && apt-get install -y build-essential"

# Add install commands for project dependencies
container-use config install-command add "pip install -r requirements.txt"
container-use config install-command add "pip install pytest black flake8"

# Set environment variables
container-use config env set PYTHONPATH /workdir
container-use config env set DEBUG true

# View your configuration
container-use config show
Now all new agent environments will start with Python 3.11, your dependencies pre-installed, and environment variables configured.
​
Working with Configurations
Agents can modify their environment during work - installing tools, changing settings, or adapting to specific tasks. These changes are ephemeral until you import them.
​
View Configurations
# View your default configuration
container-use config show

# View an agent's modified configuration
container-use config show fancy-mallard

# Output as JSON
container-use config show --json
​
Import Agent Changes
When agents make useful changes, import them as your new defaults:
container-use config import fancy-mallard
​
Configuration Commands
​
Base Image
container-use config base-image set python:3.11
container-use config base-image get
container-use config base-image reset  # Resets to ubuntu:24.04
Using custom images: If you use custom base images with latest tags and update them frequently, consider using versioned tags (e.g., myimage:v1.2.3) for more predictable cache behavior.
​
Setup Commands
Run after pulling base image, before copying code:
container-use config setup-command add "apt-get update && apt-get install -y build-essential"
container-use config setup-command list
container-use config setup-command remove "apt-get install -y build-essential"
container-use config setup-command clear
​
Install Commands
Run after copying code:
container-use config install-command add "npm install"
container-use config install-command list
container-use config install-command remove "npm install"
container-use config install-command clear
​
Environment Variables
container-use config env set NODE_ENV development
container-use config env list
container-use config env unset NODE_ENV
container-use config env clear
​
Secrets
Configure secure access to API keys and credentials. See the complete secrets guide for all secret types and examples.
container-use config secret set API_KEY
container-use config secret list
container-use config secret unset API_KEY
container-use config secret clear
​
Configuration Storage
Configuration is stored in .container-use/environment.json. Commit this directory to share setup with your team.
​
Troubleshooting
If environment creation fails, check logs and fix the problematic command:
container-use log <environment-id>
container-use config setup-command remove "broken-command"
container-use config setup-command add "fixed-command"