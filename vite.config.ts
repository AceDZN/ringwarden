import { defineConfig } from 'vite';
export default defineConfig({base:'./',server:{port:5184,strictPort:true},preview:{port:4184,strictPort:true},build:{target:'es2022'}});
