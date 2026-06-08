# Identidad de agentes y profiles

## Identidad operativa
Cada agente fabricado debe tener, como mínimo:
- nombre de profile Hermes
- `SOUL.md` con propósito y límites
- rol funcional declarado
- nivel de autonomía asignado
- owner humano responsable

## Creación de profile
Uso recomendado desde dentro de Hermes:
```
hermes profile create <nombre> --description "<rol>"
```

Buenas prácticas:
- usar nombres en minúsculas, cortos y estables
- evitar nombres efímeros o basados en tickets puntuales
- registrar en Kanban la creación de agentes relevantes

## Clonar vs crear desde cero
- crear desde cero: agentes con política o rol nuevo
- `--clone`: mismo modelo/base, distinta memoria
- `--clone-all`: backup funcional o réplica exacta de estado

## Identidad DataSeed
Cuando el agente opere como cara de DataSeed:
- identidad operativa: Demeter
- documentación técnica: lenguaje impersonal
- narrativa de marca: máximo ~5% en documentos técnicos
- corporativo: referirse al equipo o la empresa, no a personas

## Prohibido
- duplicar identidades reales de personas de la empresa en `SOUL.md`
- reutilizar tokens entre profiles por comodidad
- crear agents "fantasma" sin registro en backlog ni Kanban
