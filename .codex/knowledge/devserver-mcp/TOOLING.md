# Tooling DevServer MCP e client MCP

## DevServer MCP

Repository: https://github.com/mntlabs/devserver-mcp [web:4]

Funzioni di base:
- Monitoraggio di un comando di dev server passato come argomento (es. `--monitor "pnpm dev"`). [web:4][web:6]
- Parsing continuo dello stdout/stderr del dev server.
- Storage strutturato degli eventi (errori, warning, info) interrogabili via tool MCP. [web:4][web:6][web:19]

Strumenti tipici (nomi esemplificativi, da adattare all’API reale):
- `list_recent_errors`: restituisce errori/warning in una finestra temporale (es. ultimi N minuti). [web:5][web:6]
- `list_errors_by_file`: filtra per path di file.
- `list_errors_by_type`: filtra per categoria (TypeScript, Svelte, accessibility, runtime).
- `get_error_details`: dettaglio esteso di un singolo errore.
- `summarize_error_trends`: overview storica (frequenza errori per file/tipo).

## Client MCP supportati

DevServer MCP funziona con qualunque client compatibile MCP, ad esempio:
- Claude Code / Claude desktop.
- Cursor IDE.
- Zed MCP.
- Altri client MCP generici (Inspector, use-mcp, ecc.). [web:10][web:13][web:16][web:8]

Configurazione tipica:
- Aggiunta del server DevServer MCP in config MCP del client (es. `.vscode/mcp.json`, config Cursor/Zed, ecc.). [web:6][web:10]
- Uso del nome server (es. `devserver`) per invocare i tool dal client IDE.

## Esecuzione devserver-mcp con tsx

Per ambienti locali TypeScript, è possibile eseguire il server MCP senza step di build usando `tsx`. [web:24][web:28]

Prerequisiti:
- `tsx` installato come devDependency del server MCP:
  - `pnpm add -D tsx` (o `npm install -D tsx`). [web:24][web:28]

Comando tipico (nella cartella del server MCP, es. `MCP-SERVERS/devserver/devserver-mcp`):

```bash
npx tsx src/server.ts --monitor "pnpm dev"
```

Vantaggi:

- Nessun `dist/` da generare, meno scritture su disco.
- Iterazione più rapida quando il build è instabile o non ancora configurato bene. [web:24][web:28][web:34]

```