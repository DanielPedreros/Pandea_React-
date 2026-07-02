/**
 * @fileoverview Modelo de Dirección de Envío
 * Representa una dirección guardada por el cliente.
 */

export class DireccionModel {
  constructor({ id, alias, calle, ciudad, departamento, codigoPostal, telefono, predeterminada }) {
    this.id            = id;
    this.alias         = alias || "Mi dirección";
    this.calle         = calle;
    this.ciudad        = ciudad;
    this.departamento  = departamento;
    this.codigoPostal  = codigoPostal;
    this.telefono      = telefono;
    this.predeterminada = predeterminada || false;
  }

  /** Devuelve la dirección completa en una sola línea, para mostrar en resúmenes */
  getCompleta() {
    return `${this.calle}, ${this.ciudad}, ${this.departamento}`;
  }
}
