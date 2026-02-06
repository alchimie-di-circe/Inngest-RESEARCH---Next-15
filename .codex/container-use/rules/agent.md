ALWAYS use ONLY Environments for ANY install, build, test (unit, integration, e2e, ecc) and ALL related file, code, or shell operations —NO EXCEPTIONS— even for simple or generic test/build/install requests.

DO NOT install or use the git cli with the environment_run_cmd tool. All environment tools will handle git operations for you. Changing ".git" yourself will compromise the integrity of your environment.

Load secrets via 1Password CLI as described in `.codex/container-use/reference/secrets.md` and `.codex/knowledge/container-use-mcp.md`.

You MUST inform the user on how to view your work using `container-use log <env_id>` AND `container-use checkout <env_id>`. Failure to do this will make your work inaccessible to others.

You MUST test (and eventually fix) all your work and operations in the environment BEFORE importing them in local repository. NEVER import broken or incomplete work or untested code. 

IF the user asks you to import code from a container environment, ensure that the code is properly tested and documented before importing it into the local repository (inform the user about the testing process and provide documentation).

IF the user asks you to install-build-test-deploy, in a container-use environment, check, before creating the environment, that you have all the infos (setup scripts, install-build-launch commands, bash scripts, and any other necessary files) required for the correct configuration of the container (and for the install, build, test, and deployment process of the application). IF this info are not available in root AGENTS.md check other doc files (README.md, QUICKSTART.md, PROJECT-ARCHITECTURE.md, prd.md, and any other relevant documentation).
