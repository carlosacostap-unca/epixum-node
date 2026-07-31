# PocketBase MCP

Servidor MCP local por `stdio` para administrar los datos de PocketBase de este proyecto.

## Credenciales

El servidor carga directamente `.env.local` desde la raíz del repositorio y requiere:

- `NEXT_PUBLIC_POCKETBASE_URL`
- `POCKETBASE_ADMIN_EMAIL`
- `POCKETBASE_ADMIN_PASSWORD`

Las credenciales no se copian a la configuración de Codex ni se incluyen en las respuestas.

## Herramientas

- `pocketbase_health`
- `pocketbase_list_collections`
- `pocketbase_get_collection`
- `pocketbase_list_records`
- `pocketbase_get_record`
- `pocketbase_create_record`
- `pocketbase_update_record`

Las colecciones internas, los archivos, el borrado y los cambios de esquema están bloqueados. Las
consultas devuelven como máximo 100 registros y las escrituras aceptan hasta 100 KB de JSON.

## Comandos

```powershell
npm.cmd run mcp:pocketbase:test
npm.cmd run mcp:pocketbase:smoke
npm.cmd run mcp:pocketbase
```

Codex lo registra mediante `.codex/config.toml`. Reinicie Codex o vuelva a abrir el proyecto después
de modificar esa configuración.
