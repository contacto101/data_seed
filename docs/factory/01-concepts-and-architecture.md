# Conceptos y arquitectura de fábrica

## Propósito
Definir qué es "fabricar un agente" para Demeter y qué piezas técnicas intervienen dentro
del ecosistema Hermes: profiles, skills, cron, Kanban, delegación y distribuciones.

## Conceptos clave
- **Agente**: una instancia lógica de Hermes con identidad, personalidad, memoria y límites propios.
- **Fábrica**: proceso automatizado mediante el cual Demeter construye nuevos agentes a partir de
  parámetros definidos por el usuario y procedimientos validados.
- **Worker**: agente de ejecución focalizada, normalmente sin acceso a decisiones estratégicas.
- **Orchestrator**: agente que planifica, reparte trabajo y consolida resultados.
- **Profile**: aislamiento de estado Hermes (config, .env, memoria, sesiones).
- **Distribution**: artefacto empaquetado que permite replicar un agente en otra máquina sin compartir credenciales.

## Capas de la fábrica
1. **Capa de definición**
   - identidad: nombre, rol, `SOUL.md`
   - nivel de autonomía aprobado
   - permisos, toolsets y límites
2. **Capa de construcción**
   - creación del profile Hermes
   - instalación de skills requeridas
   - configuración inicial no sensible
3. **Capa de operación**
   - puesta en marcha bajo Kanban o cron
   - monitoreo, heartbeat, bloqueos
4. **Capa de gobernanza**
   - revisión de acciones críticas
   - trazabilidad de cambios
   - capacidad de pausar/deshacer

## Decisiones arquitectónicas
- no crear agentes fuera de proceso Hermes sin justificación técnica
- no mezclar estados entre agentes salvo por tablero Kanban
- toda construcción debe poder documentarse en git como bitácora operativa

## Relación con otras guías
- la operación diaria se apoya en `07-runbooks-for-critical-actions.md`
- la interfaz humana está en `08-operations-for-humans.md`
- Kanban se detalla en `05-kanban-and-multi-agent-ops.md`
