<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

## Repoless Support nella REST API di Jules

Il **repoless support** è una nuova funzionalità della REST API di Jules che permette di creare sessioni di sviluppo **senza dover specificare un repository GitHub**.[^1_1]

### Come Funzionava Prima

In precedenza, per utilizzare Jules tramite API era necessario:

- Avere un repository GitHub già esistente
- Specificare il contesto del repository (`sourceContext`) nella chiamata API
- Jules lavorava sempre all'interno del contesto di un progetto esistente[^1_1]


### Cosa Cambia con Repoless

Con il supporto repoless, puoi ora creare sessioni **effimere** che funzionano come ambienti serverless:[^1_1]

1. **Nessun repository richiesto**: Basta una singola chiamata API con solo il prompt nel contesto
2. **Ambiente dev preconfigurato**: Viene creato automaticamente un ambiente cloud con runtime preinstallati (Node, Python, Rust, Bun, ecc.)
3. **AI coding agent integrato**: L'ambiente serverless include Jules come agente di sviluppo
4. **Download dei file output**: Al termine della sessione, puoi scaricare tutti i file generati[^1_1]

### Il Potenziale della Feature

Jules descrive questa funzionalità come avente "**massive potential**" perché trasforma l'ambiente di sviluppo in un servizio serverless con un agente AI integrato.[^1_1]

### Esempio di Utilizzo

Ecco un esempio di chiamata API repoless:

```bash
PROMPT_CONTENT=$(jq -Rs . < my_prompt.md)
curl 'https://jules.googleapis.com/v1alpha/sessions' \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: $JULES_API_KEY" \
  -d "{\"prompt\": $PROMPT_CONTENT}"
```

Nota come non sia necessario specificare alcun `sourceContext` - serve solo il prompt.[^1_1]

Questa feature è stata rilasciata il 26 gennaio 2026 insieme alla possibilità di ottenere tutti gli output dei file in formato git patch e ai filtri timestamp per le attività delle sessioni.[^1_1]

<div align="center">⁂</div>

[^1_1]: https://jules.google/docs/changelog/


---

# quindi è comoda per scaffold veloci e/o one shot task, anche indipendenti da un project repo giusto? ad es creazione di un singolo file da aggiugnere poi in repo.  e sbaglio o in questa modalità jules è anche libero da github branches workflow (non è teenuto ad aprire un branch? o si ma non è tenuto ad aprire una PR ? se non c'è una repo non ci sono nmmeno i branch giusto?..) mi confermi che qualsiasi session jules, anche invocata da cli avviene in cloud, dico bene?

Sì, hai capito bene: il repoless è perfetto per **scaffold veloci** e task “one shot” scollegati da un repo GitHub, tipo generare uno o pochi file e poi portarli tu a mano nel repo.[^2_1]

## A cosa serve in pratica

- Ottimo per prototipi, script singoli, POC, boilerplate iniziale, senza dover prima creare/collegare un repository.[^2_1]
- Dalla REST API fai una sola chiamata con il prompt, Jules crea un ambiente effimero in cloud, fa il lavoro e tu scarichi gli output (incluso il patch set completo se vuoi).[^2_1]


## Niente GitHub, niente branch/PR

In modalità repoless **non c’è alcun repository associato**, quindi:

- Non ci sono branch GitHub reali: è un filesystem di una VM temporanea, non un repo remoto.[^2_1]
- Di conseguenza Jules non “apre PR” perché non ha un remote verso cui fare push.[^2_1]
- Può comunque organizzare le modifiche come git patch (perché internamente è comodo), ma è solo un formato di output che tu poi applichi dove vuoi.[^2_1]

Quando invece usi Jules collegato a un repo GitHub, hai il flusso classico: VM in cloud, repo clonato, branch, e da UI puoi pubblicare un branch o aprire direttamente una PR.[^2_1]

## Sessions e cloud vs CLI

- Tutte le **Jules Session** avvengono comunque in cloud: Jules “spinna” una VM con base image preconfigurata (Node, Python, Rust, Bun, ecc.).[^2_1]
- Questo è vero sia per le sessioni via REST API, sia per quelle create da UI, sia per quelle che crei dal **Jules Tools CLI** (`jules remote new` ecc.): il CLI è solo un client che parla con il backend, non esegue il codice localmente.[^2_1]

