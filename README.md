<div align="center">
  <a href="https://github.com/DIMFLIX-EDUCATION" target="_blank">
    <img src="assets/education.png" width="350" height="190" style="border-radius: 16px; box-shadow: 0 6px 25px rgba(0,0,0,0.25);" alt="DIMFLIX Education" />
  </a>
  <br />
  <br />
  <a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=Outfit&size=36&duration=2500&pause=2000&color=38BDF8&center=true&width=600&height=50&lines=ENERGY+HOME;Control+de+Energ%C3%ADa+Inteligente;Monitoreo+IoT+en+Tiempo+Real" alt="Typing SVG" /></a>
</div>

<div align="center">
  <a href="#about">Acerca de</a> • <a href="#flow">Recorrido</a> • <a href="#architecture">Arquitectura</a> • <a href="#setup">Instalación</a> • <a href="#credentials">Credenciales</a>
</div>

<br />

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

<br />

<div align="center">
  <img src="assets/final_video_completo.webp" style="width: 100%; max-width: 950px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);" alt="Recorrido completo de Energy Home" />
</div>

---

<a name="about"></a>

## ⚡ Acerca de Energy Home

Energy Home es una plataforma web inteligente diseñada para el **monitoreo, análisis y control del consumo eléctrico** residencial en tiempo real. Utilizando un ecosistema de microservicios, el sistema procesa telemetría enviada por hardware simulado (ESP32) para calcular costos proyectados, detectar anomalías y sugerir patrones óptimos de consumo eléctrico.

```javascript
const ProyectoEnergyHome = {
    tipo: "IoT + Plataforma de Monitoreo Energético",
    tecnologias: {
        frontend: ["Next.js (React 19)", "TailwindCSS", "Framer Motion", "ECharts"],
        backend: ["NestJS (TypeScript)", "Prisma ORM", "WebSockets"],
        baseDatos: ["MySQL Server 8.x/9.x"],
        simulador: ["Python 3", "Requests library"]
    },
    caracteristicasClave: [
        "Monitoreo de Potencia (W), Voltaje (V) y Amperaje (A)",
        "Tarifación dinámica en soles (S/ 0.78 kWh - Electrosur)",
        "Gráficos históricos interactivos con descarga en PDF",
        "Control remoto simulado de encendido/apagado",
        "Detección inteligente de anomalías en consumo"
    ]
};
```

---

<a name="flow"></a>

## 📊 Flujo Paso a Paso de la Plataforma

### 🏠 1. Página de Inicio (Landing Page)
La página principal presenta el producto, sus beneficios, la propuesta de valor y las características principales de ahorro inteligente de energía.

![Presentación del Sistema](assets/landing_bottom_1782893047508.png)

---

### 📈 2. Panel Principal (Dashboard)
Una vez iniciada la sesión, el usuario ingresa al panel principal. Las tarjetas de consumo (Watts, costo, voltaje) se actualizan dinámicamente cada 5 segundos mediante la telemetría del simulador ESP32.

![Dashboard Principal Scrolled](assets/dashboard_scrolled_1782893077888.png)

---

### 📺 3. Detalle de Consumo por Equipo
En la sección **Dispositivos**, al seleccionar un equipo como el **Aire Acondicionado**, se abre una vista dedicada que desglosa su potencia, voltaje promedio y el histórico de mediciones enviadas por el hardware en tiempo real.

![Detalle de Dispositivo](assets/dispositivo_detalle_1782893098440.png)

---

### 📊 4. Reportes con Filtro de Tiempo
La pestaña de **Reportes** consolida estadísticas avanzadas con gráficos mensuales interactivos y un gráfico de distribución de consumo. Incluye filtros funcionales para lapsos de **3 Meses** y **6 Meses** y exportación de datos.

![Reportes Filtrados](assets/reportes_filtrados_1782893127222.png)

---

