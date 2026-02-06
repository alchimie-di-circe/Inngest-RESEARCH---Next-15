title: Cagent Framework – Agent Rule
slug: agents-cagent-framework
tags: [cagent, mcp, dmr, rag, multi-agent, docker]
---

# Regola per l'uso di cagent nei workflow di coding AI-driven

Questa regola si applica a **qualsiasi coder assistant** (Droid CLI, Claude Code, altri) quando nel contesto di lavoro è presente il framework **cagent** oppure quando l’utente lo richiede esplicitamente.

## Quando attivare questa regola

Il coder assistant deve **attivare mentalmente questa regola** quando:

- Nel repo è presente almeno uno tra:
  - `cagent.yaml`, `*_agent.yaml`, `*_agents.yaml`, `docker/cagent` come submodule o dependency.
  - File riferiti come `@cagent-schema.json`, `@cagent-examples.md`, `@cagent-notes.md`.
- Nel contesto di chat l’utente menziona esplicitamente:
  - “cagent”, “Agent Builder and Runtime by Docker”, “MCP Gateway / MCP Toolkit Docker”, “Docker Model Runner / DMR”.
- La tab attiva dell’IDE o del browser punta alla repo ufficiale di `docker/cagent` o alla documentazione Docker AI (MCP, DMR). [web:2]

In questi casi il coder assistant **non deve trattare cagent come un semplice tool esterno generico**, ma come **framework centrale** per orchestrare agenti, tool MCP, RAG e modelli. [web:2]

## Obiettivi del coder assistant con cagent

Quando usa cagent, il coder assistant deve:

- Progettare, creare e manutenere:
  - File YAML di configurazione agenti (single‑agent, multi‑agent, RAG, DMR, MCP). [web:2]
  - File di knowledge base/testo di supporto (es. `@cagent-examples.md`, `@cagent-notes.md`).
- Generare comandi CLI sicuri ed espliciti per:
  - `cagent run`, `cagent exec`, `cagent api`, `cagent mcp`, `cagent new`, `cagent push`, `cagent pull`. [web:2]
- Suggerire utilizzo di:
  - **MCP Gateway Docker** e MCP Toolkit per integrare tool containerizzati (es. `docker:duckduckgo`, GitHub, filesystem, HTTP, DB). [web:2]
  - **Docker Model Runner (DMR)** come provider `dmr` per modelli locali e reranking. [web:2]
  - **RAG nativo** di cagent con strategie multiple (chunked‑embeddings, bm25, hybrid search, fusion RRF, reranking). [web:2]

## Principi generali di comportamento

1. **Chiedere sempre contesto e preferenze**  
   Prima di proporre o modificare configurazioni cagent, il coder assistant chiede sempre all’utente:

   - Provider disponibili/preferiti: Anthropic, OpenAI, Gemini, DMR locale, altri. [web:2]
   - Vincoli: budget, privacy, latency, portabilità (CI, devcontainer, desktop). [web:2]
   - Stack applicativo: CLI, backend API, frontend (Next.js 16, TanStack Router, React, Vite, ecc.).
   - Esistenza di config cagent già presenti nel repo da estendere/migrare.

2. **Preferire l’evoluzione all’overwriting**  
   - Se esistono file YAML o note cagent, proporre modifiche incrementali, con diff concettuale, invece di sovrascrivere. [web:2]
   - Prima di scrivere: mostrare la proposta e chiedere conferma.

3. **Spiegare sempre in modo didattico**  
   Ogni decisione importante deve essere accompagnata da una breve spiegazione:

   - Perché è stato scelto un certo provider/modello.
   - Perché è stata scelta una certa strategia RAG / reranker.
   - Perché è stato introdotto un nuovo subagent o MCP tool.

4. **Separare conoscenza “di progetto” da conoscenza “di framework”**  
   - Le istruzioni specifiche di una repo (stack, convenzioni, limiti) vanno in `AGENTS.md` del progetto.
   - La conoscenza generale su cagent, DMR e MCP Docker va in file riusabili referenziati con `@`, come:
     - `@cagent-schema.json` – schema ufficiale. [web:2]
     - `@cagent-examples.md` – esempi locali derivati dagli examples ufficiali. [web:2]
     - `@cagent-notes.md` – best practice, pattern e appunti. [web:2]

## MCP Server Verificati (Coordinate Ufficiali 2026)

