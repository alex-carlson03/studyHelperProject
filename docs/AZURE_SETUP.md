# Azure Setup — Study Helper

Step-by-step guide to provisioning the Azure services this app depends on and
wiring them into the backend. Follow the sections in order.

The app uses three Azure services:

| Service | Purpose | Backend file that uses it |
|---------|---------|---------------------------|
| **Blob Storage** | Stores uploaded documents | `server/services/blob.js` |
| **Document Intelligence** | Extracts text from PDFs / Office files | `server/services/extract.js` |
| **Azure OpenAI (in AI Foundry)** | Summary, keywords, questions | `server/services/llm.js` |

Everything you collect along the way goes into a single `.env` file at the repo
root (copy `.env.example` to `.env`). The `.env` is git-ignored — never commit it.

---

## 0. Prerequisites

- An Azure account with an active subscription ([portal.azure.com](https://portal.azure.com)).
- Node.js 18+ installed locally.
- The project cloned, with `.env.example` copied to `.env`:
  ```bash
  cp .env.example .env
  ```

> Tip: create everything in **one resource group** and **one region** (e.g.
> *East US 2*). Keeping resources co-located reduces latency and makes cleanup easy.

---

## 1. Create a Resource Group

1. Portal → search **Resource groups** → **+ Create**.
2. Pick your **Subscription**, give it a **Name** (e.g. `studyhelper-rg`), choose a **Region**.
3. **Review + create** → **Create**.

All resources below go into this group.

---

## 2. Azure Blob Storage

### Create the storage account
1. Portal → search **Storage accounts** → **+ Create**.
2. Settings:
   - **Resource group**: `studyhelper-rg`
   - **Storage account name**: globally unique, lowercase (e.g. `studyhelperdocs`)
   - **Region**: same as the group
   - **Redundancy**: *LRS* is fine for a project
3. **Review + create** → **Create**.

### Create a container
1. Open the storage account → **Data storage → Containers** → **+ Container**.
2. Name it (e.g. `files`). Access level: **Private**.

### Get the connection string
1. Storage account → **Security + networking → Access keys**.
2. Reveal **key1** → copy its **Connection string**.

### Fill in `.env`
```
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=files
```

> The backend calls `createIfNotExists()`, so it will also create the container
> automatically on first upload if you skip the manual step.

---

## 3. Document Intelligence

This extracts text from PDFs and Office files. **There is nothing to "deploy"** —
it uses prebuilt models that are ready as soon as the resource exists. The
in-Foundry *playground* is only for manual testing; your code needs a real
resource with its own keys.

### Create the resource
1. Portal → search **Document Intelligence** → **+ Create**.
2. Settings:
   - **Resource group**: `studyhelper-rg`
   - **Region**: same as the group
   - **Name**: e.g. `studyhelper-docintel`
   - **Pricing tier**: **Free (F0)** if available, else **Standard (S0)**
3. **Review + create** → **Create**.

### Get keys + endpoint
1. Open the resource → **Resource Management → Keys and Endpoint**.
2. Copy **KEY 1** and the **Endpoint** (`https://<name>.cognitiveservices.azure.com/`).

### Fill in `.env`
```
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://<name>.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=<KEY 1>
```

---

## 4. Azure OpenAI (in AI Foundry)

The LLM that produces the summary, keywords, and questions.

### Create a Foundry project
1. Go to [ai.azure.com](https://ai.azure.com) → **+ Create project**.
2. This creates (or reuses) an **AI Services / AI Foundry resource** behind the project.

### Deploy a model
A project alone has no callable model — you must **deploy** one.
1. In your project → **Deployments** (a.k.a. **Models + endpoints**) → **Deploy model**.
2. Pick a chat model — **gpt-4o-mini** is cheap and plenty for this app.
3. Give the deployment a **name** (e.g. `gpt-4o-mini`). **You use this exact name in `.env`,
   not the model id.**

### Get the endpoint + key
1. Open your deployment / project → find the **endpoint** and **key**.
2. The endpoint looks like `https://<resource>.services.ai.azure.com/...`.

> ⚠️ **Use the v1 endpoint format.** This app talks to Azure's *v1 API surface*, so
> the endpoint in `.env` must end in **`/openai/v1`**:
> ```
> https://<resource>.services.ai.azure.com/openai/v1
> ```
> If the portal shows you a project URL like
> `.../api/projects/<name>`, drop that path and use `/openai/v1` instead.

### Fill in `.env`
```
AZURE_OPENAI_ENDPOINT=https://<resource>.services.ai.azure.com/openai/v1
AZURE_OPENAI_KEY=<your key>
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_API_VERSION=preview
```

> ⚠️ `AZURE_OPENAI_API_VERSION` is the **literal word `preview`**, not a date.
> The v1 surface rejects dated versions like `2024-10-21` with
> *"API version not supported"*, and rejects an empty value with
> *"Missing required query parameter: api-version"*.

---

## 5. Final `.env` checklist

Your root `.env` should now have all of these filled in:

```
SERVER_PORT=5000

AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER_NAME=files

AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://....cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=...

AZURE_OPENAI_ENDPOINT=https://....services.ai.azure.com/openai/v1
AZURE_OPENAI_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_API_VERSION=preview
```

> Note: the backend reads **`SERVER_PORT`**, not `PORT`. The React dev server
> also reads `.env` and claims `PORT`, so using `PORT` here would make the two
> fight over the same port (the frontend would bump itself to 5001 and API calls
> would 404).

---

## 6. Run the app

Two terminals:

```bash
# Terminal 1 — backend
cd server
npm install        # first time only
npm run dev        # http://localhost:5000

# Terminal 2 — frontend (repo root)
npm install        # first time only
npm start          # http://localhost:3000
```

Smoke test: open `http://localhost:5000/api/health` → should return
`{"status":"ok"}`.

Then in the UI: paste notes or upload a file → **Generate Study Guide**.

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Frontend opens on `:5001`, API calls 404 | `PORT` in `.env` collides with React | Use `SERVER_PORT` for the backend; restart both |
| `API version not supported` | Dated `api-version` on the v1 endpoint | Set `AZURE_OPENAI_API_VERSION=preview` |
| `Missing required query parameter: api-version` | No api-version sent | Same as above — set it to `preview` |
| `401 Unauthorized` on the LLM call | Resource requires Microsoft Entra auth | Switch `llm.js` to `DefaultAzureCredential` from `@azure/identity` |
| Proxy / 404 after editing `package.json` or `.env` | Config is only read at startup | Restart `npm start` / `npm run dev` |
| Document Intelligence has only "Open in playground" | You don't have a standalone resource | Create a Document Intelligence resource (section 3) |

---

## 8. Security notes

- **Never commit `.env`** — it's git-ignored by design.
- All keys live in the **backend only**. Never put them in the React code; anything
  shipped to the browser is public.
- If a key is ever exposed (shared in a chat, committed by accident), **rotate it**:
  Portal → the resource → **Keys** → **Regenerate**.
- For production, prefer **Managed Identity** / **Microsoft Entra** auth over keys.