Se vuoi ti posso suggerire un flusso “ibrido” tipico:

1) fai una session repoless per generare un file o micro‑progetto,
2) scarichi i file,
3) li aggiungi tu al tuo repo e poi, da lì, usi Jules “normale” (con branch/PR) per far evolvere la cosa.[^2_1]

<div align="center">⁂</div>

[^2_1]: https://jules.google/docs/changelog/


---

# allora puo essere molto utile a gemini cli per delega task-subtask senza dover abbandonare la session (cosa che invece avviene quando delego a jules da gemini cli usando jules extension), quindi per lavoro continuativo in session?

Sì: repoless via API è esattamente il tipo di mattoncino che puoi usare come “worker esterno” da Gemini CLI per sub‑task senza rompere la tua sessione principale.[^3_1]

## Uso come delega da Gemini CLI

- Da Gemini CLI puoi chiamare la REST API di Jules in repoless come normale HTTP call: Gemini resta “orchestratore”, Jules fa il lavoro in una VM effimera e ti restituisce file/patch.[^3_1]
- Questo ti evita il problema dell’extension Jules che ti trascina nel suo workflow UI/branch/PR: qui fai solo “spawn → compute → download → integra”.[^3_1]
- Puoi farlo in loop all’interno della stessa sessione Gemini: per ogni subtask (es. “genera test”, “genera script migrazione”), Gemini fa una nuova `sessions` call repoless e poi decide come usare gli output.[^3_1]


## Lavoro continuativo in session

- Ogni **Jules Session** è comunque un’unità separata (anche repoless), ma puoi usarle in catena come building block dentro la tua singola sessione Gemini.[^3_1]
- Finché mantieni in Gemini lo stato (file correnti, patch applicate, contesto), puoi ottenere un effetto “lavoro continuativo” orchestrando più session Jules in background.[^3_1]


## Niente GitHub workflow in repoless

- In repoless non c’è repo collegata, quindi niente branch GitHub reali, niente PR, solo filesystem/patch interni alla VM che poi scarichi.[^3_1]
- Questo è ideale per deleghe “stateless” o quasi: generare un singolo file, uno skeleton di feature, uno script, uno snippet da innestare poi nel repo che stai gestendo tu lato Gemini.[^3_1]

Se vuoi, nel prossimo passo ti posso schizzare uno pseudo‑workflow concreto “Gemini orchestration → Jules repoless → patch applicata localmente” in stile script/CLI.

<div align="center">⁂</div>

[^3_1]: https://jules.google/docs/changelog/


---

# si perfetto, vai con l'esempio.. lo do in pasto al mio gemini per orchestrazione task headless

Perfetto use case: puoi trattare Jules repoless come “worker headless” chiamato da Gemini per task/sub‑task, mantenendo tutto lo stato e il reasoning *dentro* la session di Gemini.[^4_1]

## Idea di workflow high-level

- Gemini CLI resta l’orchestratore: tiene in pancia il contesto del progetto (file, repo, stato conversazione).
- Quando serve “lavoro sporco” (generare file, test, script, refactor localizzato), Gemini chiama Jules REST API in modalità repoless.[^4_1]
- Jules crea una VM effimera, esegue il task, restituisce file/patch; Gemini decide come integrarli nel proprio workspace.[^4_1]

Di seguito uno **pseudo‑flusso headless** pensato da dare in pasto a Gemini come “pattern di delega”.

***

## Prompt di sistema per Gemini (idea)

Puoi dare a Gemini qualcosa di questo tipo:

> Sei un orchestratore che usa Jules via REST API (repoless) come worker esterno.
> - Mantieni sempre tu lo stato del progetto (file correnti, diff, branch).
> - Per ogni subtask che richiede generazione o modifica di codice non banale, crea una sessione Jules repoless con un prompt strutturato, attendi gli output (file/patch) e poi integra le modifiche nel workspace locale.
> - Non abbandonare mai questa sessione: usa Jules solo tramite HTTP, non tramite la sua estensione interattiva.

***

## Schema di chiamata a Jules (pseudocodice)

Usa repoless come da changelog (solo `prompt`, nessun `sourceContext`).[^4_1]

