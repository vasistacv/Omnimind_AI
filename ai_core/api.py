"""
🚀 OMNIMIND - Advanced AI Agent API

Main FastAPI application with multi-model orchestration,
document processing, OCR, and superior reasoning capabilities.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import tempfile
import shutil
from pathlib import Path

from .orchestrator import SuperAdvancedOrchestrator
from .document_processor import DocumentProcessor

# Initialize FastAPI app
app = FastAPI(
    title="OmniMind SUPER ADVANCED AI",
    description="SUPERIOR AI agent with Gemini + DeepSeek, intelligent routing, document processing, and OCR",
    version="3.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core components
orchestrator = SuperAdvancedOrchestrator()
doc_processor = DocumentProcessor()

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    use_reasoning: bool = True
    context: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    reasoning: List[str]
    model_used: str
    confidence: float
    multi_model: bool = False
    models_consulted: int = 1

@app.get("/")
async def root():
    """API health check"""
    return {
        "status": "operational",
        "name": "OmniMind SUPER ADVANCED AI",
        "version": "3.0.0",
        "features": [
            "Gemini + DeepSeek multi-model intelligence",
            "Intelligent task routing (auto-selects best model)",
            "Superior code generation (DeepSeek specialized)",
            "Advanced reasoning (Gemini optimized)",
            "Document processing (PDF, DOCX, Excel, CSV)",
            "OCR (image text extraction)",
            "Multi-model consensus for critical tasks",
            "Task-specific optimization",
            "Chain-of-thought transparency"
        ],
        "models": {
            "gemini": "General intelligence, reasoning, explanations",
            "deepseek": "Code generation, technical tasks, optimization"
        }
    }

@app.get("/api/status")
async def get_status():
    """Get system status and available models"""
    orchestrator_status = orchestrator.get_status()
    
    return {
        "status": "operational",
        "orchestrator": orchestrator_status,
        "document_processor": {
            "ocr_enabled": doc_processor.enable_ocr,
            "max_file_size_mb": doc_processor.max_file_size / 1024 / 1024,
            "supported_formats": [
                "PDF", "DOCX", "TXT", "MD", 
                "XLSX", "CSV", "PNG", "JPG", "JPEG"
            ]
        }
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint with advanced AI capabilities.
    
    This endpoint provides SUPERIOR responses compared to ChatGPT/Gemini by:
    - Using multiple AI models simultaneously (if configured)
    - Providing detailed chain-of-thought reasoning
    - Generating production-ready code with best practices
    - Offering transparent decision-making process
    """
    
    try:
        result = await orchestrator.generate_response(
            prompt=request.message,
            context=request.context,
            use_reasoning=request.use_reasoning
        )
        
        # SAFETY CHECK FOR EMPTY RESPONSE
        if not result.get("response") or not str(result.get("response", "")).strip():
            print("[CRITICAL] Empty response detected in API!")
            result["response"] = "I apologize, but I received an empty response from the AI services. Please try again or rephrase your request."
            result["reasoning"] = ["System error detected", "Empty payload from model", "Fallback message triggered"]
        
        return ChatResponse(**result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and process a document or image.
    
    Supported formats:
    - Documents: PDF, DOCX, TXT, MD
    - Spreadsheets: XLSX, CSV
    - Images: PNG, JPG, JPEG (with OCR)
    
    This is a POWERFUL feature that extracts text from any document,
    including scanned images using OCR!
    """
    
    try:
        # Create temporary file
        temp_dir = tempfile.mkdtemp()
        temp_file_path = os.path.join(temp_dir, file.filename)
        
        # Save uploaded file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Detect file type
        file_ext = Path(file.filename).suffix.lower()
        
        # Process file
        result = await doc_processor.process_file(temp_file_path, file_ext)
        
        # Clean up
        shutil.rmtree(temp_dir)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Processing failed"))
        
        return {
            "success": True,
            "filename": file.filename,
            "type": result.get("type"),
            "text": result.get("text"),
            "summary": result.get("summary"),
            "metadata": {
                k: v for k, v in result.items() 
                if k not in ["success", "text", "type", "summary"]
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")

@app.post("/api/chat-with-document")
async def chat_with_document(
    message: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Chat with AI about an uploaded document.
    
    This combines document processing with AI chat for intelligent
    document analysis and question answering.
    """
    
    try:
        # Process document first
        temp_dir = tempfile.mkdtemp()
        temp_file_path = os.path.join(temp_dir, file.filename)
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_ext = Path(file.filename).suffix.lower()
        doc_result = await doc_processor.process_file(temp_file_path, file_ext)
        
        shutil.rmtree(temp_dir)
        
        if not doc_result.get("success"):
            # Instead of raising 400, return the error as a chat response
            return {
                "success": False,
                "response": f"I couldn't read the file. Error: {doc_result.get('error')}. Please try uploading a clearer PDF or a text file.",
                "reasoning": ["Document Processing Failed"],
                "model_used": "system-error",
                "document_info": {"filename": file.filename}
            }
        
        # Use document content as context for AI
        document_context = f"""
DOCUMENT: {file.filename}
TYPE: {doc_result.get('type')}
SUMMARY: {doc_result.get('summary')}

CONTENT:
{doc_result.get('text', '')}
"""
        
        # Generate AI response with document context
        ai_result = await orchestrator.generate_response(
            prompt=message,
            context=document_context,
            use_reasoning=True
        )

        # SAFETY CHECK FOR EMPTY RESPONSE
        if not ai_result.get("response") or not str(ai_result.get("response", "")).strip():
            print("[CRITICAL] Empty response in Document Chat!")
            ai_result["response"] = "The AI could not analyze this document. It might be too large or the content is unreadable."
            ai_result["model_used"] = "error-handler"
            ai_result["reasoning"] = []
        
        return {
            "success": True,
            "response": ai_result.get("response"),
            "reasoning": ai_result.get("reasoning"),
            "model_used": ai_result.get("model_used"),
            "document_info": {
                "filename": file.filename,
                "type": doc_result.get("type"),
                "summary": doc_result.get("summary")
            }
        }
    
    except Exception as e:
        print(f"[CRITICAL ERROR] Document Chat Failed: {e}")
        return {
            "success": False,
            "response": f"System Error processing document: {str(e)}. Please check the logs.",
            "reasoning": [],
            "model_used": "system-crash-handler",
            "document_info": {"filename": "unknown"}
        }

@app.post("/api/analyze-code")
async def analyze_code(request: ChatRequest):
    """
    Specialized endpoint for code analysis and generation.
    
    Provides SUPERIOR code quality with:
    - Production-ready code
    - Error handling
    - Best practices
    - Optimization suggestions
    - Comprehensive documentation
    """
    
    code_prompt = f"""
CODE ANALYSIS/GENERATION TASK:

{request.message}

REQUIREMENTS:
1. Generate PRODUCTION-READY code (not just examples)
2. Include comprehensive error handling
3. Add detailed comments and documentation
4. Follow industry best practices
5. Optimize for performance and readability
6. Include type hints/annotations
7. Add usage examples
8. Explain design decisions

Provide code that is BETTER than what ChatGPT or Gemini would generate!
"""
    
    result = await orchestrator.generate_response(
        prompt=code_prompt,
        context=request.context,
        use_reasoning=True
    )
    
    return ChatResponse(**result)

@app.post("/api/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    """
    Perform OCR on an uploaded image to extract text.
    
    This is a POWERFUL feature that can:
    - Extract text from photos
    - Read scanned documents
    - Process screenshots
    - Analyze diagrams with text
    """
    
    # Check if file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        temp_dir = tempfile.mkdtemp()
        temp_file_path = os.path.join(temp_dir, file.filename)
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        result = await doc_processor._process_image(temp_file_path)
        
        shutil.rmtree(temp_dir)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))
        
        return {
            "success": True,
            "filename": file.filename,
            "extracted_text": result.get("text"),
            "image_info": {
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format")
            },
            "summary": result.get("summary")
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    print("[STARTING] OmniMind Advanced AI API...")
    print("[FEATURES]")
    print("   - Multi-model AI orchestration")
    print("   - Advanced code generation")
    print("   - Document processing (PDF, DOCX, Excel, CSV)")
    print("   - OCR (image text extraction)")
    print("   - Superior reasoning capabilities")
    print("\n[API] http://127.0.0.1:8000")
    print("[DOCS] http://127.0.0.1:8000/docs")
    
    uvicorn.run(app, host="127.0.0.1", port=8000)
