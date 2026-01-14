# OmniMind: The Sovereign AI Architecture

OmniMind is a state-of-the-art, modular AI agent system designed for autonomous execution, multi-modal capabilities (Text, Image, Document), and privacy-focused local operation options. It bridges the gap between massive cloud intelligence and sovereign local control.

## Core Capabilities

### 1. Advanced Reasoning Engine
- **Global Intelligence**: Integration with Llama-3-70B (via Groq) for high-speed, 300+ tokens/s inference.
- **Local Sovereignty**: Support for running local GGUF models (Mistral, Llama 3) via ollama or native python bindings.
- **Agentic Routing**: Intelligent orchestrator that dynamically selects the best tool or model for the task.

### 2. Multi-Modal Generation
- **Image Synthesis**: Native integration with Google Gemini 2.5 Flash / Imagen 3 for high-fidelity image generation.
- **Fallback Redundancy**: Automatic failover to Pollinations AI if primary image services encounter quotas or errors.
- **Document Creation**: Automated generation of professional PDF and Word documents with proper formatting.

### 3. RAG & Memory (Retrieval Augmented Generation)
- **Local Vector Store**: Built-in support for embedding documents and retrieving context without sending data to third parties.
- **Semantic Search**: Understands the intent of queries rather than just keyword matching.

## Installation

### Prerequisites
- Python 3.10+
- Git

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/vasistacv/Omnimind_AI.git
   cd Omnimind_AI
   ```

2. Run the automated setup script:
   - **Windows**: Double-click `setup.bat` or run:
     ```bash
     .\setup.bat
     ```

3. Configure Environment:
   - The setup script creates a `.env` file.
   - Open `.env` and add your API keys (Groq, Gemini, HuggingFace).

## Usage

### Launching the System
Run the launch script to start the backend orchestrator and the frontend UI:
```bash
.\launch.bat
```
This will start:
- The AI Core Server
- The Next.js Web Interface (default: `http://localhost:3000`)

### Developer Mode
For direct interaction with the core agent in a terminal:
```bash
python launch.py
```

## Project Structure

- `ai_core/`: The brain of the operation. Contains the Orchestrator, ImageGenerator, and model handlers.
- `ui/`: Modern Next.js React frontend.
- `generated_documents/`: Output directory for created PDFs and Reports.
- `launch.bat`: One-click entry point.

## Privacy & Security
OmniMind is designed with privacy in mind.
- **Local First**: Prioritizes local execution where configured.
- **Key Safety**: API keys are stored only in `.env` and never committed.
