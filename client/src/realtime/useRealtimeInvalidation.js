import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getSocketClient } from "./socketClient";
const invalidations={"matches:updated":[["matches"],["home-live"],["home-fixtures"],["bracket"]],"match:updated":[["match"],["matches"],["prediction"],["summary"]],"standings:updated":[["standings"],["groups"]],"sync:updated":[["admin","sync"],["admin","health"]]};
export function useRealtimeInvalidation(){const queryClient=useQueryClient();useEffect(()=>{const socket=getSocketClient();const handlers=Object.fromEntries(Object.entries(invalidations).map(([event,keys])=>[event,()=>keys.forEach(queryKey=>queryClient.invalidateQueries({queryKey}))]));Object.entries(handlers).forEach(([event,handler])=>socket.on(event,handler));socket.connect();return()=>Object.entries(handlers).forEach(([event,handler])=>socket.off(event,handler))},[queryClient])}
