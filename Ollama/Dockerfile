FROM ollama/ollama:latest

RUN apt-get update && apt-get install -y curl

COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

ENTRYPOINT ["/usr/local/bin/start.sh"]
