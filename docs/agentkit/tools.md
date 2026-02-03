---
tags: [agentkit, api-reference, all-agents]
description: Tool integration with AgentKit
alwaysApply: false
---

Tools
Extending the functionality of Agents for structured output or performing tasks.

Tools are functions that extend the capabilities of an Agent. Tools have two core uses:
Calling code, enabling models to interact with systems like your own database or external APIs.
Turning unstructured inputs into structured responses.
A list of all available Tools and their configuration is sent in an Agent’s inference calls and a model may decide that a certain tool or tools should be called to complete the task. Tools are included in an Agent’s calls to language models through features like OpenAI’s “function calling” or Claude’s “tool use.”
​
Creating a Tool
Each Tool’s name, description, and parameters are part of the function definition that is used by model to learn about the tool’s capabilities and decide when it should be called. The handler is the function that is executed by the Agent if the model decides that a particular Tool should be called.
Here is a simple tool that lists charges for a given user’s account between a date range:
import { createTool } from '@inngest/agent-kit';

const listChargesTool = createTool({
  name: 'list_charges',
  description:
    "Returns all of a user's charges. Call this whenever you need to find one or more charges between a date range.",
  parameters: z.object({
    userId: z.string(),
    created: z.object({
      gte: z.string().date(),
      lte: z.string().date(),
    }),
  }),
  handler: async ({ userId, created }, { network, agent, step }) => {
    // input is strongly typed to match the parameter type.
    return [{...}]
  },
});
Writing quality name and description parameters help the model determine when the particular Tool should be called.
​
Optional parameters
Optional parameters should be defined using .nullable() (not .optional()):
const listChargesTool = createTool({
  name: 'list_charges',
  description:
    "Returns all of a user's charges. Call this whenever you need to find one or more charges between a date range.",
  parameters: z.object({
    userId: z.string(),
    created: z.object({
      gte: z.string().date(),
      lte: z.string().date(),
    }).nullable(),
  }),
  handler: async ({ userId, created }, { network, agent, step }) => {
    // input is strongly typed to match the parameter type.
    return [{...}]
  },
});
​
Examples
You can find multiple examples of tools in the below GitHub projects:
Hacker News Agent with Render and Inngest
A tutorial showing how to create a Hacker News Agent using AgentKit Code-style routing and Agents with tools.
AgentKit SWE-bench
This AgentKit example uses the SWE-bench dataset to train an agent to solve coding problems. It uses advanced tools to interact with files and codebases.
