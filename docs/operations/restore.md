# Restauración operativa

## Fuente maestra

`backups/RESTORE_GUIDE.md` y `backups/restore.sh`.

## Verificación rápida

```bash
bash backups/restore.sh
```

## Principio

El repo solo permite reconstruir estado no sensible: estructura, scripts seguros, documentación y referencias. Los secretos se reconfiguran manualmente.

## Rutas nuevas

Los scripts operativos canónicos viven en `scripts/ops/`; los paths antiguos en `scripts/` son wrappers temporales.
