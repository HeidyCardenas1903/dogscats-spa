<p align="center"><img src="img/logo.png" alt="DogsCats Spa" width="220"></p>

# DogsCats Spa

Prototipo funcional de un sistema web para gestionar las citas y reservas de un spa y centro de estética para mascotas. Proyecto académico de Ingeniería de Software

## Propósito

Muchos spas de mascotas agendan por llamada, WhatsApp o cuaderno, lo que genera citas cruzadas, inasistencias y falta de información sobre la mascota antes del servicio. DogsCats Spa propone una agenda en línea que evita las dobles reservas y consulta la ficha de cada mascota desde la plataforma PetCare

## Funcionalidades

| Módulo | Qué hace |
|---|---|
| Autenticación y roles | Inicio de sesión y registro con tres roles: cliente, groomer y administrador |
| Ficha de la mascota | Muestra raza, tamaño, alergias y observaciones de cada mascota (integración simulada con PetCare) |
| Catálogo de servicios | Crear, editar y desactivar servicios con duración, precio y tamaños de mascota |
| Disponibilidad | Horario de atención, días no laborables y turnos de cada groomer |
| Reservas | Solo ofrece franjas libres y no permite dobles reservas |
| Gestión de citas | Confirmar, reprogramar, cancelar y registrar inasistencias |
| Agenda del groomer | Citas del día con la ficha y alertas de alergias, y registro del servicio realizado |
| Notificaciones | Confirmación y recordatorio de la cita (simulados dentro de la aplicación) |
| Reportes | Citas, inasistencias y servicios más solicitados |

La interfaz sigue la línea visual de PetCare y se adapta a computador, tableta y celular

## Estructura del código

```
index.html            Página principal
css/styles.css        Estilos y diseño adaptable
js/app.js             Pantallas y navegación por rol
js/store.js           Lógica de negocio: reservas, disponibilidad, catálogo y citas
js/petcare-mock.js    Servicio simulado de la API de PetCare
img/                  Logo, ícono y favicon
```

## Tecnologías

HTML5, CSS3 y JavaScript sin dependencias externas

## Aviso

Prototipo con fines académicos. Todos los datos son ficticios y se guardan únicamente en el navegador de quien lo usa. Ver [SECURITY.md](SECURITY.md)