```bash
PROMPT_CONTENT=$(cat << 'EOF'
You are an AI coding agent working in an ephemeral dev environment.
Task:
- Generate a single TypeScript file called `src/new-feature.ts`
- It should export a function `runNewFeature()` with the following behavior:
  ...

Constraints:
- Only touch files you create yourself.
- Keep the implementation self-contained.
- At the end, summarize what you did.

EOF
)

curl 'https://jules.googleapis.com/v1alpha/sessions' \
  -X POST \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: $JULES_API_KEY" \
  -d "$(jq -n --arg prompt "$PROMPT_CONTENT" '{prompt: $prompt}')"
```

- Questo crea una **Session** repoless in cloud, senza repo.[^4_1]
- Gemini prende `session.id` dalla risposta e lo usa per interrogare lo stato/outputs.

***

## Step che Gemini può seguire per ogni subtask

1. **Analizza subtask localmente**
    - Decide cosa delegare (es. “genera file X”, “genera test per Y”).
    - Prepara un prompt per Jules che includa eventuali snippet/firme necessari.
2. **Crea sessione Jules repoless**

Pseudocodice lato Gemini:

```python
def jules_repoless_task(prompt: str) -> dict:
    payload = {"prompt": prompt}
    resp = http.post(
        "https://jules.googleapis.com/v1alpha/sessions",
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": JULES_API_KEY,
        },
        json=payload,
    )
    return resp.json()  # contiene session.id, stato iniziale, ecc.
```

3. **Poll delle attività / completamento**

Jules espone le “activities” della sessione, filtrabili per timestamp (`createTime`).[^4_1]

```python
def jules_wait_until_done(session_id: str):
    # loop su /sessions/{id}/activities con createTime come cursore
    # finché non si vede un evento "Session finished: completed"
    ...
```

4. **Recupero degli output di file (git patch)**

Dal changelog: “When a session completes a task, you can now get the **entire change set** stored in a git patch format.”[^4_1]

Immaginando un endpoint tipo (API ref):
`GET https://jules.googleapis.com/v1alpha/sessions/{id}/files` (o simile) che restituisce patch.

Pseudocode:

```python
def jules_get_patch(session_id: str) -> str:
    resp = http.get(
        f"https://jules.googleapis.com/v1alpha/sessions/{session_id}/files",
        headers={"x-goog-api-key": JULES_API_KEY},
    )
    return resp.text  # contenuto patch
```

5. **Applicare la patch nel workspace Gemini**

Gemini mantiene la view del filesystem (ad es. tramite tool “read_file/write_file/apply_patch” del suo CLI).
I passi logici:
    - Gemini prende la patch.
    - La applica ai file del progetto locale (o alla working copy “virtuale” se usi devcontainer/FS astratto).
    - Se la patch crea nuovi file, li aggiunge.
    - Aggiorna il proprio contesto e continua a ragionare sullo stato aggiornato.

***

## Pattern multi-subtask in una singola sessione Gemini

Gemini può riciclare questo schema per una sequenza di subtasks:

1. “Analizza issue” → reasoning puro in Gemini, nessuna chiamata esterna.
2. “Genera nuovo hook React” → chiama Jules repoless, applica patch.
3. “Genera test Jest per quel hook” → nuovo prompt a Jules repoless, patch.
4. “Aggiorna docs Markdown” → ancora Jules, patch.

Gemini resta sempre “master of truth” del progetto, Jules sono solo workers effimeri in cloud che consegnano codice e patch, senza toccare branch o PR su GitHub.[^4_1]

***

## Frase pronta da incollare a Gemini

Se ti è comodo, puoi usare qualcosa tipo:

> Quando ti chiedo di delegare un subtask a Jules, esegui questi passi:
> 1) sintetizza un prompt chiaro per Jules,
> 2) crea una sessione Jules repoless via REST API,
> 3) aspetta che la sessione finisca,
> 4) scarica l’intero change set in formato git patch,
> 5) applica la patch al progetto su cui stiamo lavorando,
> 6) mostrami un breve riassunto dei file modificati e continua il reasoning da qui.[^4_1]

Se vuoi, nel messaggio dopo posso adattare questo pattern a un repo concreto tuo (es. Svelte/Electron/Convex) con un prompt già suddiviso per ruoli e constraint.

<div align="center">⁂</div>

[^4_1]: https://jules.google/docs/changelog/

