# Seguridad

Este repositorio contiene un **prototipo académico** (Actividad 4, Proyecto de software, Corporación Universitaria Iberoamericana). No es un sistema en producción.

## Medidas aplicadas

- **Sin datos reales**: todos los usuarios, mascotas y citas son ficticios (Ley 1581 de 2012). El prototipo no envía datos a ningún servidor
- **Datos solo en el navegador**: la información se guarda en `localStorage` del propio navegador de quien lo usa y se puede borrar desde Reportes → Restablecer datos
- **Contraseñas cifradas** con SHA-256 (Web Crypto API); nunca se guardan en texto plano
- **Política de seguridad de contenido (CSP)**: solo se ejecutan scripts propios del sitio; no se permiten objetos incrustados ni envío de formularios a otros dominios
- **Protección contra XSS**: todo texto escrito por el usuario se escapa antes de mostrarse en pantalla
- **Sin dependencias externas** de JavaScript, sin rastreadores ni publicidad
- Los usuarios de prueba publicados en el README son credenciales de demostración, no cuentas reales

## Limitaciones conocidas (se resuelven en la Actividad 5)

- La autenticación y los roles se validan en el navegador; en la versión con servidor se validarán con JWT en la API
- El cifrado de contraseñas definitivo se hará en el servidor con un algoritmo con sal (bcrypt)

## Reportar un problema

Abre un *issue* en este repositorio.
