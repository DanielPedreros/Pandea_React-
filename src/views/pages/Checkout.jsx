/**
 * @fileoverview Página de Checkout
 * Resume el carrito, pide dirección de envío y lanza el pago con Wompi.
 * Cuando el pago es aprobado, crea la venta en Supabase (con datos de envío)
 * y limpia el carrito.
 */

import { useState, useEffect } from "react";
import { useNavigate }     from "react-router-dom";
import { useCart }         from "../../context/CartContext";
import { useAuth }         from "../../context/AuthContext";
import { useModal }        from "../../context/ModalContext";
import { useDireccionController } from "../../controllers/useDireccionController";
import { ventaService }    from "../../services/ventaService";
import { usuarioService }  from "../../services/usuarioService";
import WompiButton         from "../components/WompiButton";

const DEPARTAMENTOS = [
  "Bogotá D.C.", "Antioquia", "Valle del Cauca", "Atlántico", "Santander",
  "Cundinamarca", "Bolívar", "Boyacá", "Caldas", "Risaralda", "Otro"
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user }                         = useAuth();
  const { openLoginModal }               = useModal();
  const navigate                         = useNavigate();

  const { direcciones, loading: loadingDir, guardarDireccion } = useDireccionController();

  const [pagado,    setPagado]    = useState(false);
  const [error,     setError]     = useState(null);
  const [guardando, setGuardando] = useState(false);

  // ── Estado del formulario de dirección ──
  const [modoDireccion, setModoDireccion] = useState("nueva"); // "nueva" | "id de dirección guardada"
  const [nuevaDireccion, setNuevaDireccion] = useState({
    alias: "", calle: "", ciudad: "", departamento: "", codigoPostal: "", telefono: "",
  });
  const [guardarParaFuturo, setGuardarParaFuturo] = useState(true);
  const [errorDireccion, setErrorDireccion] = useState("");

  // Si llega sin sesión, abre el login automáticamente
  useEffect(() => {
    if (!user) openLoginModal();
  }, [user]);

  // Si el usuario ya tiene direcciones guardadas, selecciona la primera por defecto
  useEffect(() => {
    if (direcciones.length > 0 && modoDireccion === "nueva") {
      setModoDireccion(direcciones[0].id);
    }
  }, [direcciones]);

  // Respaldo en sessionStorage por si Wompi redirige en vez de usar el callback
  useEffect(() => {
    if (items && items.length > 0) {
      sessionStorage.setItem("pandea_pending_order", JSON.stringify({
        items, totalPrice, uid: user?.uid || null,
      }));
    }
  }, [items, totalPrice, user]);

  // Carrito vacío
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
        <p style={{ color: "#888", marginBottom: 16 }}>Tu carrito está vacío.</p>
        <button className="btn-hero" onClick={() => navigate("/shop")}>
          Ver tienda
        </button>
      </div>
    );
  }

  /** Obtiene los datos de envío finales, sea de una dirección guardada o del formulario nuevo */
  function obtenerDatosEnvio() {
    if (modoDireccion === "nueva") {
      return nuevaDireccion;
    }
    const dir = direcciones.find(d => d.id === modoDireccion);
    return dir ? {
      calle: dir.calle, ciudad: dir.ciudad,
      departamento: dir.departamento, telefono: dir.telefono,
    } : null;
  }

  /** Valida que los datos de envío estén completos antes de pagar */
  function validarDireccion() {
    const envio = obtenerDatosEnvio();
    if (!envio || !envio.calle || !envio.ciudad || !envio.departamento || !envio.telefono) {
      setErrorDireccion("Completa todos los datos de envío antes de continuar.");
      return false;
    }
    setErrorDireccion("");
    return true;
  }

  async function handlePagoExitoso(transaction) {
    if (!validarDireccion()) return;

    setGuardando(true);
    try {
      const usuarios = await usuarioService.getAll();
      const usuario  = usuarios.find(u => u.uid === user?.uid);
      const envio    = obtenerDatosEnvio();

      // Si el usuario eligió guardar la nueva dirección para futuras compras
      if (modoDireccion === "nueva" && guardarParaFuturo && usuario) {
        await guardarDireccion({ ...nuevaDireccion, predeterminada: direcciones.length === 0 });
      }

      await ventaService.crear({
        id_cliente:      usuario?.id || null,
        total:           totalPrice,
        metodo_contacto: "wompi",
        items,
        envio,
      });

      sessionStorage.removeItem("pandea_pending_order");
      clearCart();
      setPagado(true);
    } catch (err) {
      console.error("Error guardando venta:", err);
      setError("El pago fue exitoso pero no pudimos guardar tu pedido. Contáctanos.");
    } finally {
      setGuardando(false);
    }
  }

  function handlePagoError(transaction) {
    const status = transaction?.status;
    if (status === "VOIDED" || status === "ERROR") {
      setError("El pago fue rechazado o cancelado. Inténtalo de nuevo.");
    }
  }

  if (pagado) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: "#088178", marginBottom: 8 }}>¡Pago exitoso!</h2>
        <p style={{ color: "#666", marginBottom: 24 }}>
          Gracias por tu compra. Pronto nos pondremos en contacto contigo.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-hero" onClick={() => navigate("/")}>Volver al inicio</button>
          <button className="btn-back" onClick={() => navigate("/mis-compras")}>Ver mis compras</button>
        </div>
      </div>
    );
  }

  return (
    <section id="checkout-page" className="section-p1">
      <div className="checkout-container">

        <div className="checkout-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left" /> Volver
          </button>
          <h2>Resumen del pedido</h2>
        </div>

        <div className="checkout-grid">

          {/* ── Columna izquierda: productos + dirección ── */}
          <div>
            {/* Productos */}
            <div className="checkout-items">
              <h3>Productos ({items.length})</h3>
              {items.map((item, i) => (
                <div className="checkout-item" key={i}>
                  <img src={item.img} alt={item.name} />
                  <div className="checkout-item-info">
                    <p>{item.name}</p>
                    {item.size && (
                      <span>
                        Talla: {item.size}
                        {item.color && (
                          <span style={{
                            display: "inline-block", width: 12, height: 12,
                            background: item.color, borderRadius: "50%",
                            marginLeft: 6, verticalAlign: "middle", border: "1px solid #ddd"
                          }} />
                        )}
                      </span>
                    )}
                    <span>Cantidad: {item.quantity}</span>
                  </div>
                  <div className="checkout-item-price">
                    <strong>${(item.price * item.quantity).toLocaleString("es-CO")}</strong>
                    <small>${item.price.toLocaleString("es-CO")} c/u</small>
                  </div>
                </div>
              ))}
              <div className="checkout-total">
                <span>Total a pagar</span>
                <strong>${totalPrice.toLocaleString("es-CO")} COP</strong>
              </div>
            </div>

            {/* ── Dirección de envío ── */}
            {user && (
              <div className="checkout-direccion">
                <h3><i className="fas fa-truck" /> Dirección de envío</h3>

                {loadingDir ? (
                  <p style={{ color: "#888", fontSize: 14 }}>Cargando direcciones...</p>
                ) : (
                  <>
                    {/* Direcciones guardadas */}
                    {direcciones.length > 0 && (
                      <div className="direccion-guardadas">
                        {direcciones.map(dir => (
                          <label key={dir.id} className={`direccion-card ${modoDireccion === dir.id ? "selected" : ""}`}>
                            <input
                              type="radio"
                              name="direccion"
                              checked={modoDireccion === dir.id}
                              onChange={() => setModoDireccion(dir.id)}
                            />
                            <div>
                              <strong>{dir.alias}</strong>
                              <p>{dir.getCompleta()}</p>
                              <small>Tel: {dir.telefono}</small>
                            </div>
                          </label>
                        ))}

                        <label className={`direccion-card ${modoDireccion === "nueva" ? "selected" : ""}`}>
                          <input
                            type="radio"
                            name="direccion"
                            checked={modoDireccion === "nueva"}
                            onChange={() => setModoDireccion("nueva")}
                          />
                          <div>
                            <strong><i className="fas fa-plus" /> Usar una nueva dirección</strong>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Formulario de nueva dirección */}
                    {modoDireccion === "nueva" && (
                      <div className="direccion-form">
                        <input type="text" placeholder="Alias (ej: Casa, Trabajo)"
                          value={nuevaDireccion.alias}
                          onChange={e => setNuevaDireccion(p => ({ ...p, alias: e.target.value }))} />

                        <input type="text" placeholder="Calle / Carrera / Dirección completa *"
                          value={nuevaDireccion.calle}
                          onChange={e => setNuevaDireccion(p => ({ ...p, calle: e.target.value }))} required />

                        <div className="direccion-form-row">
                          <input type="text" placeholder="Ciudad *"
                            value={nuevaDireccion.ciudad}
                            onChange={e => setNuevaDireccion(p => ({ ...p, ciudad: e.target.value }))} required />

                          <select value={nuevaDireccion.departamento}
                            onChange={e => setNuevaDireccion(p => ({ ...p, departamento: e.target.value }))} required>
                            <option value="">Departamento *</option>
                            {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>

                        <div className="direccion-form-row">
                          <input type="text" placeholder="Código postal (opcional)"
                            value={nuevaDireccion.codigoPostal}
                            onChange={e => setNuevaDireccion(p => ({ ...p, codigoPostal: e.target.value }))} />

                          <input type="tel" placeholder="Número de teléfono *"
                            value={nuevaDireccion.telefono}
                            onChange={e => setNuevaDireccion(p => ({ ...p, telefono: e.target.value }))} required />
                        </div>

                        <label className="direccion-checkbox">
                          <input type="checkbox" checked={guardarParaFuturo}
                            onChange={e => setGuardarParaFuturo(e.target.checked)} />
                          Guardar esta dirección para futuras compras
                        </label>
                      </div>
                    )}

                    {errorDireccion && (
                      <p className="checkout-error" style={{ marginTop: 12 }}>
                        <i className="fas fa-exclamation-circle" /> {errorDireccion}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Columna derecha: pago ── */}
          <div className="checkout-payment">
            <h3>Datos de pago</h3>

            {user && (
              <div className="checkout-user-info">
                <i className="fas fa-user-circle" />
                <div>
                  <p>{user.displayName}</p>
                  <small>{user.email}</small>
                </div>
              </div>
            )}

            <div className="checkout-metodos">
              <span>Métodos aceptados:</span>
              <div className="checkout-metodos-icons">
                <span className="metodo-tag"><i className="fas fa-credit-card" /> Tarjeta</span>
                <span className="metodo-tag">PSE</span>
                <span className="metodo-tag">Nequi</span>
                <span className="metodo-tag">Daviplata</span>
              </div>
            </div>

            {error && (
              <div className="checkout-error">
                <i className="fas fa-exclamation-circle" /> {error}
              </div>
            )}

            {!user ? (
              <div className="checkout-login-required">
                <i className="fas fa-lock" />
                <p>Debes iniciar sesión para completar tu compra.</p>
                <button className="btn-hero" onClick={openLoginModal}>Iniciar sesión</button>
              </div>
            ) : guardando ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <span className="spinner" /> Guardando tu pedido...
              </div>
            ) : (
              <div
                className="checkout-wompi-wrap"
                onClickCapture={(e) => { if (!validarDireccion()) e.stopPropagation(); }}
              >
                <WompiButton
                  total={totalPrice}
                  usuario={user}
                  onExito={handlePagoExitoso}
                  onError={handlePagoError}
                />
              </div>
            )}

            <p className="checkout-seguro">
              <i className="fas fa-shield-alt" /> Pago 100% seguro con Wompi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
