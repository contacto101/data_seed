# Construcción de profiles y distributions

## Objetivo
Detallar cómo Demeter construye agentes reproducibles dentro y fuera del entorno DataSeed,
con énfasis en trazabilidad y reversibilidad.

## Flujo estándar de construcción
1. Definir propósito y nivel de autonomía.
2. Validar que el nombre de profile no colisione.
3. Crear profile con `hermes profile create`.
4. Configurar `SOUL.md`, toolsets y modelo requerido.
5. Instalar skills necesarias con `hermes skills install`.
6. Verificar con `hermes doctor` y `hermes -p <nombre> setup`.
7. Documentar la creación en Kanban o backlog técnico.

## Parámetros mínimos de entrada
Para que la fábrica sea reproducible, cada construcción debe capturar:
- nombre
- rol / descripción
- nivel de autonomía aprobado
- owner humano
- toolsets habilitados
- skills específicas
- si nuevo, clonado o importado

## Distributions
Cuando se quiera reutilizar un agente como "producto DataSeed":
- empaquetar con `hermes profile export`
- publicar en ubicación acordada
- asegurar que distribución no contenga `.env`, tokens, secretos ni memorias privadas
- nunca incluir `google_token.json`, `auth.json`, claves API ni credenciales OAuth

## Plantillas y reutilización
Para mantener consistencia:
- usar una plantilla base de `SOUL.md`
- mantener checklist de skills por rol
- documentar supuestos del modelo y proveedor verificados

## Restricciones
- la construcción automática no debe crear gastos en la nube por sí misma
- no debe tocar `main` del repo sin autorización humana expresa
- debe poder pausarse o deshacerse sin impacto lateral
