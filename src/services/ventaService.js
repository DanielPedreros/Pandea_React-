/**
 * @fileoverview Servicio de Ventas — Supabase
 * Registra ventas con datos de envío y consulta el historial del cliente.
 */

import { supabase } from "../config/supabase";

export const ventaService = {

  /**
   * Crea una venta con los datos de envío incluidos.
   * @param {Object} ventaData
   * @param {string} ventaData.id_cliente
   * @param {number} ventaData.total
   * @param {string} ventaData.metodo_contacto
   * @param {Array}  ventaData.items
   * @param {Object} ventaData.envio - { calle, ciudad, departamento, telefono }
   */
  async crear(ventaData) {
    const { data: venta, error: ventaError } = await supabase
      .from("ventas")
      .insert({
        id_cliente:        ventaData.id_cliente,
        total:              ventaData.total,
        metodo_contacto:    ventaData.metodo_contacto || "web",
        estado:             "pendiente",
        direccion_envio:    ventaData.envio?.calle
          ? `${ventaData.envio.calle}, ${ventaData.envio.ciudad}, ${ventaData.envio.departamento}`
          : null,
        ciudad_envio:       ventaData.envio?.ciudad || null,
        telefono_contacto:  ventaData.envio?.telefono || null,
      })
      .select()
      .single();

    if (ventaError) throw ventaError;

    const detalles = ventaData.items.map(item => ({
      id_venta:        venta.id,
      id_producto:     item.productId || item.id,
      cantidad:        item.quantity,
      precio_unitario: item.price,
      talla:           item.size  || null,
      color:           item.color || null,
    }));

    const { error: detalleError } = await supabase
      .from("detalle_venta")
      .insert(detalles);

    if (detalleError) throw detalleError;
    return venta.id;
  },

  async getHistorial(uid) {
    const { data: usuario } = await supabase
      .from("usuarios").select("id").eq("uid", uid).single();
    if (!usuario) return [];

    const { data, error } = await supabase
      .from("ventas")
      .select(`*, detalle_venta(*, productos(nombre, img))`)
      .eq("id_cliente", usuario.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("ventas")
      .select(`*, usuarios(nombre, email), detalle_venta(*, productos(nombre, img))`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
};
