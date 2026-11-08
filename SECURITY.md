# Seguridad

Este repositorio contiene un prototipo académico. No es un sistema en producción

## Medidas aplicadas

- Todos los datos son ficticios. El prototipo no envía información a ningún servidor
- La información se guarda solo en el navegador de quien lo usa y se puede borrar desde la aplicación
- Las contraseñas se almacenan cifradas (SHA-256), nunca en texto plano
- Política de seguridad de contenido (CSP): solo se ejecutan scripts propios del sitio
- Todo texto ingresado por el usuario se escapa antes de mostrarse, para prevenir XSS
- Sin dependencias de JavaScript de terceros, sin rastreadores ni publicidad

## Limitaciones conocidas

- La validación de roles se hace en el navegador. En la siguiente versión se hará en el servidor
- El cifrado definitivo de contraseñas se hará en el servidor con un algoritmo con sal

## Reportar un problema

Abre un issue en este repositorio
