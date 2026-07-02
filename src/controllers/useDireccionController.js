/**
 * @fileoverview Controlador de Direcciones
 * Maneja las direcciones guardadas del usuario logueado en el Checkout.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { direccionService } from "../services/direccionService";
import { usuarioService }   from "../services/usuarioService";

export function useDireccionController() {
  const { user } = useAuth();
  const [direcciones,    setDirecciones]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [idUsuarioReal,  setIdUsuarioReal]  = useState(null);

  useEffect(() => {
    async function cargar() {
      if (!user) { setLoading(false); return; }
      const usuarios = await usuarioService.getAll();
      const usuario  = usuarios.find(u => u.uid === user.uid);
      if (usuario) {
        setIdUsuarioReal(usuario.id);
        const data = await direccionService.getByUsuario(usuario.id);
        setDirecciones(data);
      }
      setLoading(false);
    }
    cargar();
  }, [user]);

  async function guardarDireccion(direccion) {
    if (!idUsuarioReal) return null;
    const id = await direccionService.crear(idUsuarioReal, direccion);
    const data = await direccionService.getByUsuario(idUsuarioReal);
    setDirecciones(data);
    return id;
  }

  async function eliminarDireccion(id) {
    await direccionService.eliminar(id);
    setDirecciones(prev => prev.filter(d => d.id !== id));
  }

  return { direcciones, loading, guardarDireccion, eliminarDireccion };
}
