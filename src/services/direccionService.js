/**
 * @fileoverview Servicio de Direcciones — Supabase
 * Maneja las direcciones de envío guardadas por cada cliente.
 */

import { supabase } from "../config/supabase";
import { DireccionModel } from "../models/Direccion";

export const direccionService = {

  /**
   * Obtiene todas las direcciones guardadas de un usuario.
   * @param {string} idUsuario - ID del usuario en la tabla "usuarios" (no el UID de Firebase)
   * @returns {Promise<DireccionModel[]>}
   */
  async getByUsuario(idUsuario) {
    const { data, error } = await supabase
      .from("direcciones")
      .select("*")
      .eq("id_usuario", idUsuario)
      .order("predeterminada", { ascending: false });

    if (error) throw error;
    return data.map(d => new DireccionModel({
      id: d.id, alias: d.alias, calle: d.calle, ciudad: d.ciudad,
      departamento: d.departamento, codigoPostal: d.codigo_postal,
      telefono: d.telefono, predeterminada: d.predeterminada,
    }));
  },

  /**
   * Guarda una nueva dirección para el usuario.
   * @param {string} idUsuario
   * @param {Object} direccion - { alias, calle, ciudad, departamento, codigoPostal, telefono, predeterminada }
   * @returns {Promise<string>} ID de la dirección creada
   */
  async crear(idUsuario, direccion) {
    const { data, error } = await supabase
      .from("direcciones")
      .insert({
        id_usuario:     idUsuario,
        alias:          direccion.alias,
        calle:          direccion.calle,
        ciudad:         direccion.ciudad,
        departamento:   direccion.departamento,
        codigo_postal:  direccion.codigoPostal,
        telefono:       direccion.telefono,
        predeterminada: direccion.predeterminada || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  /**
   * Elimina una dirección guardada.
   * @param {string} id
   */
  async eliminar(id) {
    const { error } = await supabase.from("direcciones").delete().eq("id", id);
    if (error) throw error;
  }
};
