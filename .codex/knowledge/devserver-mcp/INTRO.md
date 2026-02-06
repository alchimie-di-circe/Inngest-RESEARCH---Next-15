# DevServer MCP – Overview

DevServer MCP (mntlabs/devserver-mcp) è un MCP server specializzato nel monitorare l’output del dev server (tipicamente Vite) e nel categorizzare errori e warning in modo intelligente. [web:4][web:5]

Caratteristiche chiave:
- Monitoraggio continuo dell’output del dev server (esempio: `pnpm run dev`). [web:5][web:6]
- Categorizzazione degli errori per tipo: TypeScript, Svelte, warning di accessibilità, ecc. [web:5]
- Storico degli errori e capacità di interrogare il log (“errori ultimi 5 minuti”, “tutti gli errori per file X”). [web:5][web:6]
- Pensato per essere usato da client compatibili MCP (Claude Code, Cursor, Zed, ecc.). [web:4][web:10][web:13]

Goal operativo del droid:
- Ridurre progressivamente errori e warning dal dev server tramite cicli guidati di diagnosi e fix.
- Mantenere il monitoraggio attivo in un terminal separato, indipendente dalle sessioni del client MCP.