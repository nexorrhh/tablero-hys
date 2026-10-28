"use client";

import { useRef, useState } from "react";

interface FirmaPadProps {
  label: string;
  onFirmaLista: (dataUrl: string | null) => void;
}

/**
 * Pad de firma con canvas puro (sin librerías): el instructor firma con el
 * dedo/mouse al cargar la capacitación. `onFirmaLista` se llama con un PNG
 * en base64 cuando hay al menos un trazo, o `null` si se borra.
 */
export function FirmaPad({ label, onFirmaLista }: FirmaPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const [tieneTrazo, setTieneTrazo] = useState(false);

  function getContext(): CanvasRenderingContext2D | null {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function posicion(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = getContext();
    if (!ctx) return;
    dibujando.current = true;
    const { x, y } = posicion(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dibujando.current) return;
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = posicion(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1c1c1c";
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!tieneTrazo) setTieneTrazo(true);
  }

  function handlePointerUp() {
    if (!dibujando.current) return;
    dibujando.current = false;
    if (canvasRef.current && tieneTrazo) {
      onFirmaLista(canvasRef.current.toDataURL("image/png"));
    }
  }

  function handleBorrar() {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTieneTrazo(false);
    onFirmaLista(null);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <canvas
        ref={canvasRef}
        width={400}
        height={140}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full touch-none rounded-md border border-slate-300 bg-white"
        style={{ maxWidth: 400 }}
      />
      <button
        type="button"
        onClick={handleBorrar}
        disabled={!tieneTrazo}
        className="mt-1 text-xs text-slate-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Borrar y firmar de nuevo
      </button>
    </div>
  );
}
