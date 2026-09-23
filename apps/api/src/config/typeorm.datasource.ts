import 'reflect-metadata';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { buildDataSourceOptions } from './database.config';

/**
 * DataSource usado exclusivamente por el CLI de TypeORM.
 *
 * La aplicación NO usa este archivo: se conecta a través de `TypeOrmModule`
 * (`AppModule`), que arma sus opciones con la misma función
 * `buildDataSourceOptions()` para no duplicar la configuración de conexión.
 *
 * ⚠️ ESTE ARCHIVO DEBE TENER EXACTAMENTE UNA EXPORTACIÓN, y debe ser la instancia
 * de DataSource. El CLI recorre las exportaciones del módulo y aborta con
 * «Given data source file must contain only one export of DataSource instance»
 * si encuentra más de una instancia (p. ej. un `export const` ADEMÁS del
 * `export default` apuntando al mismo objeto).
 *
 * Los helpers de configuración viven en `database.config.ts` y sólo se IMPORTAN:
 * nunca se re-exportan desde aquí.
 *
 * Comandos:
 *   npm --workspace apps/api run migration:run        (producción, desde dist/)
 *   npm --workspace apps/api run migration:run:dev    (desarrollo, con ts-node)
 *   npm --workspace apps/api run migration:generate -- src/migrations/<Nombre>
 */

/** `true` cuando el CLI corre sobre TypeScript (ts-node) en lugar de `dist/`. */
const isTypeScriptRuntime = __filename.endsWith('.ts');

/**
 * Las migraciones se resuelven según el runtime: `src/migrations/*.ts` con ts-node
 * y `dist/migrations/*.js` sobre el build compilado.
 */
const migrationsGlob = path.join(
  __dirname,
  isTypeScriptRuntime ? '../migrations/*.ts' : '../migrations/*.js',
);

// Sin `export`: la instancia se expone únicamente mediante `export default` para
// que el CLI la detecte como única.
const AppDataSource = new DataSource({
  ...buildDataSourceOptions(),
  // El CLI NUNCA debe sincronizar automáticamente ni ejecutar migraciones en la inicialización:
  // sólo aplica migraciones cuando se ejecuta el comando `migration:run`.
  synchronize: false,
  migrationsRun: false,
} as DataSourceOptions);

export default AppDataSource;