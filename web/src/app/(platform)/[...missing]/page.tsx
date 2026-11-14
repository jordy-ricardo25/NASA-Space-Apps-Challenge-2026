import { notFound } from "next/navigation";

/**
 * Cualquier ruta desconocida muestra el aviso "no encontrada" dentro del
 * centro de mando (con sus barras y el mundo 3D), no una página aparte.
 */
export default function MissingPage() {
  notFound();
}
