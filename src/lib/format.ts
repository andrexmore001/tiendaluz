/**
 * Formatea un número como precio en pesos colombianos (COP).
 * Usa el locale 'es-CO' para garantizar el separador de miles con punto (.)
 * independientemente del sistema operativo o navegador del usuario.
 *
 * Ejemplo: formatPrice(25000) → "25.000"
 */
export function formatPrice(value: number): string {
  return value.toLocaleString('es-CO');
}
