# Kanban y operaciones multi-agente

## Obventivo
Documentar cómo Demeter utiliza Kanban para coordinar múltiples agentes en ejecución
controlada, manteniendo separación de responsabilidades.

## Perfiles implicados
- orquestador: planifica, asigna, consolida
- workers: ejecutan tareas específicas
- auditor/operador humano: aprueba acciones críticas

## Flujos de trabajo habituales
1. orquestador crea tarea
2. orquestador asigna a worker disponible
3. worker ejecuta y notifica estado
4. orquestador consolida y siguiente ciclo

## Estándares de operación
- tareas críticas: siempre requieren aceptación humana antes de cierre
- tareas repetitivas: pueden cerrarse automáticamente si no hay excepciones
- cambios de estado inesperados deben generar comentario en Kanban y notificación

## Políticas por nivel de autonomía
- L0 / L1: tareas se crean pero no se ejecutan sin humano
- L2: workers operan dentro de tareas aprobadas
- L3: workers cierran tareas rutinarias, derivan casos atípicos
- L4: solo si fue acordado explícitamente por el usuario

## Señales de escalamiento
Demeter debe escalar a humano cuando:
- hay bloqueo técnico sostenido
- aparece impacto financiero o legal
- hay conflicto entre agentes
- se intenta exceder el nivel de autonomía aprobado

## Auditoría
- toda acción relevante debe quedar reflejada en Kanban
- decisiones no triviales deben quedar en comentario de tarea
- Periódicamente revisar tareas completadas buscando inconsistencias
