---
tags: [agentkit, api-reference, all-agents]
description: Model provider configuration
alwaysApply: false
---

Models
Leverage different provider’s models across Agents.

Within AgentKit, models are adapters that wrap a given provider (ex. OpenAI, Anthropic)‘s specific model version (ex. gpt-3.5).
Each Agent can each select their own model to use and a Network can select a default model.
import { openai, anthropic, gemini } from "@inngest/agent-kit";
​
How to use a model
​
Create a model instance
Each model helper will first try to get the API Key from the environment variable. The API Key can also be provided with the apiKey option to the model helper.

OpenAI

Anthropic

Gemini
import { openai, createAgent } from "@inngest/agent-kit";


const model = openai({ model: "gpt-3.5-turbo" });
const modelWithApiKey = openai({ model: "gpt-3.5-turbo", apiKey: "sk-..." });

​
Configure model hyper parameters (temperature, etc.)
You can configure the model hyper parameters (temperature, etc.) by passing the defaultParameters option:

OpenAI

Anthropic

Gemini
import { openai, createAgent } from "@inngest/agent-kit";

const model = openai({
  model: "gpt-3.5-turbo",
  defaultParameters: { temperature: 0.5 },
});
The full list of hyper parameters can be found in the types definition of each model.
​
Providing a model instance to an Agent
import { createAgent } from "@inngest/agent-kit";

const supportAgent = createAgent({
  model: openai({ model: "gpt-3.5-turbo" }),
  name: "Customer support specialist",
  system: "You are an customer support specialist...",
  tools: [listChargesTool],
});
​
Providing a model instance to a Network
The provided defaultModel will be used for all Agents without a model specified. It will also be used by the “Default Routing Agent” if enabled.
import { createNetwork } from "@inngest/agent-kit";

const network = createNetwork({
  agents: [supportAgent],
  defaultModel: openai({ model: "gpt-4o" }),
});
​
List of supported models
For a full list of supported models, you can always check the models directory here.

OpenAI

Anthropic

Gemini

Grok
"gpt-4.5-preview"
"gpt-4o"
"chatgpt-4o-latest"
"gpt-4o-mini"
"gpt-4"
"o1"
"o1-preview"
"o1-mini"
"o3-mini"
"gpt-4-turbo"
"gpt-3.5-turbo"
​
Environment variable used for each model provider
OpenAI: OPENAI_API_KEY
Anthropic: ANTHROPIC_API_KEY
Gemini: GEMINI_API_KEY
Grok: XAI_API_KEY