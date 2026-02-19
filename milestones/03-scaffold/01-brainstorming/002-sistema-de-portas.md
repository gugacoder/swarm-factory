# Sistema de Portas XXYY

## Ideia central

Cada servico tem um sufixo de porta fixo (NN). O usuario escolhe um prefixo (XX). A porta dev resultante e `XXYY`. Isso permite multiplos projetos rodando simultaneamente sem conflito de portas.

## Estrutura

```
PORT_PREFIX=XX

Porta dev = XX{NN}
Porta Docker = porta interna padrao do servico (nunca muda)
```

## Faixas reservadas

- **XX00–XX09**: SRC (apps do usuario — frontend, backend, socket, etc.)
- **XX10–XX99**: PLAT (servicos de plataforma — postgres, redis, n8n, etc.)

## Mapa de sufixos fixos (PLAT)

| Sufixo (NN) | Servico     | Porta interna |
|-------------|-------------|---------------|
| 17          | MongoDB     | 27017         |
| 32          | PostgreSQL  | 5432          |
| 79          | Redis       | 6379          |
| 80          | Adminer     | 8080          |
| 81          | Meilisearch | 7700          |
| 82          | Evolution   | 8080          |
| 83          | n8n         | 5678          |
| 84          | Ollama      | 11434         |
| 85          | Whisper     | 8000          |

Os sufixos sao derivados dos 2 ultimos digitos da porta interna quando possivel (5432→32, 6379→79, 27017→17). Quando ha colisao (8080 usado por adminer, evolution), atribui sequencial a partir de 80.

## Exemplo concreto

Com `PORT_PREFIX=90`:
- PostgreSQL: `9032`
- Redis: `9079`
- n8n: `9083`
- Frontend: `9000`
- Backend: `9001`

Com `PORT_PREFIX=80` (outro projeto):
- PostgreSQL: `8032`
- Redis: `8079`
- n8n: `8083`
- Frontend: `8000`
- Backend: `8001`
