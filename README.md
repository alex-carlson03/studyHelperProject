# Study Helper

A web application that helps students study by turning their notes into a structured study guide. Paste or upload your course notes and Study Helper uses Azure OpenAI to generate a summary, key concepts, and practice questions.

---

## Features

- Paste notes directly into the text area or upload a file
- Supported file formats: `.pdf`, `.docx`, `.doc`, `.pptx`, `.ppt`, `.txt` (max 40 MB)
- Uploaded files are stored in Azure Blob Storage and extracted using Azure Document Intelligence
- Azure OpenAI (GPT-4o mini) generates a summary, keywords, and practice questions
- Results displayed in a clean three-card layout
- All API keys and secrets are server-side only — never exposed to the browser

---

## Architecture

```
React Frontend (port 3000)
        |
        | POST /api/upload  (file upload)
        | POST /api/generate  (notes + blob reference)
        v
Express Backend (port 5000)
        |
        |-- Azure Blob Storage      (stores uploaded files)
        |-- Azure Document Intelligence  (extracts text from files)
        |-- Azure OpenAI / AI Foundry   (generates study guide)
```

---

## Azure Services Used

| Service | Purpose |
|---|---|
| Azure App Service | Hosts the Express backend |
| Azure Blob Storage | Stores uploaded documents |
| Azure Document Intelligence | Extracts text from PDFs and Office files |
| Azure OpenAI (AI Foundry) | Generates summary, keywords, and practice questions |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values below. Never commit `.env` to the repository.

| Variable | Description |
|---|---|
| `SERVER_PORT` | Port the backend runs on (default `5000`) |
| `AZURE_STORAGE_CONNECTION_STRING` | Connection string from your Azure Storage account |
| `AZURE_STORAGE_CONTAINER_NAME` | Blob container name (default `documents`) |
| `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | Endpoint from your Document Intelligence resource |
| `AZURE_DOCUMENT_INTELLIGENCE_KEY` | Key from your Document Intelligence resource |
| `AZURE_OPENAI_ENDPOINT` | Must end in `/openai/v1` |
| `AZURE_OPENAI_KEY` | Key from your Azure AI Foundry project |
| `AZURE_OPENAI_DEPLOYMENT` | Deployment name (e.g. `gpt-4o-mini`) |
| `AZURE_OPENAI_API_VERSION` | Use the literal word `preview` for the v1 endpoint |

---

## Running Locally

### Prerequisites
- Node.js 18 or higher
- An Azure account with the services above provisioned (see `docs/AZURE_SETUP.md`)

### Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd studyHelperProject

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server
npm install
cd ..

# 4. Set up environment variables
cp .env.example .env
# Open .env and fill in your Azure keys
```

### Start the app

Two terminals are required:

```bash
# Terminal 1 — backend
cd server
npm run dev
# Runs at http://localhost:5000

# Terminal 2 — frontend
npm start
# Runs at http://localhost:3000
```

Confirm the backend is running by visiting `http://localhost:5000/api/health` — it should return `{"status":"ok"}`.

---

## Known Limitations

- The app is English-only. Notes written in other languages may produce lower quality results.
- Very long documents are truncated at 30,000 characters before being sent to the AI to stay within token limits.
- The AI output is not guaranteed to be accurate. It should be reviewed against the original notes before use.
- Uploaded files are stored in Blob Storage but there is currently no way to delete them from the UI.
- No user authentication — anyone with the URL can use the app.

---

## Responsible AI Review

Study Helper uses Azure OpenAI (GPT-4o mini) to read a student's notes and generate a summary, key terms, and practice questions.

**Fairness**
The AI may produce better results for notes written in clear, formal English. Notes written informally, in point form, or with heavy technical shorthand may result in a weaker summary. Students whose first language is not English may find that the AI misses nuance or rephrases things inaccurately.

**Reliability and Safety**
The AI can make mistakes. It may summarize something incorrectly, miss a key concept, or generate a practice question that does not match the material. The output should always be treated as a starting point, not a final answer.

**Privacy and Security**
Note text is sent to Azure OpenAI for processing. Uploaded files are stored temporarily in Azure Blob Storage. All API keys are stored as environment variables on the server and are never exposed to the browser or committed to the repository.

**Inclusiveness**
The app works in any modern browser and on mobile. It supports common file formats including PDF, Word, PowerPoint, and plain text. It is currently English-only, which is a known limitation.

**Transparency**
All output is clearly labeled as AI-generated. Users see exactly what the AI produced — a summary, key terms, and practice questions — so they can judge the quality themselves.

**Accountability**
The student is always responsible for their own studying and learning. Study Helper is a tool to help organize notes, not to replace understanding. No academic submission or decision should be based solely on the output of this tool.

---

## Project Structure

```
studyHelperProject/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Keywords.jsx
│   │   ├── NoteInput.jsx
│   │   ├── Questions.jsx
│   │   └── Results.jsx
│   ├── pages/
│   │   └── Home.jsx         # Main page — manages state and API calls
│   └── App.js
├── server/
│   ├── routes/
│   │   ├── generate.js      # POST /api/generate
│   │   └── upload.js        # POST /api/upload
│   ├── services/
│   │   ├── ai.js            # Azure OpenAI integration
│   │   ├── blob.js          # Azure Blob Storage
│   │   └── extract.js       # Azure Document Intelligence
│   └── index.js             # Express server entry point
├── docs/
│   └── AZURE_SETUP.md       # Step-by-step Azure provisioning guide
├── .env.example             # Environment variable template
└── README.md
```
