"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  ariaLabelShow?: string;
  ariaLabelHide?: string;
};

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  className = "w-full px-4 py-3 pr-10 rounded-xl bg-[#1a0f0f] border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-drawsports-primary focus:border-drawsports-primary transition-all",
  ariaLabelShow = "Mostrar contraseña",
  ariaLabelHide = "Ocultar contraseña",
}: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className={className}
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
        aria-label={show ? ariaLabelHide : ariaLabelShow}
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
