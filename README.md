# Sistema de Gestión de Pedidos - Microservicios con NestJS

Este proyecto es una API basada en microservicios para la gestión de pedidos en un e-commerce. Se desarrolló utilizando el framework NestJS, con bases de datos PostgreSQL gestionadas a través de Prisma y comunicación entre microservicios mediante NATS. Cada microservicio se despliega en contenedores Docker y se ha implementado una arquitectura desacoplada siguiendo buenas prácticas (principios SOLID, separación de responsabilidades y uso adecuado de DTOs).

## Tabla de Contenidos

- [Objetivo](#objetivo)
- [Descripción del Proyecto](#descripción-del-proyecto)
- [Arquitectura](#arquitectura)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Docker y Despliegue](#docker-y-despliegue)
- [Endpoints y Ejemplos](#endpoints-y-ejemplos)
- [Documentación API (Swagger)](#documentación-api-swagger)
- [Consideraciones Finales](#consideraciones-finales)
- [Instrucciones de Instalación y Ejecución](#instrucciones-de-instalación-y-ejecución)

## Objetivo

El objetivo de este proyecto es demostrar el manejo de microservicios utilizando NestJS, la gestión de bases de datos relacionales, la configuración de contenedores Docker y la aplicación de buenas prácticas de codificación. Se evalúan además habilidades en la comunicación asíncrona mediante NATS y en la documentación de la API usando Swagger.

## Descripción del Proyecto

El sistema de gestión de pedidos se divide en tres componentes principales:

### 1. auth-microservice
- **Funcionalidades:**
  - Registro de usuario (nombre, email, contraseña hasheada)
  - Autenticación (login) y generación de token JWT
  - Endpoint para obtener información del usuario autenticado
- **Base de Datos:** PostgreSQL (base de datos `auth`)

### 2. orders-microservice
- **Funcionalidades:**
  - Crear un pedido asociado a un usuario
  - Listar los pedidos de un usuario
  - Actualizar el estado del pedido (Pendiente, En proceso, Completado)
- **Base de Datos:** PostgreSQL (base de datos `order`)

### 3. Gateway
- **Funcionalidad:**
  - Actúa como punto de entrada (API Gateway) que enruta las solicitudes a los microservicios correspondientes
  - No contiene lógica de negocio ni acceso directo a las bases de datos, solo controllers

## Arquitectura

El sistema se compone de microservicios independientes:
- **auth-microservice:** Gestiona usuarios y autenticación
- **orders-microservice:** Gestiona pedidos, manteniendo el desacoplamiento del microservicio de usuarios mediante una referencia al `userId`
- **gateway:** Expondrá los endpoints externos y se encarga de enrutar las solicitudes a los servicios correspondientes

La comunicación entre microservicios se realiza a través de **NATS** como broker de mensajería.

## Tecnologías Utilizadas

- **Framework:** NestJS
- **Base de Datos:** PostgreSQL con Prisma
- **Mensajería:** NATS (o RabbitMQ/Kafka según configuración)
- **Contenedores:** Docker (con Dockerfile y docker-compose.yml)
- **Documentación API:** Swagger
- **Buenas Prácticas:** Principios SOLID y uso de DTOs

## Estructura del Proyecto

- **auth-microservice:**  
  Contiene controladores, servicios, DTOs y esquemas Prisma para la gestión de usuarios.  
  Variables de entorno: `JWT_SECRET`, `DATABASE_URL`, `NATS_SERVER`

- **orders-microservice:**  
  Gestiona pedidos, con sus respectivos DTOs, servicios y esquemas Prisma.  
  Variables de entorno: `DATABASE_URL`, `NATS_SERVER`

- **gateway:**  
  Actúa como API Gateway, exponiendo los endpoints y redirigiendo solicitudes a los microservicios.

## Configuración de Variables de Entorno

### auth-microservice (.env)
```env
NATS_SERVER=nats://localhost:4222
JWT_SECRET=prueba
DATABASE_URL="postgresql://postgres:1234@localhost:5433/auth?schema=public"
```

**Nota:** Cada servicio utiliza su propio volumen y mapea un puerto distinto en el host para evitar conflictos:
- auth-microservice: Mapea 5433:5432
- orders-microservice: Mapea 5434:5432

## Docker y Despliegue

### Configuración Docker Compose para auth-microservice
```yaml
version: '3.8'
services:
  auth-ms-db:
    container_name: auth-ms
    image: postgres:12-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=1234
      - POSTGRES_DB=auth
    volumes:
      - auth_postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"

volumes:
  auth_postgres_data:
```

### Configuración Docker Compose para orders-microservice
```yaml
version: '3.8'
services:
  order-ms:
    container_name: order-ms
    image: postgres:12-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=1234
      - POSTGRES_DB=order
    volumes:
      - order_postgres_data:/var/lib/postgresql/data
    ports:
      - "5434:5432"

volumes:
  order_postgres_data:
```

### Configuración Docker Compose para NATS
```yaml
version: '3.8'
services:
  nats-server:
    image: nats:latest
    ports:
      - "4222:4222"
```

## Endpoints y Ejemplos

### auth-microservice

#### Registro de Usuario
- **Método:** POST
- **Ruta:** `/api/auth/register`
- **Payload:**
```json
{
  "name": "Juan",
  "email": "juansubas@gmail.com",
  "password": "123456"
}
```
- **Respuesta:** Usuario registrado o error si el email existe

#### Login
- **Método:** POST
- **Ruta:** `/api/auth/login`
- **Payload:**
```json
{
  "email": "juansubas@gmail.com",
  "password": "123456"
}
```
- **Respuesta:** Usuario + token JWT

#### Verificar Usuario
- **Método:** GET
- **Ruta:** `/api/auth/verify`
- **Respuesta:** Usuario autenticado + token JWT

### orders-microservice

#### Crear Pedido
- **Método:** POST
- **Ruta:** `/api/orders/create`
- **Payload:**
```json
{
  "productId": "5",
  "title": "Minoxidil",
  "quantity": 12,
  "status": "PENDIENTE"
}
```
- **Respuesta:** Pedido creado con id, userId, y timestamps

#### Listar Pedidos
- **Método:** GET
- **Ruta:** `/api/orders/findAll`
- **Autenticación:** Usa el userId del token JWT
- **Respuesta:** Lista de pedidos del usuario

#### Actualizar Pedido
- **Método:** PUT
- **Ruta:** `/api/orders/update`
- **Payload:**
```json
{
  "orderId": "37b0693e-93f6-4331-870a-1d810989c7b1",
  "productId": "5",
  "title": "Minoxidil",
  "quantity": 12,
  "status": "COMPLETADO"
}
```
- **Respuesta:** Pedido actualizado

**Protección de Endpoints:** Incluir token en cabecera: `Authorization: Bearer <token>`

## Documentación API (Swagger)

- **Interfaz Web:** Accede en http://localhost:3000/swagger
- **JSON de Swagger:** Descarga desde http://localhost:3000/swagger/json

## Consideraciones Clave

- **Independencia de Microservicios:** Bases de datos separadas y lógica autónoma para cada servicio
- **Gestión de Conexiones:** Variables de entorno para configuración flexible de bases de datos y NATS
- **Arquitectura en Contenedores:** Docker Compose para despliegue consistente con mapeo de puertos único
- **Comunicación Asíncrona:** NATS como sistema de mensajería entre servicios

## Instalación y Ejecución

### Clonar Repositorio
```bash
git clone <URL_REPO>
cd <DIRECTORIO_REPO>
```

### Instalar Dependencias
```bash
cd auth-microservice && npm install
cd ../orders-microservice && npm install
cd ../gateway && npm install
```

### Configurar Entornos
Crear archivos `.env` en cada microservicio con las variables indicadas.

### Iniciar Contenedores
```bash
# En cada directorio de microservicio:
docker compose up -d
```

### Ejecutar Servicios
```bash
# En cada proyecto (auth, orders, gateway):
npm run start:dev
```

### Usar Swagger
Accede a la documentación interactiva en http://localhost:3000/swagger.
http://localhost:3000/swagger/json para descargar el JSON de Swagger.