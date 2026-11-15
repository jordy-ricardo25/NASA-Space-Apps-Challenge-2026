"use client";

import { Children, useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { l } from "@/content/i18n";
import { useLang } from "@/shared/hooks/useLang";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
import styles from "./Carousel.module.scss";

interface CarouselProps {
  /** Nombre accesible del carrusel (qué contiene). */
  label: string;
  /** Cada hijo es una diapositiva. */
  children: React.ReactNode;
  /** Velocidad del desplazamiento automático, en píxeles por segundo. */
  speed?: number;
}

/** Tiempo con el ratón quieto tras el cual se reanuda el avance automático. */
const HOVER_IDLE_MS = 1500;

/** Pausa del desplazamiento automático tras usar flechas, puntos, teclas o el dedo. */
const HOLD_MS = 1600;

/** Tarjetas visibles a la vez, medidas en el DOM (las decide el CSS según el ancho). */
function visibleSlides(el: HTMLElement): number {
  const first = el.children[0] as HTMLElement | undefined;
  if (!first || first.offsetWidth < 1) return 1;
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
  return Math.max(1, Math.round((el.clientWidth + gap) / (first.offsetWidth + gap)));
}

/**
 * Carrusel horizontal propio, sin librerías: el desplazamiento y el encaje son
 * de CSS (`scroll-snap`), así que el arrastre con el dedo es nativo. Añade
 * flechas, puntos, teclas de flecha y un desplazamiento automático continuo
 * (las tarjetas se deslizan sin saltos desde que se entra, y al llegar al
 * final vuelven en sentido contrario). Se pausa al mover el ratón encima, al
 * enfocar con el teclado o al tocar, y no existe si la persona pidió reducir
 * el movimiento. Las tarjetas visibles a la vez las decide el CSS
 * (3 en escritorio, 2 en tableta, 1 en móvil).
 */
export function Carousel({ label, children, speed = 60 }: CarouselProps) {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const trackId = useId();
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const current = useRef(0);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hold = useRef(0); // el deslizamiento automático espera hasta este instante
  const dir = useRef(1); // 1 avanza, -1 regresa
  const settle = useRef(false); // tras soltar el dedo, alinear con una tarjeta
  const count = Children.count(children);
  const [index, setIndex] = useState(0);
  // 3 es lo que se ve en escritorio; el valor real se mide al montar.
  const [perView, setPerView] = useState(3);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [touch, setTouch] = useState(false);
  const [stopped, setStopped] = useState(false);

  const maxIndex = Math.max(0, count - perView);
  const pages = Math.ceil(count / perView);
  const page = index >= maxIndex ? pages - 1 : Math.floor(index / perView);
  const canPlay = !reduced && count > perView;
  const playing = canPlay && !stopped && !hover && !focus && !touch;

  /** Lleva la diapositiva `i` al borde izquierdo; pasa del final al inicio y viceversa. */
  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      const first = el?.children[0] as HTMLElement | undefined;
      if (!el || !first) return;
      const last = Math.max(0, el.children.length - visibleSlides(el));
      const target = i < 0 ? last : i > last ? 0 : i;
      const slide = el.children[target] as HTMLElement;
      // Los puntos responden al instante; el desplazamiento lo confirma después.
      current.current = target;
      setIndex(target);
      hold.current = performance.now() + HOLD_MS;
      el.scrollTo({ left: slide.offsetLeft - first.offsetLeft, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  /** Lee del desplazamiento cuál es la primera diapositiva visible. */
  const onScroll = (): void => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = track.current;
      const first = el?.children[0] as HTMLElement | undefined;
      if (!el || !first) return;
      let best = 0;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) best = Math.max(0, el.children.length - visibleSlides(el));
      else {
        let dist = Infinity;
        Array.from(el.children).forEach((child, i) => {
          const d = Math.abs((child as HTMLElement).offsetLeft - first.offsetLeft - el.scrollLeft);
          if (d < dist) [dist, best] = [d, i];
        });
      }
      current.current = best;
      setIndex(best);
    });
  };

  // Cuántas tarjetas caben: se mide, porque lo decide el CSS según el ancho.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPerView(visibleSlides(el)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Desplazamiento automático continuo: unos píxeles por fotograma, sin saltos.
  useEffect(() => {
    const el = track.current;
    if (!playing || !el) return;
    let raf = 0;
    let last = 0;
    let pos = el.scrollLeft;
    const step = (now: number): void => {
      raf = requestAnimationFrame(step);
      const dt = Math.min(50, now - (last || now));
      last = now;
      // Mientras la persona navega a mano, solo se sigue su posición.
      if (now < hold.current) {
        pos = el.scrollLeft;
        return;
      }
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      pos += (dir.current * speed * dt) / 1000;
      if (pos >= max) [pos, dir.current] = [max, -1];
      else if (pos <= 0) [pos, dir.current] = [0, 1];
      el.scrollLeft = pos;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  // Al soltar el dedo, cuando el impulso termina, se alinea con la tarjeta más cercana.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onEnd = (): void => {
      if (!settle.current) return;
      settle.current = false;
      goTo(current.current);
    };
    el.addEventListener("scrollend", onEnd);
    return () => el.removeEventListener("scrollend", onEnd);
  }, [goTo]);

  const onTouchEnd = (): void => {
    settle.current = true;
    hold.current = performance.now() + HOLD_MS;
    setTouch(false);
  };

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(idle.current);
    },
    [],
  );

  // El carrusel ocupa casi toda la pantalla: si bastara con tener el ratón
  // encima, nunca avanzaría. Se pausa mientras el ratón se mueve sobre él y
  // se reanuda cuando lleva un momento quieto o sale.
  const onPointerMove = (e: React.PointerEvent): void => {
    if (e.pointerType !== "mouse") return;
    setHover(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setHover(false), HOVER_IDLE_MS);
  };
  const onPointerLeave = (): void => {
    clearTimeout(idle.current);
    setHover(false);
  };

  const onKeyDown = (e: React.KeyboardEvent): void => {
    const move = { ArrowLeft: current.current - 1, ArrowRight: current.current + 1, Home: 0, End: maxIndex }[e.key];
    if (move === undefined || e.altKey || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    goTo(move);
  };

  return (
    <section
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      // Solo el foco de teclado pausa: un clic en una flecha no lo detiene para siempre.
      onFocus={(e) => e.target.matches(":focus-visible") && setFocus(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocus(false)}
      onTouchStart={() => setTouch(true)}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div id={trackId} ref={track} className={styles.track} data-snap={!canPlay || stopped} tabIndex={0} aria-live={playing ? "off" : "polite"} onScroll={onScroll}>
        {Children.map(children, (child, i) => (
          <div className={styles.slide} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${count}`}>
            {child}
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.arrow} aria-controls={trackId} aria-label={t(l("Tarjeta anterior", "Previous card"))} onClick={() => goTo(current.current - 1)}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <div className={styles.dots}>
          {Array.from({ length: pages }, (_, p) => (
            <button
              key={p}
              type="button"
              className={styles.dot}
              aria-controls={trackId}
              aria-current={p === page ? "true" : undefined}
              aria-label={`${t(l("Ir al grupo", "Go to group"))} ${p + 1} ${t(l("de", "of"))} ${pages}`}
              onClick={() => goTo(Math.min(p * perView, maxIndex))}
            />
          ))}
        </div>
        {canPlay && (
          <button
            type="button"
            className={styles.arrow}
            data-kind="play"
            aria-label={stopped ? t(l("Reanudar el avance automático", "Resume auto-advance")) : t(l("Pausar el avance automático", "Pause auto-advance"))}
            onClick={() => setStopped((v) => !v)}
          >
            {stopped ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
          </button>
        )}
        <button type="button" className={styles.arrow} aria-controls={trackId} aria-label={t(l("Tarjeta siguiente", "Next card"))} onClick={() => goTo(current.current + 1)}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
