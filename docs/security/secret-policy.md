# Política de secretos DataSeed

## Nunca commitear

- `.env` reales.
- GitHub tokens o PATs.
- OAuth tokens/client secrets.
- API keys.
- Credenciales Google/Firebase.
- Sesiones de WhatsApp o mensajería.
- Bases runtime (`*.db`, `*.sqlite`, WAL/SHM).
- Logs completos, dumps de conversaciones o adjuntos de usuario.

## Antes de push

- Revisar `git diff`.
- Buscar patrones `token`, `secret`, `password`, `api_key` en líneas agregadas.
- Ejecutar `backups/restore.sh` para verificar archivos prohibidos trackeados.

## Graphify

El grafo puede revelar estructura del repo; solo versionar reportes livianos y no subir caches o dumps grandes.
