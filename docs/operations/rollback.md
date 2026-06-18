# Rollback — reorganización de información

## Commit base

Capturar antes de ejecutar:

```bash
git rev-parse HEAD
```

En esta ejecución la rama se creó desde `10394d6`.

## Antes de merge

```bash
git checkout refactor/repo-information-architecture
git reset --hard 10394d6
git clean -fd -- .hermes docs scripts site archive README.md .gitignore
```

## Después de push pero antes de merge

```bash
git checkout refactor/repo-information-architecture
git revert <commit_reorganizacion>
git push
```

## Si falla cron

1. Mantener o restaurar wrapper `daily-operations-wrapper.sh`.
2. Verificar con `bash -n`.
3. Ejecutar wrapper fuera de ventana horaria y confirmar exit 0.
4. Revisar salida de cron `ea05ea193912`.
5. Si la falla persiste, revertir commit de reorganización.

## Si falla landing

1. Abrir `site/index.html` directamente.
2. Confirmar que `site/assets/dataseed_logo_black.png` existe.
3. Si el hosting requiere root, usar el wrapper `index.html` o revertir el move de `site/`.
