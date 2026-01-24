# Pinecone Essentials (for optional vector search)

## When to use Pinecone in this project
Only enable if you need semantic vector search. The app works with in-memory fallback.

## Quick Setup
```bash
# Install SDK
npm install @pinecone-database/pinecone

# Create index (one-time, CLI recommended)
pc index create -n test-inngest-context-engineering \
  -m cosine -c aws -r us-east-1 \
  --model llama-text-embed-v2 \
  --field_map text=content
Basic Operations
Initialize client
typescript
import { Pinecone } from '@pinecone-database/pinecone';
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("test-inngest-context-engineering");
Upsert records
typescript
const records = [{
    _id: "doc1",
    content: "Your text here",  // must match field_map
    category: "research"
}];

await index.namespace("research_docs").upsertRecords(records);
Search with reranking
typescript
const results = await index.namespace("research_docs").searchRecords({
    query: {
        topK: 10,
        inputs: { text: queryText }
    },
    rerank: {
        model: "bge-reranker-v2-m3",
        topN: 5,
        rankFields: ["content"]
    }
});

// Access results
for (const hit of results.result.hits) {
    const fields = hit.fields as Record<string, any>;
    console.log(fields?.content);
}
Critical Gotchas
Eventual consistency: Wait 10+ seconds after upsert before searching

Always use namespaces: index.namespace("name")

Type casting required: hit.fields as Record<string, any>

Metadata must be flat: No nested objects

Batch limits: 96 records per batch for text embeddings

Error Handling
typescript
async function safeSearch(index, namespace, query) {
    try {
        return await index.namespace(namespace).searchRecords({
            query: { topK: 5, inputs: { text: query } }
        });
    } catch (error) {
        console.error("Pinecone search failed:", error);
        return { result: { hits: [] } };  // Fallback to empty
    }
}
Upload PDFs to Pinecone (optional)
bash
npm run upload-pdf path/to/document.pdf
Full Documentation
For advanced features not covered here: https://docs.pinecone.io/

