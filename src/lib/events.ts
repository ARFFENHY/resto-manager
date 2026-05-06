import EventEmitter from "events";

class AppEventEmitter extends EventEmitter {}
export const events = new AppEventEmitter();

// Eventos de negocio
events.on("ORDER_CREATED", (payload) => {
  console.log(`[EVENT: ORDER_CREATED] Nuevo pedido #${payload.pedidoId} en el restaurante #${payload.restauranteId} por $${payload.total}`);
  // Aquí podríamos agregar simulaciones de webhooks, emails, notificaciones push, etc.
});

events.on("ORDER_UPDATED", (payload) => {
  console.log(`[EVENT: ORDER_UPDATED] Pedido #${payload.pedidoId} actualizado al estado: ${payload.estado}`);
  // Notificaciones para el cliente (e.g. SMS o Whatsapp automatizado futuro)
});
