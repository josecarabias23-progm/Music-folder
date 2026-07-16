# Music Folder - OpenSpec Documentation

Este directorio contiene toda la especificación del proyecto Music Folder utilizando la filosofía **spec-driven** de OpenSpec.

---

## 📁 Estructura del Directorio

```
openspec/
├── config.yaml                              # Configuración de OpenSpec
├── specs/                                   # Especificaciones principales
│   ├── music-folder.md                     # 👈 EMPEZAR AQUÍ - Visión general del proyecto
│   ├── data-models.md                      # Definición de entidades y base de datos
│   ├── api-endpoints.md                    # Endpoints REST y sus especificaciones
│   ├── architecture.md                     # Diseño técnico y estructura de módulos
│   ├── tech-stack.md                       # Tecnologías seleccionadas y dependencias
│   └── file-structure.md                   # Estructura de archivos recomendada
├── changes/                                 # Cambios (características/fases) de OpenSpec
│   ├── 001-initial-api-spec.md             # Especificación inicial (requerimientos)
│   ├── 002-complete-initial-spec.md        # Especificación completa (propuesta + tareas)
│   └── archive/                            # Cambios completados
└── decisions/                              # Architecture Decision Records (ADRs)
```

---

## 🚀 Cómo Comenzar

### Lectura en Orden Recomendado

1. **[music-folder.md](specs/music-folder.md)** (5 min)
   - Visión general del proyecto
   - Características principales
   - User stories
   - Goals y non-goals

2. **[data-models.md](specs/data-models.md)** (10 min)
   - Entidades: User, Score, Instrument, RehearsalLog, Forum, Organization
   - Relaciones entre entidades
   - Reglas de validación

3. **[api-endpoints.md](specs/api-endpoints.md)** (15 min)
   - Todos los endpoints REST documentados
   - Request/response examples
   - Códigos de error
   - Autenticación y permisos

4. **[architecture.md](specs/architecture.md)** (20 min)
   - Estructura de módulos backend (NestJS)
   - Estructura de componentes frontend (React)
   - Capas y patrones de diseño
   - Estrategia de almacenamiento de archivos

5. **[tech-stack.md](specs/tech-stack.md)** (10 min)
   - Dependencias backend y versiones
   - Dependencias frontend y versiones
   - Herramientas de DevOps
   - Configuración de entorno

6. **[file-structure.md](specs/file-structure.md)** (10 min)
   - Estructura recomendada de carpetas
   - Convenciones de nombres
   - Ubicación de archivos de prueba
   - Mejores prácticas

7. **[changes/002-complete-initial-spec.md](changes/002-complete-initial-spec.md)** (15 min)
   - Propuesta completa del proyecto
   - Tareas de implementación por fase
   - Roadmap de 12 semanas
   - Criterios de éxito

**Total: ~85 minutos para entender todo el proyecto**

---

## 📊 Resumen Ejecutivo

### ¿Qué es Music Folder?
Una plataforma web para que músicos, directores y orquestas colaboren compartiendo partituras, registrando ensayos, aprendiendo sobre instrumentos y debatiendo en comunidad.

### Público Objetivo
- Músicos individuales
- Directores de orquestas/bandas
- Estudiantes de música
- Profesores de música

### Funcionalidades Principales
1. ✅ Gestión de partituras (subir, organizar, descargar)
2. ✅ Registros de ensayos (fecha, notas, participantes, archivos de referencia)
3. ✅ Enciclopedia de instrumentos (rango, transposición, técnicas)
4. ✅ Foro comunitario (discusiones temáticas, comentarios, moderation)
5. ✅ Organizaciones (bandas, orquestas con gestión de miembros)

### Stack Tecnológico
- **Backend**: NestJS + TypeScript + PostgreSQL + TypeORM
- **Frontend**: React + Vite + TypeScript + Tailwind + Zustand
- **Auth**: JWT + Passport.js
- **Storage**: S3-compatible (AWS S3, MinIO, Cloudinary)
- **Deployment**: Vercel (web) + Render (API)

### Roadmap (12 semanas)
- **Fase 1** (Semanas 1-4): Core API + endpoints principales
- **Fase 2** (Semanas 5-8): UI React + gestión de organizaciones
- **Fase 3** (Semanas 9-12): Optimización, análisis, lanzamiento

---

## 🎯 Flujo de Trabajo Recomendado

### Para Developers Backend

1. Lee [data-models.md](specs/data-models.md) para entender la estructura de datos
2. Lee [api-endpoints.md](specs/api-endpoints.md) para ver qué endpoints implementar
3. Lee [architecture.md](specs/architecture.md) para ver la estructura de módulos NestJS
4. Comienza con [changes/002-complete-initial-spec.md](changes/002-complete-initial-spec.md) **Phase 1 Tasks > Backend Setup**
5. Ejecuta las tareas en orden

### Para Developers Frontend

1. Lee [tech-stack.md](specs/tech-stack.md) para las dependencias React
2. Lee [architecture.md](specs/architecture.md) para ver la estructura de componentes
3. Lee [file-structure.md](specs/file-structure.md) para organizar las carpetas
4. Comienza con [changes/002-complete-initial-spec.md](changes/002-complete-initial-spec.md) **Phase 2 Tasks > Frontend Setup**

### Para Architects/Decision Makers

