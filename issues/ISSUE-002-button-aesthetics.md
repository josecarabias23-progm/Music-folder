# Issue #002: Refactorización Estética y Sistema de Diseño de Botones

**Estado**: `Abierto`  
**Prioridad**: `Media`  
**Etiquetas**: `frontend`, `ui/ux`, `css`, `design-system`  

---

## 📌 Resumen del Problema
Los botones en la aplicación presentan inconsistencias visuales y de interacción:
1. **Mezcla de Estilos**: Se utilizan simultáneamente clases de CSS global (`.btn-primary`, `.btn-secondary`), estilos inline y clases utilitarias de Tailwind con bordes, rellenos y tipografías dispares.
2. **Inconsistencia Táctil en Móvil**: Varios botones en modales o tarjetas carecen de área de toque mínima accesible (`min-h-[44px]`), o desbordan contenedores en pantallas angostas (< 380px).
3. **Falta de Micro-animaciones y Estados**: Faltan estados hover/active fluidos, efectos de presión (active scale down), loaders dentro del botón durante peticiones asíncronas, y sombras coherentes con el tema oscuro.

---

## 🔍 Análisis Técnico y Causa Raíz

### 1. `apps/web/src/index.css`
- Existen definiciones legacy de `.btn-primary` y `.btn-secondary` con colores de gradiente antiguos que contrastan deficientemente con el fondo oscuro general (`#0f172a` / `#1e293b`).

### 2. `apps/web/src/App.tsx`
- Los botones dentro de formularios (login/registro), barras de acciones de grupos, modales y tarjetas de ensayos utilizan mezclas de padding (`py-1`, `py-2.5`, `px-3`, `px-6`) y alturas variables (`h-8`, `h-9`, `h-10`, `h-12`).

---

## 🎯 Tareas y Plan de Acción

- [ ] **Definir tokens de botones en `index.css`**
  - **Primario**: Gradiente refinado de alta gama (ej: `from-indigo-600 to-violet-600`), hover brillante, foco accesible (`focus:ring-2 focus:ring-indigo-500`).
  - **Secundario / Outline**: Fondo sutil de vidrio (`bg-slate-800/80 border border-slate-700 hover:bg-slate-700`), texto legible (`text-slate-200`).
  - **Peligro / Destructivo**: Tono rojo sutil con hover acentuado (`bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white`).
  - **Ghost / Icono**: Botón transparente para íconos de la barra superior y navegación con feedback táctil.

- [ ] **Estandarizar Tamaños y Adaptabilidad Responsive**
  - **Móvil (< 768px)**: `w-full` en modales y llamadas a la acción principales, altura mínima `min-h-[44px]` para cumplimiento de accesibilidad táctil.
  - **Escritorio (≥ 768px)**: `w-auto`, alineación `flex items-center gap-3`, alturas homogéneas (`h-10` o `h-11`).

- [ ] **Micro-interacciones y Estados de Carga**
  - Agregar `transition-all duration-200 active:scale-[0.98]` a todas las variantes de botones.
  - Crear un componente o clase utilitaria `<Button isLoading={...}>` con spinner SVG integrado para evitar doble clic durante peticiones API.

---

## 🛠️ Criterios de Aceptación
1. Todos los botones de la app siguen una jerarquía visual clara (Primario, Secundario, Peligro, Ghost).
2. Tienen un área de toque adecuada en móvil y no desbordan contenedores.
3. Incluyen animaciones suaves en hover/active y estado de carga mientras procesan acciones.
