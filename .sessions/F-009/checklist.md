# F-009 — API get-status.mjs

- [x] Arquivo runs/.meta/api/get-status.mjs existe e exporta getStatus
- [x] Retorna state='not_initialized' quando workspace não existe
- [x] Retorna state='initialized' quando workspace existe mas sem features.json
- [x] Retorna state='idle' quando features.json existe e loop não ativo
- [x] Retorna state='running' quando PID ativo detectado
- [x] features contém contagem por status (pending, in_progress, failing, blocked, skipped, passing)
- [x] progress é porcentagem arredondada (passing/total*100)
- [x] Verificação de PID funciona cross-platform (Windows e Unix)
- [x] CLI com --format table e --format json
