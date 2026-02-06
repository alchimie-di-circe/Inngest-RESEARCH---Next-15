# Dependency Security Audit

1. Analyze project dependencies:
 . - Run the analysis in a sandbox using the latest Go version.
   - Check go.mod
   - List all dependencies with versions
   - Identify outdated packages

2. Security check:
   - Check for known vulnerabilities in Go
   - Identify dependencies with critical security issues

3. Upgrade those packages
   - Perform the updates in the sandbox.
   - Make sure the code still builds after updating.
