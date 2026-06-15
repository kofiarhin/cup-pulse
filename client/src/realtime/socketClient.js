import { io } from "socket.io-client";
let socket;
export function getSocketClient(){if(!socket)socket=io(import.meta.env.VITE_SOCKET_URL||import.meta.env.VITE_API_ORIGIN||window.location.origin,{autoConnect:false,reconnection:true,reconnectionDelay:1000,reconnectionDelayMax:10000});return socket}
