<p align="center"><img src="img/logo.png" alt="DogsCats Spa" width="220"></p>

# DogsCats Spa · Prototipo funcional

Prototipo de sistema web para la gestión de citas y reservas en servicios de spa y estética de mascotas, integrado con PetCare.
Actividad 4 · Proyecto de software · Corporación Universitaria Iberoamericana.

## Qué incluye

| Requisito | Módulo | Estado en el prototipo |
|---|---|---|
| RF01 | Autenticación y roles (cliente, groomer, administrador) | Funcional |
| RF02 | Integración PetCare (ficha de la mascota) | Funcional con servicio simulado (mock) |
| RF03 | Catálogo de servicios | Funcional |
| RF04 | Disponibilidad (horario, días no laborables, turnos) | Funcional |
| RF05 | Reservas sin dobles reservas | Funcional |
| RF06 | Gestión de citas (confirmar, reprogramar, cancelar, inasistencia) | Funcional |
| RF07 | Notificaciones | Simuladas (bandeja de correos dentro de la app) |
| RF08 | Historial del servicio | Funcional (registro del groomer) |
| RF09 | Reportes | Básico |

Los datos se guardan en el navegador (localStorage). En la Actividad 5 esta capa se reemplaza por la API en Node.js con PostgreSQL.

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Cliente | cliente@dogscats.co | Cliente123 |
| Groomer | groomer@dogscats.co | Groomer123 |
| Administrador | admin@dogscats.co | Admin123 |

Todos los datos son ficticios (Ley 1581 de 2012).

## Ejecutar en local con XAMPP

1. Copia la carpeta `dogscats` en `C:\xampp\htdocs\`.
2. Abre el panel de control de XAMPP y dale **Start** a **Apache**.
3. Entra a `http://localhost/dogscats` en el navegador.

## Ejecutar en local sin XAMPP

No necesita instalar dependencias.

1. Descarga o clona el repositorio.
2. Abre una terminal en la carpeta del proyecto y ejecuta uno de estos comandos:
   - Con Python: `python -m http.server 8080`
   - O en VS Code: clic derecho sobre `index.html` → **Open with Live Server**.
3. Entra a `http://localhost:8080` en el navegador.

> Se debe abrir con un servidor local (no con doble clic sobre el archivo), porque el cifrado de contraseñas usa la API Web Crypto del navegador.

## Publicar en GitHub Pages

1. Crea un repositorio público en GitHub (por ejemplo `dogscats-spa`) y sube todos los archivos.
2. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)` → **Save**.
3. En uno o dos minutos queda publicado en `https://TU-USUARIO.github.io/dogscats-spa/`.

## Estructura

```
index.html            Página principal
css/styles.css        Estilos (diseño adaptable al celular)
js/petcare-mock.js    Servicio simulado de la API de PetCare
js/store.js           Lógica de negocio y datos (reservas, disponibilidad, catálogo)
js/app.js             Interfaz y navegación por roles
img/logo.png          Logo de DogsCats Spa
img/logo-icono.png    Ícono del logo (menú e inicio de sesión)
img/favicon.png       Ícono de la pestaña del navegador
```

Para restablecer los datos de prueba: ingresa como administrador → **Reportes** → **Restablecer datos de demostración**.

## Seguridad y uso responsable

Prototipo académico con datos ficticios, sin rastreadores ni envío de información a servidores externos. Ver [SECURITY.md](SECURITY.md).
