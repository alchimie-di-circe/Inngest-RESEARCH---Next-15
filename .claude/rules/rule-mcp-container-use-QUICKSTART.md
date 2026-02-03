MCP-server Container-use QUICKSTART: Run your first parallel task

Let’s create a demo repository and ask your agent to build something:

# start a demo repo
mkdir hello
cd hello
git init
touch README.md
git add README.md
git commit -m "initial commit"


Now prompt your agent to do something:

"Create a Flask hello‑world app in Python."


After a short run you’ll see something like:

✅ App running at http://127.0.0.1:58455
🔍 View files:  container-use checkout {id}
📋 Dev log:     container-use log {id}


Replace {id} with your actual environment ID like fancy-mallard


Notice your local directory is still empty, because the agent worked in an isolated environment:

$ ls
README.md


You can see all environments with container-use list.
​


4. Review the work


See what the agent changed:

container-use diff {id}


Check out the environment locally to explore:

container-use checkout {id}
​

5. Accept or discard

Accept the work and keep the agent’s commit history:

container-use merge {id}


Or stage the changes to create your own commit:

container-use apply {id}


🎉 That’s it – you’ve run an agent in parallel, checked its work, and decided what to do with it.