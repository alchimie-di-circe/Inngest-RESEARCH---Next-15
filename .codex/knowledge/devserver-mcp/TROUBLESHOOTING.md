# Troubleshooting DevServer MCP

Problemi comuni:

1. DevServer MCP non riceve output:
   - Verificare che il comando passato a `--monitor` sia quello effettivo usato per il dev server. [web:4][web:6]
   - Controllare che il dev server non venga avviato da un altro processo esterno non monitorato.

2. Il client MCP non vede il server:
   - Verificare porta e URL nella config del client (es. 127.0.0.1:9333 o quella configurata). [web:6][web:10]
   - Assicurarsi che DevServer MCP sia in esecuzione e accessibile sulla rete locale.

3. Troppe entry di log / rumore:
   - Usare tool per filtrare per:
     - severità (error vs warning),
     - file specifici,
     - timeframe (ultimi N minuti). [web:5][web:6][web:19]
   - Configurare filtri di esclusione per output meno rilevante se supportato.

4. Monorepo complesso:
   - Assicurarsi che il monitor venga lanciato dalla directory corretta (quella con lo script `dev` desiderato).
   - Se necessario, avviare più istanze DevServer MCP per app diverse con porte diverse e configurarli separatamente nel client MCP. [web:6][web:13]

In caso di dubbio:
- Chiedere sempre conferma all’utente prima di cambiare configurazioni o script.
- Preferire comandi espliciti nelle istruzioni, copiabili, con path assoluti/relativi chiari.
```