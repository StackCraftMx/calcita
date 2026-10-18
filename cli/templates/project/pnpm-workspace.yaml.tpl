# La configuración de pnpm para este proyecto (no es un workspace con varios paquetes).
# pnpm no deja correr el script de instalación de ningún paquete sin permiso. esbuild sí lo necesita: baja el binario del
# sistema operativo de quien instala, y Vite construye con él.
allowBuilds:
  esbuild: true
