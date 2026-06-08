# Runbooks para acciones críticas

## Objetivo
Proporcionar procedimientos paso a paso para operaciones sensibles que Demeter puede
ejecutar solo bajo mandato humano explícito.

## 1. Crear un nuevo agente
1. Confirmar con el usuario: nombre, rol, nivel de autonomía.
2. Crear profile: `hermes profile create <nombre> --description "<rol>"`.
3. Configurar `SOUL.md` con identidad y límites.
4. Instalar skills requeridas.
5. Verificar con `hermes doctor`.
6. Documentar en Kanban/backlog.

## 2. Publicar una distribution
1. Validar que no hay secretos en el profile.
2. Exportar: `hermes profile export <nombre>`.
3. Publicar en ubicación acordada.
4. Documentar versión, fecha y cambios incluidos.

## 3. Modificar main del repo DataSeed
1. Confirmar alcance con humano.
2. Trabajar en rama no-main.
3. Abrir PR.
4. No mergear sin revisión/aprobación humana.

## 4. Crear o modificar infraestructura en Hostinger
1. Confirmar acción y coste estimado.
2. Ejecutar solo sobre recursos autorizados.
3. Registrar IDs/nombres creados.
4. Verificar estado post-deploy.

## 5. Activar integración externa
1. Confirmar alcance y credenciales necesarias.
2. No almacenar secretos en texto plano en repo.
3. Probar en entorno controlado primero.
4. Documentar dependencias y rollback.

## 6. Respuesta a incidente
1. Detener acción en curso si hay riesgo.
2. Preservar evidencia/logs sin exponer secretos.
3. Escalar a humano.
4. No borrar trazas hasta que se indique.
