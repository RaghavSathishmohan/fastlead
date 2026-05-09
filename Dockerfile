FROM n8nio/n8n:latest

ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_BASIC_AUTH_USER=admin
ENV WEBHOOK_URL=https://n8n.leadfast.raghavsathishmohan.com

EXPOSE 5678

CMD ["n8n", "start"]
