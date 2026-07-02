/**
 * @fileoverview Panel de Ventas del Admin
 * Lista todas las ventas con dirección de envío, teléfono y opción de cambiar estado.
 */

import { useState, useEffect } from "react";
import { ventaService } from "../../services/ventaService";
import { supabase }     from "../../config/supabase";

export default function AdminVentas() {
  const [ventas,  setVentas]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // ID de la venta con detalles abiertos

  useEffect(() => {
    ventaService.getAll().then(setVentas).finally(() => setLoading(false));
  }, []);

  async function cambiarEstado(id, estado) {
    await supabase.from("ventas").update({ estado }).eq("id", id);
    setVentas(prev => prev.map(v => v.id === id ? { ...v, estado } : v));
  }

  function toggleExpand(id) {
    setExpanded(prev => prev === id ? null : id);
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Cargando ventas...</div>;

  return (
    <div id="admin-ventas">
      <div className="admin-section-header">
        <h3>Gestión de Ventas</h3>
        <span className="badge">{ventas.length} pedidos</span>
      </div>

      {ventas.length === 0 ? (
        <div className="admin-empty">
          <i className="fas fa-shopping-cart" />
          <p>No hay ventas registradas aún</p>
        </div>
      ) : (
        <div className="ventas-table">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Envío</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <>
                  <tr key={v.id} onClick={() => toggleExpand(v.id)}
                    style={{ cursor: "pointer" }}>

                    {/* Pedido */}
                    <td>
                      <code>#{v.id.slice(0,8).toUpperCase()}</code>
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
                        {expanded === v.id ? "▲ Ocultar" : "▼ Ver detalles"}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td>
                      <div className="cliente-info">
                        <span>{v.usuarios?.nombre || "—"}</span>
                        <small>{v.usuarios?.email}</small>
                      </div>
                    </td>

                    {/* Dirección y teléfono */}
                    <td>
                      {v.direccion_envio ? (
                        <div className="envio-info">
                          <span><i className="fas fa-map-marker-alt" /> {v.direccion_envio}</span>
                          {v.telefono_contacto && (
                            <small><i className="fas fa-phone" /> {v.telefono_contacto}</small>
                          )}
                        </div>
                      ) : (
                        <small style={{ color: "#ccc" }}>Sin dirección</small>
                      )}
                    </td>

                    {/* Productos (resumen) */}
                    <td>
                      <div className="venta-productos">
                        {v.detalle_venta?.slice(0,2).map((d,i) => (
                          <span key={i} className="producto-tag">
                            {d.productos?.nombre} x{d.cantidad}
                          </span>
                        ))}
                        {v.detalle_venta?.length > 2 && (
                          <span className="producto-tag">
                            +{v.detalle_venta.length - 2} más
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total */}
                    <td>
                      <strong style={{ color: "#088178" }}>
                        ${Number(v.total).toLocaleString()}
                      </strong>
                    </td>

                    {/* Fecha */}
                    <td>
                      <small>{new Date(v.created_at).toLocaleDateString("es-CO", {
                        year: "numeric", month: "short", day: "numeric"
                      })}</small>
                    </td>

                    {/* Estado */}
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className={`estado-select ${v.estado}`}
                        value={v.estado}
                        onChange={e => cambiarEstado(v.id, e.target.value)}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </td>
                  </tr>

                  {/* Fila expandible con detalles completos */}
                  {expanded === v.id && (
                    <tr key={`${v.id}-detail`} className="venta-expandida">
                      <td colSpan={7}>
                        <div className="venta-detalle-expandido">

                          {/* Info de envío completa */}
                          <div className="detalle-envio">
                            <h5><i className="fas fa-truck" /> Información de envío</h5>
                            <p><strong>Dirección:</strong> {v.direccion_envio || "No especificada"}</p>
                            {v.ciudad_envio && <p><strong>Ciudad:</strong> {v.ciudad_envio}</p>}
                            {v.telefono_contacto && <p><strong>Teléfono:</strong> {v.telefono_contacto}</p>}
                          </div>

                          {/* Productos con detalle */}
                          <div className="detalle-productos">
                            <h5><i className="fas fa-box" /> Productos del pedido</h5>
                            {v.detalle_venta?.map((d, i) => (
                              <div className="detalle-producto-item" key={i}>
                                <img src={d.productos?.img} alt={d.productos?.nombre} />
                                <div>
                                  <p>{d.productos?.nombre}</p>
                                  <small>
                                    Cant: {d.cantidad}
                                    {d.talla && ` · Talla: ${d.talla}`}
                                    {d.color && (
                                      <span style={{
                                        display: "inline-block", width: 10, height: 10,
                                        background: d.color, borderRadius: "50%",
                                        marginLeft: 4, verticalAlign: "middle",
                                        border: "1px solid #ddd"
                                      }} />
                                    )}
                                  </small>
                                  <strong>${Number(d.precio_unitario).toLocaleString()}</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
