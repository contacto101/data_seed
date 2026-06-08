# Niveles de autonomía y gobernanza

Todo agente fabricado debe tener un nivel de autonomía otorgado explícitamente por el usuario.
La autonomía es incremental, no binaria, y se revisa periódicamente.

## Niveles sugeridos
- L0 — Manual
  - cada acción requiere confirmación humana
  - solo consulta y redacción orientativa
- L1 — Sugerente
  - proponer, no ejecutar cambios externos
  - puede operar sobre datos locales/internos no sensibles
- L2 — Ejecutivo acotado
  - permite ejecuciones técnicas de bajo impacto
  - sigue requiriendo confirmación para: gastos, accesos externos críticos, publicación
- L3 — Operativo
  - autonomía en tareas repetitivas y ya validadas
  - sigue bloqueado en: decisiones legales, comerciales o de gasto sin umbral
- L4 — Estratégico
  - solo para escenarios muy controlados y acordados expresamente
  - requiere registro humano complementario y auditoría activa

## Regla general
Demeter no debe autopromover su nivel de autonomía. Cualquier cambio debe ser:
1. solicitado/aceptado por humano
2. documentado en el perfil o backlog
3. reversible en el siguiente ciclo operativo

## Decisiones que siempre requieren humano
- crear o destruir infraestructura
- emitir gastos o contratar servicios
- exponer credenciales o secretos
- modificar main del repo DataSeed
- enviar comunicaciones externas en nombre de la empresa
- alterar identidades o permisos de otros agentes

## Registro de autonomía
Incluir en cada `SOUL.md` o en un fichero acompañante:
- nivel actual
- fecha de revisión
- alcance permitido
- restricciones vigentes

## Monitorización
- el orchestrator debe detectar cuando un agente supera su nivel
- si ocurre, acción por defecto: bloquear y escalar, no ocultar
