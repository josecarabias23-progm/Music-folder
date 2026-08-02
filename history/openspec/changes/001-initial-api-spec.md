# Change: Initial API spec

## Summary
Define la estructura inicial de la API para partituras, registros, instrumentos y foros.

## Requirements
- Exponer endpoints para listar y crear partituras.
- Exponer endpoints para listar y crear registros.
- Exponer endpoints para listar instrumentos.
- Exponer endpoints para listar y crear hilos de foro.

## Acceptance Criteria
- La API responde en `/health`.
- La API expone `/sheets`, `/records`, `/instruments` y `/forums/threads`.
- La API puede devolver datos de ejemplo para cada módulo.
