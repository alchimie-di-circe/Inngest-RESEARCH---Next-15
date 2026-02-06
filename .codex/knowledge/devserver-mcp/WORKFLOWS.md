# Flussi operativi consigliati

## Setup iniziale - VARIANTE A

1. Analisi codebase:
   - Trova root repo, legge `package.json`, cerca segnali di Vite/SvelteKit. [web:4][web:6]
2. Conferma con l’utente:
   - “Confermi che vogliamo monitorare lo script `pnpm dev` nella cartella X?”
3. Installazione DevServer MCP:
   - Aggiungere come devDependency nel progetto (`pnpm add -D devserver-mcp` o nome pacchetto reale). [web:4]
4. Configurazione client MCP:
   - Aggiungere blocco di config (es. `.vscode/mcp.json`) con url/porta del server DevServer MCP. [web:6][web:10]
5. Command finale di monitor:
   - Esempio: `npx devserver-mcp --monitor "pnpm dev"`.
   - Da eseguire in un terminal separato. [web:5][web:6]

### Variante B – Run diretto con tsx (no build)

1. Entrare nella cartella del server MCP (es. `MCP-SERVERS/devserver/devserver-mcp`).
2. Assicurarsi che `tsx` sia installato (`pnpm add -D tsx` se necessario). [web:24][web:28]
3. Avviare il server MCP con:
   ```bash
   npx tsx src/server.ts --monitor "pnpm dev"
```

4. Configurare il client MCP (Claude/Cursor/Zed/Factory) per usare questo comando come `command`/`args` nel config locale. [web:24][web:28][web:32]
5. Usare poi gli stessi flussi di query e debug degli errori descritti in precedenza.
```

## Ciclo “errori → fix → verifica”

1. Dev server e DevServer MCP sono attivi.
2. Il droid chiama tool MCP per:
   - elencare errori recenti,
   - raggruppare per file/tipo,
   - ordinare per severità.
3. Preparazione fix:
   - proporre patch file‑per‑file,
   - coordinarsi con droid principale per applicazione patch.
4. Verifica:
   - richiamare DevServer MCP per controllare se gli stessi errori sono scomparsi.
5. Iterare:
   - continuare finché non restano errori bloccanti,
   - eventualmente affrontare i warning di accessibilità/performance. [web:5][web:6]

## Integrazione con UI Svelte / shadcn-svelte

- Nessun coupling diretto: DevServer MCP osserva solo il dev server, non la UI. [web:4][web:6]
- Il droid può:
  - suggerire pannelli di debug o command menu nella UI per far emergere info sulle categorie di errori,
  - ma il setup rimane principalmente lato dev tooling.
```