#!/bin/bash
/bin/ollama serve &
pid=$!

until curl -s http://localhost:11434/api/tags >/dev/null; do
    echo "Waiting for Ollama to start..."
    sleep 1
done

echo "Pulling deepseek-r1 model..."
ollama pull deepseek-r1:1.5b
# ollama pull deepseek-r1:7b # uncomment this line to pull the 7b model, make sure you have enough memory


wait $pid