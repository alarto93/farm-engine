import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os


class TelemetryDB:
    def __init__(self):
        self.client = None
        self.db = None
        # Obtenemos la URL de conexión de las variables de entorno o usamos la por defecto de Docker
        self.mongo_url = os.getenv("MONGO_URL", "mongodb://mongodb:27017")

    async def init_db(self):
        """Inicializa la conexión con MongoDB y las colecciones."""
        try:
            self.client = AsyncIOMotorClient(self.mongo_url)
            self.db = self.client.farm_database
            # Verificamos la conexión
            await self.client.admin.command("ping")
            print("✅ MongoDB: Conexión establecida exitosamente.")
        except Exception as e:
            print(f"❌ MongoDB: Error de conexión: {e}")

    async def save_stats(self, stats: dict):
        """Guarda una instantánea de la telemetría del sistema (CPU, RAM, Cola)."""
        if self.db is None:
            return

        try:
            # Añadimos timestamp en UTC para el historial
            document = {
                **stats,
                "timestamp": datetime.datetime.now(datetime.timezone.utc),
            }
            await self.db.hardware_logs.insert_one(document)
        except Exception as e:
            print(f"⚠️ Error guardando telemetría: {e}")

    async def log_task(self, task_id: str, duration: float, result: float):
        """Registra el resultado y la duración de una tarea procesada por los P-Cores."""
        if self.db is None:
            return

        try:
            log_entry = {
                "task_id": task_id,
                "duration_seconds": duration,
                "result": result,
                "timestamp": datetime.datetime.now(datetime.timezone.utc),
            }
            await self.db.task_logs.insert_one(log_entry)
        except Exception as e:
            print(f"⚠️ Error guardando log de tarea: {e}")

    async def get_recent_history(self, limit: int = 50):
        """Recupera los últimos N registros para inicializar las gráficas del Dashboard."""
        if self.db is None:
            return []

        try:
            # Buscamos los logs de hardware más recientes
            cursor = self.db.hardware_logs.find().sort("timestamp", -1).limit(limit)
            logs = await cursor.to_list(length=limit)

            # Limpiamos el formato para JSON (convertimos _id a string)
            for log in logs:
                log["_id"] = str(log["_id"])
                # Convertimos datetime a ISO string para el frontend
                if isinstance(log["timestamp"], datetime.datetime):
                    log["timestamp"] = log["timestamp"].isoformat()

            # Devolvemos en orden cronológico (más antiguo a más reciente)
            return logs[::-1]
        except Exception as e:
            print(f"⚠️ Error recuperando historial: {e}")
            return []


# Instancia única para ser importada en main.py
db_telemetry = TelemetryDB()
