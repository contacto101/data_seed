# Fábrica de agentes Demeter — Visión general

Documentación maestra para la fabricación automática de agentes dentro de DataSeed.
Objetivo: estandarizar cómo Demeter crea, lanza y gobierna agentes Hermes de forma
reproducible, auditable y reversible.

Alcance:
- creación de agentes por perfil Hermes
- parametrización por nivel de autonomía aprobado por el usuario
- empaquetado y publicación como profile distribution
- coordinación multi-agente vía Kanban
- gobernanza, límites y restricciones operativas

Principios:
1. Autonomía escalonada, nunca total por defecto.
2. Memorias y credenciales nunca viajan entre máquinas.
3. Todo agente fabricado debe poder auditarse, pausarse y eliminarse.
4. Roles y responsabilidades separadas: orchestrator vs workers.
5. Documentos operativos en rama dedicada del repo, no en raíz histórica.

Estructura relacionada en el repo:
- `docs/factory/01-concepts-and-architecture.md`
- `docs/factory/02-agent-identity-and-profiles.md`
- `docs/factory/03-autonomy-levels-and-governance.md`
- `docs/factory/04-build-profiles-and-distributions.md`
- `docs/factory/05-kanban-and-multi-agent-ops.md`
- `docs/factory/06-security-and-credentials.md`
- `docs/factory/07-runbooks-for-critical-actions.md`
- `docs/factory/08-operations-for-humans.md`
