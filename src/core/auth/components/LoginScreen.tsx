"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UsuarioLogin } from "../types";
import { PinPad } from "./PinPad";

const PIN_LENGTH = 4;

interface LoginScreenProps {
  usuarios: UsuarioLogin[];
  onSubmit: (usuarioId: string, pin: string) => Promise<{ error: string | null }>;
  onCrearPin: (usuarioId: string, pin: string) => Promise<{ error: string | null }>;
  destinoLuegoDeLogin: string;
}

type PasoCrearPin = "elegir" | "repetir";

export function LoginScreen({
  usuarios,
  onSubmit,
  onCrearPin,
  destinoLuegoDeLogin,
}: LoginScreenProps) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioLogin | null>(null);
  const [pin, setPin] = useState("");
  const [pinNuevo, setPinNuevo] = useState("");
  const [pasoCrearPin, setPasoCrearPin] = useState<PasoCrearPin>("elegir");
  const [error, setError] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  function volverAlInicio() {
    setUsuario(null);
    setPin("");
    setPinNuevo("");
    setPasoCrearPin("elegir");
    setError(null);
    setVerificando(false);
  }

  // Login normal (usuario ya tiene PIN configurado).
  useEffect(() => {
    if (!usuario || usuario.debe_crear_pin) return;
    if (pin.length !== PIN_LENGTH || verificando) return;

    setVerificando(true);
    onSubmit(usuario.id, pin).then((resultado) => {
      if (resultado.error) {
        setError(resultado.error);
        setPin("");
        setVerificando(false);
        return;
      }
      router.push(destinoLuegoDeLogin);
      router.refresh();
    });
  }, [pin, usuario, verificando, onSubmit, router, destinoLuegoDeLogin]);

  // Primer ingreso: crea PIN y lo repite para confirmarlo.
  useEffect(() => {
    if (!usuario || !usuario.debe_crear_pin) return;

    if (pasoCrearPin === "elegir" && pin.length === PIN_LENGTH) {
      setPasoCrearPin("repetir");
      return;
    }

    if (pasoCrearPin === "repetir" && pinNuevo.length === PIN_LENGTH && !verificando) {
      if (pinNuevo !== pin) {
        setError("Los PIN no coinciden. Empezá de nuevo.");
        setPin("");
        setPinNuevo("");
        setPasoCrearPin("elegir");
        return;
      }

      setVerificando(true);
      onCrearPin(usuario.id, pin).then((resultado) => {
        if (resultado.error) {
          setError(resultado.error);
          setPin("");
          setPinNuevo("");
          setPasoCrearPin("elegir");
          setVerificando(false);
          return;
        }
        router.push(destinoLuegoDeLogin);
        router.refresh();
      });
    }
  }, [pin, pinNuevo, pasoCrearPin, usuario, verificando, onCrearPin, router, destinoLuegoDeLogin]);

  if (!usuario) {
    return (
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-1 text-center text-xl font-semibold text-slate-800">
          Tablero H&S
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Elegí tu nombre para continuar
        </p>

        <div className="grid grid-cols-2 gap-3">
          {usuarios.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setError(null);
                setUsuario(u);
              }}
              className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm hover:border-brand-accent hover:text-brand-accent"
            >
              {u.nombre_visible}
            </button>
          ))}
          {usuarios.length === 0 ? (
            <p className="col-span-2 text-center text-sm text-slate-400">
              No hay usuarios cargados todavía.
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const creandoPin = usuario.debe_crear_pin;
  const enPasoRepetir = creandoPin && pasoCrearPin === "repetir";

  return (
    <div className="mx-auto w-full max-w-md text-center">
      <button
        type="button"
        onClick={volverAlInicio}
        className="mb-4 text-sm text-slate-400 hover:text-slate-600"
      >
        ← Cambiar usuario
      </button>

      <h1 className="mb-1 text-xl font-semibold text-slate-800">
        Hola, {usuario.nombre_visible}
      </h1>

      {creandoPin ? (
        <>
          <p className="mb-6 text-sm text-slate-500">
            {enPasoRepetir
              ? "Repetí el PIN para confirmarlo"
              : "Es tu primera vez acá: creá un PIN de 4 dígitos"}
          </p>
          <PinPad
            value={enPasoRepetir ? pinNuevo : pin}
            maxLength={PIN_LENGTH}
            disabled={verificando}
            onChange={(v) => {
              setError(null);
              if (enPasoRepetir) setPinNuevo(v);
              else setPin(v);
            }}
          />
        </>
      ) : (
        <>
          <p className="mb-6 text-sm text-slate-500">Ingresá tu PIN de 4 dígitos</p>
          <PinPad
            value={pin}
            maxLength={PIN_LENGTH}
            disabled={verificando}
            onChange={(v) => {
              setError(null);
              setPin(v);
            }}
          />
        </>
      )}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
