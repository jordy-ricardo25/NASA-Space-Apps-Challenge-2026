import { CommandShell } from "@/features/shell";

/**
 * Shell común de la plataforma: barra superior, barra lateral y mundo 3D
 * persistente. Las rutas solo cambian los paneles que flotan encima.
 */
export default function PlatformLayout({ children }: LayoutProps<"/">) {
  return <CommandShell>{children}</CommandShell>;
}
