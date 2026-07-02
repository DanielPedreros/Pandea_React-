/**
 * @fileoverview Contexto de Modales Globales
 * Permite abrir el modal de Login desde CUALQUIER componente,
 * no solo desde el Navbar. Esto es necesario porque ahora el
 * Checkout también necesita poder abrir el login si el usuario
 * no tiene sesión activa.
 */

import { createContext, useContext, useState } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  // 'login' | 'register' | 'forgot' | null
  const [authModal, setAuthModal] = useState(null);

  const openLoginModal    = () => setAuthModal("login");
  const openRegisterModal = () => setAuthModal("register");
  const openForgotModal   = () => setAuthModal("forgot");
  const closeAuthModal    = () => setAuthModal(null);

  return (
    <ModalContext.Provider value={{
      authModal,
      openLoginModal, openRegisterModal, openForgotModal, closeAuthModal
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
