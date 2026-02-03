# Run 10 iterations with the default preset
task-master loop -n 10

# Use a specific preset
task-master loop -n 10 --prompt test-coverage
task-master loop -n 10 --prompt linting
task-master loop -n 10 --prompt duplication
task-master loop -n 10 --prompt entropy

# Use a custom prompt file
task-master loop -n 10 --prompt ./my-workflow.md

# Filter to tasks with a specific tag
task-master loop -n 10 --tag backend

# Custom progress file location
task-master loop -n 10 --progress-file ./my-progress.txt

# Output as JSON
task-master loop -n 10 --json