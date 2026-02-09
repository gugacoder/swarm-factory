# F-012 — Webhooks e notificações

- [x] Função notifyWebhooks existe no agent-harness.mjs
- [x] Filtra notifications cujos events incluem o evento ou '*'
- [x] Envia HTTP POST com Content-Type application/json
- [x] Payload contém event, timestamp, project (slug, name) e data
- [x] Timeout de 10s por webhook
- [x] Erro de webhook individual não impede os demais (try/catch)
- [x] Sem retry — fire-and-forget
- [x] Registra resultado no agent-progress.txt: [WEBHOOK] POST {url} → {status}
- [x] Integrado nos pontos: feature_done (passing), feature_skip (skipped), completed, stopped, error
