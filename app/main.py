import asyncio
import psutil
import time
import numpy as np
import pandas as pd
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from contextlib import asynccontextmanager

# Importaciones de nuestros módulos
from .engine import get_cpu_topology, orchestrator
from .database import db_telemetry


# --- Modelos de Datos ---
class DataPayload(BaseModel):
    id: str
    values: List[float]


# --- Función Worker (Procesamiento en P-Cores) ---
async def heavy_worker_task(data):
    """
    Simula una carga de trabajo pesada con Pandas.
    Se ejecuta en el pool de procesos de aiomultiprocess.
    """
    import numpy as np
    import pandas as pd
    import asyncio

    # Latencia artificial para ver el Backpressure en el Dashboard
    await asyncio.sleep(1)

    try:
        df = pd.DataFrame(data)
        # Operación intensiva: Senos, Cosenos y Raíces cuadradas
        for _ in range(15):
            df["res"] = np.sin(df[0]) * np.cos(df[0]) + np.sqrt(np.abs(df[0]))

        result = float(df["res"].mean())
        # Sanitización para evitar errores de JSON (NaN/Inf)
        return result if not (np.isnan(result) or np.isinf(result)) else 0.0
    except Exception:
        return 0.0


# --- Gestión del Ciclo de Vida (Lifespan) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ARRANQUE: Conexión a DB e inicio de Pool
    print("🚀 F.A.R.M. Engine: Inicializando sistemas...")
    await db_telemetry.init_db()
    await orchestrator.start()

    yield  # La aplicación está lista para recibir peticiones

    # APAGADO: Cierre limpio de recursos
    print("🛑 F.A.R.M. Engine: Apagando pool de procesos...")
    if orchestrator.pool:
        orchestrator.pool.terminate()
        await orchestrator.pool.join()


# --- Instancia de FastAPI ---
app = FastAPI(
    title="F.A.R.M. Engine API",
    description="Sistema de orquestación de carga entre P-Cores y E-Cores",
    version="2.0.0",
    lifespan=lifespan,
)

# Configuración Maestra de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints REST ---


@app.get("/")
async def health_check():
    return {"status": "online", "engine": "Python 3.13.9", "cores": psutil.cpu_count()}


@app.get("/history")
async def get_history():
    """Recupera los últimos 50 registros de telemetría de MongoDB"""
    return await db_telemetry.get_recent_history(limit=50)


@app.post("/process-data")
async def process_data(payload: DataPayload):
    """Recibe datos, los procesa en P-Cores y loguea la duración"""
    start_time = time.perf_counter()

    async with orchestrator.queue_semaphore:
        pool = await orchestrator.get_pool()
        # Mandamos la tarea al pool de procesos
        result = await pool.apply(heavy_worker_task, (payload.values,))

        duration = time.perf_counter() - start_time

        # Guardamos el log de la tarea de forma asíncrona (Live Persistence)
        asyncio.create_task(db_telemetry.log_task(payload.id, duration, result))

        return {
            "status": "processed",
            "task_id": payload.id,
            "duration": f"{duration:.2f}s",
            "result": result,
        }


@app.get("/history-tasks")
async def get_task_history():
    """Recupera los últimos 10 logs de tareas ejecutadas en P-Cores"""
    cursor = db_telemetry.db.task_logs.find().sort("timestamp", -1).limit(10)
    tasks = await cursor.to_list(length=10)
    for t in tasks:
        t["_id"] = str(t["_id"])  # Limpiamos el ID de Mongo
    return tasks


# --- WebSocket de Telemetría Real-time ---


@app.websocket("/ws/stats")
async def system_stats(websocket: WebSocket):
    await websocket.accept()
    p_indices = get_cpu_topology()

    try:
        while True:
            # Captura de carga de CPU por núcleo
            per_cpu = psutil.cpu_percent(interval=None, percpu=True)

            # Cálculo de Backpressure basado en slots del semáforo
            slots_libres = orchestrator.queue_semaphore._value
            total_slots = orchestrator.max_size
            backpressure = ((total_slots - slots_libres) / total_slots) * 100

            stats = {
                "p_cores": [per_cpu[i] for i in p_indices if i < len(per_cpu)],
                "e_cores": [
                    per_cpu[i] for i in range(len(per_cpu)) if i not in p_indices
                ],
                "ram": psutil.virtual_memory().percent,
                "queue_load": max(0, min(100, backpressure)),
            }

            # Guardar telemetría en MongoDB (Live Persistence)
            asyncio.create_task(db_telemetry.save_stats(stats))

            # Enviar datos al Dashboard de React
            await websocket.send_json(stats)
            await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        print("🔌 Dashboard desconectado")
    except Exception as e:
        print(f"❌ Error en WebSocket: {e}")
