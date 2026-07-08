import * as admin from "firebase-admin";

admin.initializeApp();

export { createOrder } from "./create-order";
export { onOrderCreated } from "./notify";
