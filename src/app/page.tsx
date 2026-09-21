import { redirect } from "next/navigation";

/**
 * Home de la app: redirige al primer módulo disponible.
 * Cuando existan más módulos, este archivo puede convertirse en un
 * selector de módulos en vez de un redirect fijo.
 */
export default function HomePage() {
  redirect("/evaluacion-preventiva");
}
