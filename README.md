# Sims 3D Floorplan Studio 🏠✨

> Recreación tridimensional interactiva de viviendas en formato **"Estilo Los Sims" (Dollhouse / Corte Isométrico)** a partir de fotografías y planos con cotas, utilizando un **circuito 100% gratuito** con IA Multimodal (Google Gemini 3.8 Flash Free Tier) y Three.js.

---

## 🎯 Características Principales

1. **Circuito 100% Gratuito ($0)**:
   - Sin cuotas ni licencias de software privativo (AutoCAD, Revit, Matterport o SaaS de suscripción).
   - Utiliza el Free Tier de **Google Gemini API** (15 solicitudes por minuto, 1M tokens/minuto gratuitos).
   - Renderizado en tiempo real en el navegador mediante **Three.js** (WebGL).

2. **Estética "Los Sims" (Dollhouse / Axonométrica)**:
   - **Muros Seccionados a 1.15m (Modo Sims)**: visualización limpia de todo el interior amueblado sin oclusión visual.
   - **Muros Completos (2.6m)**: elevación completa a nivel de dintel y techo.
   - **Plano Cenital 2D**: vista arquitectónica desde arriba para cotejar con planos técnicos.
   - **Órbita 3D Libre**: rotación e inspección libre con ratón o toques táctiles.

3. **Mobiliario Paramétrico a Medida 1:1**:
   - Reconstrucción proporcional a partir de las fotos de cada ambiente:
     - Sofás rectos y en "L" con chaise longue y almohadones.
     - Camas King/Queen con respaldo tapizado, sommier y sábanas.
     - Mesas de comedor, café y escritorios con accesorios (laptops, pantallas).
     - Muebles de cocina completos con mesada, bajo mesada y bacha de acero.
     - Sanitarios de baño (inodoros, vanitory con espejo).
     - Electrodomésticos y plantas decorativas.
   - Ajuste interactivo de colores y dimensiones en vivo.

4. **Exportación Estándar a `.glb`**:
   - Descarga de la vivienda completa con un solo clic para abrir en Blender, el Visor 3D de Windows, Unreal Engine o compartir con clientes.

---

## 🚀 Cómo Correr el Proyecto Localmente en tu PC

### Requisitos Previos
- [Node.js](https://nodejs.org/) (versión 18 o superior) instalado.
- [Git](https://git-scm.com/) instalado.

### Paso a Paso para el Cliente

```bash
# 1. Clonar el repositorio
git clone https://github.com/nullpointlol/photo23dfloorplan.git

# 2. Entrar a la carpeta del proyecto
cd photo23dfloorplan

# 3. Instalar dependencias
npm install

# 4. Iniciar la aplicación
npm run dev
```

Abre en tu navegador web: **[http://localhost:5173](http://localhost:5173)**. ¡Listo! La maqueta 3D del taller se renderizará automáticamente a escala real en tu equipo.

---

## 📋 Flujo de Trabajo para el Cliente

```
[Insumos del Cliente]
   ├── 1. Plano con cotas o dibujo a mano con medidas
   ├── 2. Descripción escrita de dimensiones (ej. "Living 6x4.8m...")
   └── 3. Al menos 1 foto por habitación
           │
           ▼
[Gemini 3.8 Flash Multimodal]
   ├── Detecta escala métrica 1:1 y polígonos de habitaciones
   ├── Identifica vanos (puertas y ventanas con sus alturas)
   └── Detecta muebles, medidas estimadas y colores
           │
           ▼
[Motor 3D Procedural Three.js]
   ├── Extrusión de muros con corte a 1.15m (Modo Sims)
   ├── Ensamblado paramétrico del mobiliario 1:1
   └── Aplicación de texturas PBR procedimentales (Parquet, Cerámicos, Mármol)
           │
           ▼
[Resultado Final]
   ├── Navegación interactiva en 3D
   └── Descarga en formato binario .GLB
```

---

## 🛠️ Tecnologías Empleadas

- **Frontend**: React 19 + TypeScript + Vite.
- **Gráficos 3D**: Three.js + `three-stdlib` (OrbitControls, GLTFExporter).
- **IA Multimodal**: `@google/genai` con modelo `gemini-3.8-flash` y Structured Output (`responseJsonSchema`).
- **Iconografía**: Lucide React.
