/**
 * @fileoverview Componente Raíz de la Aplicación
 * Rutas disponibles:
 * - /              → Home
 * - /shop          → Shop
 * - /about         → About
 * - /product/:id   → ProductDetail
 * - /admin         → Admin
 * - /mis-compras   → MisCompras
 * - /checkout      → Checkout (Wompi)
 * - /pago-resultado → PagoResultado (redirect de Wompi)
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import { CartProvider }    from "./context/CartContext";
import { ModalProvider }   from "./context/ModalContext";
import MainLayout          from "./views/layouts/MainLayout";
import Home                from "./views/pages/Home";
import Shop                from "./views/pages/Shop";
import About               from "./views/pages/About";
import ProductDetail       from "./views/pages/ProductDetail";
import Admin               from "./views/pages/Admin";
import MisCompras          from "./views/pages/MisCompras";
import Checkout            from "./views/pages/Checkout";
import PagoResultado       from "./views/pages/PagoResultado";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
        <CartProvider>
          <MainLayout>
            <Routes>
              <Route path="/"               element={<Home />}          />
              <Route path="/shop"           element={<Shop />}          />
              <Route path="/about"          element={<About />}         />
              <Route path="/product/:id"    element={<ProductDetail />} />
              <Route path="/admin"          element={<Admin />}         />
              <Route path="/mis-compras"    element={<MisCompras />}    />
              <Route path="/checkout"       element={<Checkout />}      />
              <Route path="/pago-resultado" element={<PagoResultado />} />
            </Routes>
          </MainLayout>
        </CartProvider>
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
