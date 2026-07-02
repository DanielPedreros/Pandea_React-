/**
 * @fileoverview Contexto de Autenticación
 * Provee el usuario logueado Y si es administrador.
 * La verificación de admin se hace UNA SOLA VEZ aquí, al loguearse,
 * y se comparte con toda la app — así evitamos consultar Supabase
 * repetidamente desde cada componente que necesite saber si es admin.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { UserModel } from "../models/User";
import { usuarioService } from "../services/usuarioService";
import { adminService } from "../services/adminService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sincroniza con la tabla "usuarios" de Supabase
        await usuarioService.sincronizar(firebaseUser);

        // Verifica si este UID está en la tabla "admins" de Supabase
        const admin = await adminService.isAdmin(firebaseUser.uid);
        setIsAdmin(admin);

        setUser(new UserModel({
          uid:         firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email:       firebaseUser.email,
          photoURL:    firebaseUser.photoURL,
        }));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
