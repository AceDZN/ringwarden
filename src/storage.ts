import type {Event} from './game';
const KEY='ringwarden-local-v1';
export type LocalData={muted:boolean;trace:Event[]};
export function parseLocal(raw:string|null):LocalData {try{const value=JSON.parse(raw||'null');return {muted:value?.muted===true,trace:Array.isArray(value?.trace)?value.trace.filter((e:unknown):e is Event=>!!e&&typeof e==='object'&&typeof (e as Event).event==='string'&&Number.isFinite((e as Event).time)&&Number.isFinite((e as Event).wave)).slice(-500):[]};}catch{return {muted:false,trace:[]};}}
export function readLocal():LocalData{try{return parseLocal(localStorage.getItem(KEY));}catch{return {muted:false,trace:[]};}}
export function writeLocal(muted:boolean,trace:Event[]){try{localStorage.setItem(KEY,JSON.stringify({muted,trace:trace.slice(-500)}));}catch{/* Storage is optional; combat never depends on it. */}}
