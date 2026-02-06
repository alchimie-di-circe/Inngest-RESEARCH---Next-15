# Rilevamento framework e dev command

## SvelteKit / Svelte + Vite

Indizi:
- Presenza di `svelte.config.js/ts`. [web:3]
- Uso di `@sveltejs/kit` o `@sveltejs/vite-plugin-svelte` in `package.json`.
- Script `dev` che lancia `vite dev` o `svelte-kit dev`.

Comando monitor tipico:
- `pnpm dev`, `npm run dev` o `bun dev` dalla root app principale.
- Il monitor viene lanciato come:
  - `node dist/server.js --monitor "pnpm dev"`
  - oppure un comando wrapper fornito dal pacchetto (es. `npx devserver-mcp --monitor "pnpm dev"`). [web:4][web:6]

## Altri framework (Next, Remix, ecc.)

Pattern generico:
- Rilevare lo script `dev` in `package.json`.
- Trattare il comando come black box e passarlo a `--monitor "..."`. [web:4][web:6][web:13]

Regole:
- Se monorepo, scegliere l’app target (directory `apps/*`, `packages/*`) e usare il relativo `dev` script.
- Se ci sono più script (`dev`, `dev:client`, `dev:server`), concordare con l’utente quali monitorare.
```