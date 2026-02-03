---
tags: [agentkit, setup, all-agents]
description: Deployment strategies for AgentKit
alwaysApply: false
---

Deployment
Deploy your AgentKit networks to production.

Deploying an AgentKit network to production is straightforward but there are a few things to consider:
Scalability: Your Network Agents rely on tools which interact with external systems. You’ll need to ensure that your deployment environment can scale to handle the requirements of your network.
Reliability: You’ll need to ensure that your AgentKit network can handle failures and recover gracefully.
Multitenancy: You’ll need to ensure that your AgentKit network can handle multiple users and requests concurrently without compromising on performance or security.
All the above can be easily achieved by using Inngest alongside AgentKit. By installing the Inngest SDK, your AgentKit network will automatically benefit from:
Multitenancy support with fine grained concurrency and throttling configuration
Retrieable and parallel tool calls for reliable and performant tool usage
LLM requests offloading to improve performance and reliability for Serverless deployments
Live and detailed observability with step-by-step traces including the Agents inputs/outputs and token usage
You will find below instructions to configure your AgentKit network deployment with Inngest.
​
Deploying your AgentKit network with Inngest
Deploying your AgentKit network with Inngest to benefit from automatic retries, LLM requests offloading and live observability only requires a few steps:
​
1. Install the Inngest SDK

npm

pnpm

yarn
npm install inngest
​
2. Serve your AgentKit network over HTTP
Update your AgentKit network to serve over HTTP as follows:
import { createNetwork } from '@inngest/agent-kit';
import { createServer } from '@inngest/agent-kit/server';

const network = createNetwork({
  name: 'My Network',
  agents: [/* ... */],
});

const server = createServer({
  networks: [network],
});

server.listen(3010, () => console.log("Agent kit running!"));
​
3. Deploy your AgentKit network
Configuring environment variables
Create an Inngest account and open the top right menu to access your Event Key and Signing Key:
Inngest Event Key and Signing Key
Create and copy an Event Key, and copy your Signing Key

Then configure the following environment variables into your deployment environment (ex: AWS, Vercel, GCP):
INNGEST_API_KEY: Your Event Key
INNGEST_SIGNING_KEY: Your Signing Key
Deploying your AgentKit network
You can now deploy your AgentKit network to your preferred cloud provider. Once deployed, copy the deployment URL for the final configuration step.
​
4. Sync your AgentKit network with the Inngest Platform
On your Inngest dashboard, click on the “Sync new app” button at the top right of the screen.
Then, paste the deployment URL into the “App URL” by adding /api/inngest to the end of the URL:
Inngest Event Key and Signing Key
Sync your AgentKit network deployment with the Inngest Platform

You sync is failing?
Read our troubleshooting guide for more information.
Once the sync succeeds, you can navigate to the Functions tabs where you will find your AgentKit network:
Inngest Event Key and Signing Key
Your AgentKit network is now live and ready to use

Your AgentKit network can now be triggered manually from the Inngest Dashboard or from your app using network.run().
​
Configuring Multitenancy and Retries
Multitenancy
Configure usage limits based on users or organizations.
Retries
Learn how to configure retries for your AgentKit Agents and Tools.