### 🧠 5. Análisis e Histórico ML
Visualiza el análisis predictivo de consumo. La plataforma grafica los picos y detecta automáticamente anomalías en la telemetría mediante algoritmos inteligentes, calculando costos e indicando recomendaciones detalladas.

![Análisis Machine Learning](assets/analisis_ml_1782893143205.png)

---

### ⚙️ 6. Configuración de Cuenta (Pestañas)
Un panel completo de personalización dividido en 5 categorías navegables para el usuario:

* **Perfil de Usuario:** Información personal y de contacto.
* **Notificaciones:** Configuración de alertas de consumo.
* **Apariencia:** Alternancia entre tema Claro y Oscuro.
* **Energía:** Configuración de umbrales límite de potencia.
* **Seguridad:** Modificación de accesos y credenciales.

<div align="center">
<table>
  <tr>
    <td><b>Perfil</b></td>
    <td><b>Notificaciones</b></td>
  </tr>
  <tr>
    <td><img src="assets/config_perfil_1782893157051.png" width="350"/></td>
    <td><img src="assets/config_notificaciones_1782893161812.png" width="350"/></td>
  </tr>
  <tr>
    <td><b>Apariencia</b></td>
    <td><b>Energía</b></td>
  </tr>
  <tr>
    <td><img src="assets/config_apariencia_1782893166071.png" width="350"/></td>
    <td><img src="assets/config_energia_1782893170437.png" width="350"/></td>
  </tr>
</table>
</div>

---

<a name="architecture"></a>

## 🛠️ Arquitectura del Sistema

El flujo de información se despliega de la siguiente manera:

```
┌─────────────────────────────────┐
│     Simulador ESP32 (Python)    │
│  (Envía telemetría cada 5 seg)  │
└────────────────┬────────────────┘
                 │ (HTTP POST JSON)
                 ▼
┌─────────────────────────────────┐      Reads/Writes      ┌─────────────────────────┐
│     Backend API (NestJS)        ├───────────────────────>│   Base de Datos (MySQL) │
│   (Swagger, Prisma ORM, WS)     │                        └─────────────────────────┘
└────────────────▲────────────────┘
                 │ (REST API & WebSockets)
                 │
┌────────────────┴────────────────┐
│     Frontend Web (Next.js)      │
│  (Framer Motion, Charts, UI/UX) │
└─────────────────────────────────┘
```

---

<a name="setup"></a>

## 🚀 Guía de Instalación y Arranque Rápido

### Paso 1: Configurar el Backend (NestJS)
1. Entra a la carpeta del backend:
   ```bash
   cd backend-energy
   ```
2. Asegúrate de configurar tu `.env`. Debe apuntar a tu base de datos MySQL local en el puerto `3306`:
   ```env
   DATABASE_URL="mysql://root@localhost:3306/energy_db"
   PORT=3000
   ```
3. Instala dependencias y prepara Prisma:
   ```bash
   npm install
   npx prisma migrate dev
   npx prisma db seed
   ```
   *La base de datos MySQL se configurará e importará automáticamente.*

4. Inicia el servidor:
   ```bash
   npm run start:dev
   ```

### Paso 2: Configurar el Frontend (Next.js)
1. Ve a la carpeta del frontend:
   ```bash
   cd ../energy
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor Next.js:
   ```bash
   npm run dev
   ```
   *El frontend web estará disponible en: `http://localhost:3001`*

### Paso 3: Lanzar el Simulador ESP32
1. En la raíz del proyecto, instala la librería `requests`:
   ```bash
   pip install requests
   ```
2. Ejecuta el script de simulación:
   ```bash
   python simulador_esp32.py
   ```

---

<a name="credentials"></a>

## 🔑 Credenciales de Prueba (Seed)

| Usuario | Password | Rol |
| :--- | :--- | :--- |
| **admin@energy.com** | `123456` | Administrador |
| **user@energy.com** | `123456` | Usuario Regular |
