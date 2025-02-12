from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import uvicorn
from langchain_community.document_loaders import PDFPlumberLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate

app =FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://qa-rag-with-deepseek.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


PDF_STORAGE_PATH = 'document_store/pdfs/'

# Create embeddings layer
EMBEDDING_MODEL = OllamaEmbeddings(model="deepseek-r1:1.5b")

# Create document vector database
DOCUMENT_VECTOR_DB = InMemoryVectorStore(EMBEDDING_MODEL)

# LLM Model
LANGUAGE_MODEL = OllamaLLM(model="deepseek-r1:1.5b")

os.makedirs(PDF_STORAGE_PATH, exist_ok=True)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str

class ChatResponse(BaseModel):
    response: str

def save_pdf(uploaded_file : UploadFile) -> str:
    file_path = os.path.join(PDF_STORAGE_PATH, uploaded_file.filename)
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(uploaded_file.file.read())
        return file_path
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error saving file: {e}")
    
def process_document(file_path : str):
    try :
        loader = PDFPlumberLoader(file_path)
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size = 1000,
            chunk_overlap = 200,
            add_start_index = True
        )

        chunks = splitter.split_documents(documents)

        DOCUMENT_VECTOR_DB.add_documents(chunks)
        return True
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error processing document: {e}")

def generate_response(query : str , model : str = "deepseek-r1:1.5b") -> str:
    try :
        global LANGUAGE_MODEL
        if LANGUAGE_MODEL.model != model:
            LANGUAGE_MODEL = OllamaLLM(model=model)
        
        relevant_docs = DOCUMENT_VECTOR_DB.similarity_search(query)
        context_text  = "\n\n".join([doc.page_content for doc in relevant_docs])

        prompt = ChatPromptTemplate(
                    messages=[
                        SystemMessagePromptTemplate.from_template(
                            "You are an expert research assistant. Use the provided context to answer the query. If unsure, state that you don't know. Be concise and factual in your responses."
                        ),
                        HumanMessagePromptTemplate.from_template("Query: {query}\nContext: {context}\nAnswer:")
                    ]
                )
        
        chain = prompt | LANGUAGE_MODEL
        response = chain.invoke({
            "query": query,
            "context": context_text
        })
        return response
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error generating response: {e}")

# API Endpoints
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_path = save_pdf(file)
    success = process_document(file_path)   
    return {"success": success}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided")
    
    user_messages = [msg for msg in request.messages if msg.role == "user"]
    if not user_messages:
        raise HTTPException(status_code=400, detail="No user messages provided")
    
    last_user_message = user_messages[-1].content
    response = generate_response(last_user_message, request.model)

    return ChatResponse(response=response)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
