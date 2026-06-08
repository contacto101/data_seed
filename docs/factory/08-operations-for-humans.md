# Operaciones para humanos

## Objetivo
Guiar al usuario en la gestión segura de la fábrica de agentes, señalando
actuaciones críticas o comprometedoras que requieren intervención.

## Cuándo debes intervenir
- creación o eliminación de agentes
- cambios de nivel de autonomía
- publicación de distributions
- modificaciones en `main` del repo
- creación de infraestructura o gastos
- activación de integraciones externas
- incidentes de seguridad o comportamiento anómalo

## Qué no debes delegar ciegamente
- aprobación de gastos
- exposición de credenciales
- cambios de identidad corporativa
- envío de comunicaciones externas sensibles
- decisiones legales o regulatorias

## Señales de alerta
- agente pide elevar su propia autonomía
- agente propone crear recursos en la nube sin justificación clara
- agente intenta versionar archivos con datos personales o secretos
- agente actúa fuera de su `SOUL.md` o nivel asignado

## Buenas prácticas
- revisar periódicamente Kanban y backlog
- exigir trazabilidad en cambios importantes
- mantener `main` protegido
- validar que distributions no contengan secretos
- tratar a cada agente como un sistema auditables, no como caja negra

## Checklist rápido antes de aprobar
- ¿está definido el propósito?
- ¿está definido el nivel de autonomía?
- ¿está claro el owner humano?
- ¿se respetan límites de credenciales?
- ¿es reversible?
