# QA-RAG with DeepSeek, Next.js, LangChain, and Ollama

This project is a Question Answering system built using Retrieval Augmented Generation (RAG) with DeepSeek, a frontend built with Next.js, a backend powered by LangChain with FastAPI, and model interactions handled by Ollama. The entire application is containerized using Docker for easy deployment and scalability.

## Overview

This project implements a QA-RAG system that allows users to ask questions and receive answers generated by a language model. The system uses DeepSeek for retrieval, LangChain for backend logic, and Ollama for interacting with the language model. The frontend is built with Next.js, providing a seamless user experience.

## Features

- **Question Answering**: Users can input questions and receive answers generated by the language model.
- **Retrieval Augmented Generation (RAG)**: Combines retrieval-based and generative approaches to provide accurate and contextually relevant answers.
- **Dockerized**: The entire application is containerized using Docker, making it easy to deploy and scale.
- **Next.js Frontend**: A modern and responsive frontend built with Next.js.
- **LangChain with FastAPI as Backend**: Handles the logic for processing questions and generating answers.
- **Ollama Integration**: Interacts with the language model for generating responses.

## Technologies Used

- **Frontend**: Next.js
- **Backend**: LangChain and FastAPI
- **Model Interaction**: Ollama
- **Retrieval**: DeepSeek
- **Containerization**: Docker
  
## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/AlthariqFairuz/QA-RAG-with-deepseek.git
   cd qa-rag-with-deepseek
   ```
2. **Run the application with docker by using**
   
   ```bash
   docker compose up --build
   ```

3. **Or you can run the application without docker by following these steps**
   - Make sure [ollama](https://ollama.com/) is installed in your local device and pull the model by using:
     ```bash
     ollama pull deepseek-r1:1.5b
     ```
   - Change to directory ```/FE```, install the dependencies, and run the web:
     ```
     npm i
     npm run dev
     ```
   - Change to directory ```/BE```, install the dependencies, and run the backend:
     ```
     pip install -r requirements.txt
     python main.py
     ```

## How to access
```frontend```: Next.js application running on port 3000.

```backend```: LangChain backend running on port 8000.

## NOTE
- Make sure you have enough memory because you are about to pull an LLM into your device.
- This application doesn't have any database connected, if you refresh the web, your entire history chat will be deleted.
- The backend hasn't been deployed to cloud service, which means you must run this application in your own device in order to work properly.
- The web is not responsive in mobile device (will be fixed soon).
