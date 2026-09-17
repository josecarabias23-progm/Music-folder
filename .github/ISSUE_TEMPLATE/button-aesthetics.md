---
name: 'Refactorización Estética y Sistema de Diseño de Botones'
about: 'Estandarización de variantes, tamaños táctiles responsivos y micro-interacciones de botones'
title: 'style(ui): refactorización estética y sistema de diseño de botones'
labels: 'ui/ux, css, frontend'
assignees: ''
---

## 📌 Resumen del Problema
Los botones en la aplicación presentan inconsistencias visuales y de interacción:
1. **Mezcla de Estilos**: Se utilizan simultáneamente clases de CSS global (`.btn-primary`, `.btn-secondary`), estilos inline y clases utilitarias de Tailwind con bordes, rellenos y tipografías dispares.
2. **Inconsistencia Táctil en Móvil**: Varios botones en modales o tarjetas carecen de área de toque mínima accesible (`min-h-[44px]`), o desbordan contenedores en pantallas angostas (< 380px).
3. **Falta de Micro-animaciones y Estados**: Faltan estados hover/active fluidos, efectos de presión (active scale down), loaders dentro del botón durante peticiones asíncronas, y sombras coherentes con el tema oscuro.

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
