import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthController } from "../../controllers/useAuthController";
import { useAdminController } from "../../controllers/useAdminController";
import { useModal } from "../../context/ModalContext";
import { useCartController } from "../../controllers/useCartController";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import ForgotModal from "./modals/ForgotModal";

export default function Navbar() {
  const { user } = useAuth();
  const { logout } = useAuthController();
  const { isAdmin } = useAdminController();
  const { count, openCart } = useCartController();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    authModal,
    openLoginModal, openRegisterModal, openForgotModal, closeAuthModal
  } = useModal();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  
  // Verificar si el usuario es administrador

  return (
    <>
      <header id="header">
        {/* Logo */}
        <div className="logo">
          <Link to="/"><h2>PANDEA</h2></Link>
        </div>

        {/* Nav links — se oculta en móvil */}
        <nav>
          <ul id="navbar" className={menuOpen ? "show" : ""}>
            <li><Link to="/"      className={isActive("/")      ? "active" : ""} onClick={() => setMenuOpen(false)}>Inicio</Link></li>
            
            <li className="nav-dropdown">
              <Link to="/shop" onClick={() => setMenuOpen(false)}>
                Categorias <i className="fas fa-chevron-down nav-dropdown-arrow" />
              </Link>
              <div className="nav-dropdown-menu">
                <Link to="/shop?categoria=camisa"   onClick={() => setMenuOpen(false)}>Camisas</Link>
                <Link to="/shop?categoria=sueter"   onClick={() => setMenuOpen(false)}>Suéteres</Link>
                <Link to="/shop?categoria=pantalon" onClick={() => setMenuOpen(false)}>Pantalones</Link>
                <Link to="/shop?categoria=blusa"    onClick={() => setMenuOpen(false)}>Blusas</Link>
                <Link to="/shop?categoria=accesorio" onClick={() => setMenuOpen(false)}>Accesorios</Link>
              </div>
            </li>
            <li><Link to="/about" className={isActive("/about") ? "active" : ""} onClick={() => setMenuOpen(false)}>Acerca De</Link></li>
          </ul>
        </nav>

        {/* Iconos derecha */}
        <div className="nav-icons">

          {/* Búsqueda — solo desktop */}
          <div className="search-bar desktop-only">
            <input type="text" placeholder="Buscar..." />
            <button><i className="fas fa-search" /></button>
          </div>

          {/* Carrito */}
          <a href="#" className="cart-icon-wrap" onClick={(e) => { e.preventDefault(); openCart(); }}>
            <i className="fas fa-shopping-bag" />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </a>

          {/* Login / Perfil */}
          {user ? (
            <div className="profile-wrap">
              <button className="button-login" onClick={() => setProfileOpen(p => !p)}>
                <i className="fas fa-user-check" /> <span className="login-text">{user.getFirstName()}</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-info">
                    <i className="fas fa-user-circle" />
                    <span>{user.displayName}</span>
                    <small>{user.email}</small>
                  </div>
                  <hr />
                  {isAdmin && (
                    <>
                      <button className="admin-button" onClick={() => { navigate("/admin"); setProfileOpen(false); }}>
                        <i className="fas fa-crown" /> Panel Admin
                      </button>
                      <hr />
                    </>
                  )}
                  <button onClick={() => { navigate("/mis-compras"); setProfileOpen(false); }} style={{ color: "grey" }}>
                    <i className="fas fa-shopping-bag" /> Mis compras
                  </button>
                  <hr />
                  <button onClick={() => { logout(); setProfileOpen(false); }}>
                    <i className="fas fa-sign-out-alt" /> Cerrar sesión
                  </button>
                  
                </div>
              )}
            </div>
          ) : (
            <button className="button-login" onClick={openLoginModal}>
              Login
            </button>
          )}

          {/* Hamburguesa — solo móvil */}
          <button className="hamburger" onClick={() => setMenuOpen(p => !p)}>
            <i className={`fas ${menuOpen ? "fa-times" : "fa-bars"}`} />
          </button>

        </div>
      </header>

      {/* Modales */}
      {authModal === "login"    && <LoginModal    onClose={closeAuthModal} onRegister={openRegisterModal} onForgot={openForgotModal} />}
      {authModal === "register" && <RegisterModal onClose={closeAuthModal} onLogin={openLoginModal} />}
      {authModal === "forgot"   && <ForgotModal   onClose={closeAuthModal} onLogin={openLoginModal} />}
    </>
  );
}
