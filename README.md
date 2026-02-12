# F.A.R.M. Stack High-Performance Engine 🚀

Este proyecto es una implementación de referencia de una arquitectura asíncrona de alto rendimiento utilizando el stack **F.A.R.M.** (FastAPI, React, MongoDB). Está diseñado específicamente para cargas de trabajo intensivas en CPU y I/O, con una gestión inteligente del hardware moderno.

## 🏗️ Arquitectura de Sistemas

El motor implementa una estrategia de **Orquestación Aware del Hardware**, diferenciando entre núcleos de alto rendimiento (**P-Cores**) y núcleos de eficiencia (**E-Cores**).



### Componentes Clave:
- **FastAPI (v3.13.9 Optimized):** Ingesta de datos asíncrona y streaming de telemetría vía WebSockets.
- **aiomultiprocess:** Ejecución paralela de tareas de Pandas fuera del Event Loop principal para evitar el bloqueo del GIL.
- **Hardware Affinity:** Los workers de procesamiento están anclados a los P-Cores mediante afinidad de CPU (`psutil`).
- **Bounded Queue:** Gestión de backpressure mediante semáforos asíncronos para prevenir el agotamiento de recursos (OOM).

## 🛠️ Stack Tecnológico
- **Lenguaje:** Python 3.13.9
- **Framework Web:** FastAPI
- **Procesamiento:** Pandas + aiomultiprocess
- **Base de Datos:** MongoDB (Motor driver)
- **Frontend:** React + Tailwind CSS + Lucide Icons
- **Monitorización:** WebSockets en tiempo real

## 🚀 Instalación y Despliegue

### Requisitos Previos
- Docker y Docker Compose
- VS Code (Recomendado)

### Lanzamiento rápido
1. Clona el repositorio.
2. Construye y levanta los contenedores:
   ```bash
   docker-compose up --build