Le seguenti sono coordinate ufficiali per MCP server affidabili e verificati:

- **Perplexity MCP** → Package `@perplexity-ai/mcp-server` | Tools: perplexity_research, perplexity_ask, perplexity_search, perplexity_reason
- **Firecrawl MCP** → Package `firecrawl-mcp` | Tools: firecrawl_scrape, firecrawl_search, firecrawl_crawl, firecrawl_map, firecrawl_extract
- **Jina AI MCP** → Remote URL `https://mcp.jina.ai/v1` (proxy: `mcp-remote`) | Tools: read_url, search_web, search_images, search_arxiv, parallel_search_web, sort_by_relevance
- **Cloudinary MCP** → Package `@cloudinary/asset-management-mcp` | Tools: asset management, transformation, search

Per details: https://docs.docker.com/ai/cagent/best-practices/ e `.taskmaster/docs/task-5-upgrade-spec.md`

## Quick Reference YAML (verificato da doc ufficiale)

### Agent Definition
```yaml
agents:
  agent_name:
    model: provider/model-name
    description: "Brief description"
    instruction: |
      Detailed instructions...
    add_prompt_files: ["./prompts/file.md"]  # NOT instruction_file
    sub_agents: [agent1, agent2]
    toolsets: [...]
    rag: [source_name]
```

### Toolsets MCP
```yaml
toolsets:
  - type: mcp
    command: npx
    args: ["-y", "package-name"]
    env:
      API_KEY: ${API_KEY}
  
  - type: mcp
    ref: docker:toolname  # Docker MCP Gateway
  
  - type: mcp
    remote:
      url: https://mcp.example.com
      transport_type: sse
```

### RAG Configuration
```yaml
rag:
  source_name:
    docs: ["./path/to/docs"]
    strategies:
      - type: chunked-embeddings
        embedding_model: openai/text-embedding-3-small
        vector_dimensions: 1536
        database: ./embeddings.db
```

**NOTA**: Reindicizzazione RAG è AUTOMATICA. NON esiste `cagent rag reindex`.

## Uso di cagent come framework

### 1. Scelta dei provider e dei modelli

Il coder assistant deve:

- Verificare quali provider sono effettivamente disponibili (API key / DMR abilitato). [web:2]
- Suggerire una combinazione bilanciata:

  - **Remote LLM forti** (Anthropic, OpenAI, Gemini) per:
    - root agent coordinatore;
    - task complessi che richiedono reasoning e planning. [web:2]
  - **DMR locale** per:
    - privacy/sovranità dei dati;
    - ridurre costi;
    - sfruttare modelli open source (es. Qwen, Gemma). [web:2]
  - **Modelli più piccoli/veloci** per subagents di nicchia o tool-calling intensivo.

- Per DMR, usare `provider: dmr` e, quando serve, `provider_opts` (runtime_flags, speculative decoding) spiegando in cosa consistono e chiedendo conferma prima di introdurre impostazioni aggressive. [web:2]

### 2. RAG e strategie di retrieval

Quando il caso d’uso richiede accesso a documentazione, codice o contenuti testuali, il coder assistant:

- Propone di usare il RAG nativo di cagent, scegliendo tra: [web:2]

  - `chunked-embeddings` (semantic search).
  - `bm25` (keyword search).
  - `hybrid` con fusion (es. RRF) e deduplica.

- Suggerisce configurazioni ragionate di:
  - chunk size / overlap;
  - limiti e soglie;
  - indirizzi delle cartelle (es. `./docs`, `./src`, `./knowledge`). [web:2]

- Per il **reranking**, propone:
  - Modelli dedicati (es. DMR `/rerank`) o chat models a temperatura bassa.
  - Criteri testuali chiari ma sintetici (priorità a doc recenti, ufficiali, con esempi pratici). [web:2]

### 3. Best Practice dalla Doc Ufficiale

**Handling Large Command Outputs**: Redirigere output in file, poi leggere con filesystem tool (evita context overflow).

**Model Selection**: Usa modelli grandi (Sonnet, GPT-5) per reasoning/planning/writing; modelli piccoli (Haiku, GPT-5 Mini) per validation/tool-calling.

**RAG Optimization**: Aumenta `batch_size` (es. 50), `max_embedding_concurrency` (es. 10), chunk size (es. 2000) per velocizzare indicizzazione.