1. Lee [music-folder.md](specs/music-folder.md) para la visión
2. Revisa [data-models.md](specs/data-models.md) para la complejidad de datos
3. Lee [architecture.md](specs/architecture.md) para el diseño técnico
4. Consulta [tech-stack.md](specs/tech-stack.md) para decisiones tecnológicas
5. Revisa [changes/002-complete-initial-spec.md](changes/002-complete-initial-spec.md) para el roadmap

---

## 📋 Checklist para Comenzar la Implementación

- [ ] Todo el equipo ha leído [music-folder.md](specs/music-folder.md)
- [ ] Backend team ha leído [data-models.md](specs/data-models.md) y [api-endpoints.md](specs/api-endpoints.md)
- [ ] Frontend team ha leído [architecture.md](specs/architecture.md) 
- [ ] DevOps ha leído [tech-stack.md](specs/tech-stack.md)
- [ ] Se ha establecido el ambiente de desarrollo local
- [ ] Se ha inicializado el proyecto NestJS en `apps/api`
- [ ] Se ha inicializado el proyecto React en `apps/web`
- [ ] Se ha creado la base de datos PostgreSQL local
- [ ] Primera reunión de kickoff del equipo completada

---

## 🔄 Cómo Actualizar las Especificaciones

Cuando necesites cambiar, agregar o mejorar las especificaciones:

1. **Cambios menores** (errores, aclaraciones):
   - Edita el archivo spec directamente
   - Commitsea con mensaje: `docs: [archivo] - descripción del cambio`

2. **Cambios significativos** (nuevas entidades, endpoints, arquitectura):
   - Crea un nuevo archivo en `changes/` (ej: `003-add-notifications.md`)
   - Describe la propuesta, diseño y tareas
   - Actualiza las especificaciones principales según sea necesario

3. **Architecture Decision Records** (decisiones importantes):
   - Crea archivo en `decisions/adr-NNN-[descripción].md`
   - Documenta el contexto, alternativas consideradas y decisión tomada

---

## 📚 Conceptos Clave de OpenSpec

Music Folder sigue la **filosofía spec-driven** de OpenSpec:

### ¿Por qué Spec-Driven?
✅ **Claridad**: Todo el equipo entiende exactamente qué se construye  
✅ **Trazabilidad**: De especificación → tareas → código  
✅ **Eficiencia**: Se evita trabajo innecesario  
✅ **Documentación**: El código se documenta naturalmente  
✅ **Escalabilidad**: Fácil agregar features sin romper existentes  

### Estructura OpenSpec
- **Specs**: Qué se quiere construir (datos, APIs, arquitectura)
- **Changes**: Cómo se implementa por fases (propuestas, diseño, tareas)
- **Decisions**: Por qué se eligieron ciertas tecnologías/patrones

---

## 🔗 Enlaces Rápidos

### Especificaciones
- [Visión General](specs/music-folder.md)
- [Modelos de Datos](specs/data-models.md)
- [Endpoints de API](specs/api-endpoints.md)
- [Arquitectura](specs/architecture.md)
- [Stack Tecnológico](specs/tech-stack.md)
- [Estructura de Archivos](specs/file-structure.md)

### Cambios & Tareas
- [Cambio #1 - API Inicial](changes/001-initial-api-spec.md)
- [Cambio #2 - Especificación Completa](changes/002-complete-initial-spec.md)
- [Cambios Archivados](changes/archive/)

---

## ❓ Preguntas Frecuentes

**P: ¿Por dónde empiezo si soy nuevo en el proyecto?**  
R: Lee [music-folder.md](specs/music-folder.md) primero, luego las otras especificaciones en orden.

**P: ¿Dónde están las tareas de implementación?**  
R: En [changes/002-complete-initial-spec.md](changes/002-complete-initial-spec.md) bajo la sección "Tasks", organizadas por fase.

**P: ¿Qué pasa si necesito cambiar la especificación?**  
R: Crea un nuevo archivo en `changes/` describiendo el cambio, o edita directamente si es un error menor.

**P: ¿Cómo se relaciona esto con el código real?**  
R: Las especificaciones guían el desarrollo. El backend sigue [api-endpoints.md](specs/api-endpoints.md), el frontend sigue [architecture.md](specs/architecture.md), etc.

**P: ¿Es necesario leer todas las especificaciones?**  
R: Depende de tu rol. Los backends leen data-models y api-endpoints. Los frontend leen architecture. Todo el mundo lee music-folder.md.

---

## 📞 Soporte

Para preguntas sobre las especificaciones:
1. Revisa la documentación relacionada
2. Busca en [issues de GitHub] si ya fue preguntado
3. Abre un nuevo issue si no encuentras respuesta

Para cambios en las especificaciones:
- Crea un PR con los cambios
- Incluye justificación en la descripción
- Espera aprobación del arquitecto del proyecto

---

## 📝 Notas de Versión

### Version 1.0 (2024-01-20)
- ✅ Especificación inicial completa
- ✅ Data models definidos
- ✅ API endpoints documentados
- ✅ Arquitectura diseñada
- ✅ Stack tecnológico seleccionado
- ✅ Roadmap de 12 semanas

### Próximas Actualizaciones
- [ ] Seguridad & autenticación (Phase 1)
- [ ] Migración de base de datos (Phase 1)
- [ ] Notificaciones (Phase 2+)
- [ ] Búsqueda avanzada (Phase 3+)

---

**Última actualización**: 2024-01-20  
**Versión de especificación**: 1.0  
**Estado**: ✅ Listo para implementación
