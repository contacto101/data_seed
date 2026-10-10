# Git y GitHub: reglas de trabajo (equipo con revisión)

Este proyecto es de un equipo. El trabajo del agente llega **hasta el pull request**
(propuesta de unir una rama a `main`). El agente nunca une nada: lo revisa y lo une
el equipo.

La persona que pide el trabajo no domina Git. En el chat, tras cada palabra técnica,
se explica entre paréntesis qué es, con pocas palabras. Se informa solo el resultado:
qué se guardó y el enlace del pull request.

## Límite del trabajo del agente
- El ciclo termina al abrir el pull request y entregar el enlace.
- **Nunca** se une (merge) un pull request, ni con auto-merge, aunque se pida
  sin que lo haya aprobado el equipo.
- **Nunca** se hace push a `main`, ni se cambian las reglas de protección de ramas,
  ni se descarta una revisión, ni se marca como resuelto un comentario ajeno.

## Pasos, en orden
1. **Rama.** Nunca trabajar en `main`. Nombre: `feat/<tema>`, `docs/<tema>`,
   `fix/<tema>` o `chore/<tema>`. Se crea desde `main` actualizado
   (`git fetch` y partir de `origin/main`).
2. **Revisar antes de guardar.** `git status` (qué archivos cambiaron) y
   `git diff` (qué cambió dentro). Añadir archivos **por nombre**; nunca `git add .`
   ni `git add -A`. Confirmar que no entra ninguna llave, token, archivo `.env` ni
   dato personal real. Lo que no pertenece al cambio queda fuera.
3. **Commits pequeños, de una sola idea.** Si el trabajo mezcla varias ideas,
   se parte en varios commits. Así el equipo revisa por partes.
4. **Mensaje en formato Conventional Commits:**
   `tipo(ámbito): resumen en imperativo, máximo 72 caracteres`.
   Tipos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.
   Cuerpo opcional: el **porqué**, no el qué.
   Ejemplo: `fix(login): evitar error al repetir el correo`.
5. **No saltarse el pre-commit** (revisión automática al guardar, si existe).
   Prohibido `--no-verify`. Si falla, se corrige la causa y se hace un commit
   **nuevo**; no usar `--amend` salvo pedido explícito.
6. **Antes de subir:** `git fetch` y comprobar que la rama no quedó atrás de `main`.
   Si quedó, traer los cambios de `main` a la rama y resolver los conflictos.
7. **Subir:** `git push -u origin <rama>`. Nunca `--force` ni push a `main`.
8. **Pull request** con `gh pr create`:
   - Título corto, con el mismo formato del commit.
   - Cuerpo con cuatro apartados: **Qué cambia**, **Por qué**, **Cómo se comprobó**,
     **Qué falta o queda bloqueado**.
   - Si el trabajo está incompleto, abrirlo como borrador (`--draft`).
   - Si el repositorio tiene plantilla de pull request, seguirla.
   - Pedir revisión solo a las personas indicadas por quien pide el trabajo.
     El agente no elige revisores.
9. **Después de abrirlo:** entregar el enlace y parar.

## Si el equipo pide cambios
- Se corrigen con commits **nuevos** en la misma rama y se suben con `git push`.
- Sin `--force`, sin `--amend`, sin reescribir commits ya subidos.
- Cada comentario se responde o se resuelve con un commit que lo explique.
  La decisión de darlo por resuelto es de quien lo escribió.

## Prohibido sin permiso explícito
- `git push --force`, `git reset --hard`, `git clean -f`, borrar ramas remotas,
  reescribir historial ya publicado.
- Saltarse hooks (`--no-verify`) o firmas.
- Commitear secretos, `.env`, llaves, credenciales o datos personales reales.
- Unir pull requests, cambiar la configuración del repositorio o de GitHub,
  cerrar o comentar issues ajenos.
- Subir a un repositorio que no sea el de este proyecto.

## Si una llave se sube por error
Avisar de inmediato. Borrarla en un commit nuevo no basta: queda en el historial.
La llave se revoca en el proveedor y se crea otra.
