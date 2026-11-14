"use client";

import { RotateCcw } from "lucide-react";
import { l, type L } from "@/content/i18n";
import { Segmented } from "@/shared/components/Controls";
import { Workspace } from "@/shared/components/Workspace";
import { useLang } from "@/shared/hooks/useLang";
import { appStore, setPrefs, toast, type Quality, type Role, type Units } from "@/shared/lib/appStore";
import { useStore } from "@/shared/lib/store";
import styles from "./Settings.module.scss";

const ROLES: { value: Role; label: L }[] = [
  { value: "operator", label: l("Operador", "Operator") },
  { value: "engineer", label: l("Ingeniero", "Engineer") },
  { value: "researcher", label: l("Investigador", "Researcher") },
  { value: "student", label: l("Estudiante", "Student") },
];

/** Fila de ajuste: título, explicación y control. */
function Row({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <li className={styles.row}>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className={styles.control}>{children}</div>
    </li>
  );
}

/**
 * Ajustes: idioma, unidades, calidad del 3D, movimiento y rol de uso.
 * No hay cuentas: todo se guarda solo en el navegador.
 */
export function SettingsView() {
  const { t, lang } = useLang();
  const units = useStore(appStore, (s) => s.units);
  const quality = useStore(appStore, (s) => s.quality);
  const reduceMotion = useStore(appStore, (s) => s.reduceMotion);
  const role = useStore(appStore, (s) => s.role);

  return (
    <Workspace
      eyebrow={l("AJUSTES", "SETTINGS")}
      title={l("Preferencias del centro de mando", "Command centre preferences")}
      lede={l("Sin cuentas ni datos personales: tus preferencias se guardan solo en este navegador.", "No accounts or personal data: your preferences are stored only in this browser.")}
    >
      <ul className={styles.list}>
        <Row title={t(l("Idioma", "Language"))} text={t(l("Idioma de la interfaz y de las respuestas del asistente.", "Language of the interface and of the assistant's answers."))}>
          <Segmented value={lang} options={[{ value: "es", label: "Español" }, { value: "en", label: "English" }]} onChange={(v) => setPrefs({ lang: v })} />
        </Row>
        <Row title={t(l("Unidades de presión", "Pressure units"))} text={t(l("El sistema calcula en SI; puedes ver la presión en kPa o en psi.", "The system computes in SI; you can view pressure in kPa or psi."))}>
          <Segmented<Units> value={units} options={[{ value: "si", label: "kPa (SI)" }, { value: "psi", label: "psi" }]} onChange={(v) => setPrefs({ units: v })} />
        </Row>
        <Row title={t(l("Calidad del 3D", "3D quality"))} text={t(l("En automático, la plataforma ajusta el detalle para mantener la fluidez. El cambio se aplica al recargar.", "On automatic, the platform tunes detail to stay fluid. The change applies on reload."))}>
          <Segmented<Quality>
            value={quality}
            options={[
              { value: "auto", label: t(l("Automática", "Automatic")) },
              { value: "high", label: t(l("Alta", "High")) },
              { value: "low", label: t(l("Baja", "Low")) },
            ]}
            onChange={(v) => {
              setPrefs({ quality: v });
              toast(l("Calidad guardada. Recarga para aplicarla.", "Quality saved. Reload to apply it."));
            }}
          />
        </Row>
        <Row title={t(l("Reducir movimiento", "Reduce motion"))} text={t(l("Desactiva las transiciones, el giro automático de la cámara y el parpadeo de la llama.", "Turns off transitions, automatic camera rotation and flame flicker."))}>
          <Segmented value={reduceMotion ? "on" : "off"} options={[{ value: "off", label: t(l("No", "No")) }, { value: "on", label: t(l("Sí", "Yes")) }]} onChange={(v) => setPrefs({ reduceMotion: v === "on" })} />
        </Row>
        <Row title={t(l("Rol de uso", "Usage role"))} text={t(l("Orienta los mensajes del guía y el orden de lectura sugerido.", "Tunes the guide's messages and the suggested reading order."))}>
          <Segmented<Role> value={role} options={ROLES.map((r) => ({ value: r.value, label: t(r.label) }))} onChange={(v) => setPrefs({ role: v })} />
        </Row>
        <Row title={t(l("Bienvenida del guía", "Guide welcome"))} text={t(l("Vuelve a mostrar el mensaje de bienvenida de FUEGO en el inicio.", "Show FUEGO's welcome message on the home screen again."))}>
          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              setPrefs({ welcomed: false });
              toast(l("Bienvenida restablecida", "Welcome restored"));
            }}
          >
            <RotateCcw size={14} aria-hidden="true" />
            {t(l("Restablecer", "Restore"))}
          </button>
        </Row>
      </ul>
    </Workspace>
  );
}