**RAG Reindicizzazione**: È AUTOMATICA su file modificati. NON esiste comando manuale `cagent rag reindex`.

**Prompt Files**: USA `add_prompt_files:` per referenziare system prompt modulari in file esterni (NON `instruction_file:`).

Ref: https://docs.docker.com/ai/cagent/best-practices/

### 4. MCP e Docker MCP Toolkit

Il coder assistant deve sapere che cagent:

- Può usare **MCP servers** via `toolsets`:
  - `type: mcp`, con:
    - `ref: docker:xxx` per server containerizzati tramite Docker MCP Gateway. [web:2]
    - `command:` + `args:` per MCP stdio locali (es. filesystem). [web:2]
    - endpoint HTTP/SSE per MCP remoti. [web:2]

- Deve proporre MCP rilevanti allo use case, ad esempio:
  - Search/web (es. `docker:duckduckgo`).
  - File system, Git, GitHub, DB, HTTP client.
  - Tool domain‑specific se presenti nel catalogo Docker MCP Toolkit. [web:2]

Per ogni MCP:

- Descrivere in breve il ruolo nel workflow.
- Specificare se richiede configurazione lato Docker Desktop/MCP Toolkit (auth, secret, scope). [web:2]

### 4. Multi-agent teams e routing

Per applicazioni complesse il coder assistant deve:

- Proporre una struttura `agents:` con:
  - `root` coordinatore.
  - Subagents specializzati (es. `frontend_builder`, `backend_api`, `rag_librarian`, `ops_automation`). [web:2]

- Spiegare come il root:
  - decide quando rispondere da solo;
  - quando delegare;
  - come aggrega i risultati e applica fallback (nuovo subagent, diverso provider, modalità “solo RAG” o “solo reasoning”). [web:2]

### 5. Modalità di esecuzione cagent

Il coder assistant deve saper proporre:

- **Interattivo / sviluppo**:
  - `cagent run <config.yaml> -a <agent>` per sessioni locali. [web:2]
- **Headless / integrazione CI-cron**:
  - `cagent exec ...` con input/parametri passati da script/CI. [web:2]
- **Backend API**:
  - `cagent api <config.yaml> ...` per esporre endpoint HTTP usati da frontend (Next.js, TanStack, ecc.). [web:2]
- **MCP server**:
  - `cagent mcp <config.yaml>` o `cagent mcp namespace/repo` per esporre agenti come MCP tools verso Claude, Droid o altri client. [web:2]

Per ogni scelta deve indicare:

- Pro / contro.
- Come integrarsi con lo stack esistente (dev server, reverse proxy, auth). [web:2]

### 6. Agent store, distribuzione e riuso

Il coder assistant deve ricordare che:

- `cagent push` pubblica configurazioni agenti su Docker Hub come OCI image. [web:2]
- `cagent pull` recupera agenti dal catalogo (es. `creek/pirate`) e li rende disponibili come file YAML. [web:2]

Va quindi:

- Proporre naming/tagging sensati (org/progetto/nome‑agent).
- Spiegare come versionare e migrare config tra repo/ambienti.

### 7. Errori, log e troubleshooting

Il coder assistant deve:

- Suggerire modalità per:

  - Aumentare verbosità/log di cagent se supportato. [web:2]
  - Diagnosticare problemi RAG (strategie, soglie, path docs, reindicizzazione). [web:2]
  - Diagnosticare problemi MCP/Docker (MCP Gateway non raggiungibile, server non configurato, errori di auth). [web:2]
  - Diagnosticare problemi DMR (port, modelli non scaricati, runtime flags errate). [web:2]

- Offrire sempre un percorso di fallback:
  - RAG spento ma agent funzionante.
  - Provider alternativo.
  - Config ridotta (single‑agent senza MCP) per sbloccare il flusso di lavoro.

## Sicurezza, conferme e interazione

- **Mai** eseguire comandi shell o modificare file senza mostrare prima all’utente:
  - snippet completi dei comandi;
  - patch o file finali proposti (YAML, MD, ecc.).
- **Sempre** chiedere:
  - “Posso applicare queste modifiche?” prima di usare strumenti che scrivono su disco o lanciano processi lunghi.
- In contesti di esempio/demo, chiarire se i comandi sono solo di riferimento o pensati per essere eseguiti realmente.
