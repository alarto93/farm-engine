import asyncio
import httpx
import time


async def send_single_request(client, task_id):
    # Datos de prueba: una lista de números
    payload = {"id": f"task_{task_id}", "values": [float(i) for i in range(150)]}
    try:
        # Timeout None es vital para no cortar la conexión mientras el worker procesa
        response = await client.post(
            "http://localhost:8000/process-data", json=payload, timeout=None
        )
        print(f"✅ Tarea {task_id:02d} terminada | Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Tarea {task_id:02d} falló: {e}")


async def run_stress_test():
    async with httpx.AsyncClient() as client:
        print("🚀 Iniciando ráfaga de 50 tareas...")
        print("📊 Mira tu Dashboard: La barra azul (Backpressure) debería subir ahora.")

        # Creamos 50 tareas para enviar en paralelo
        start_time = time.perf_counter()
        tasks = [send_single_request(client, i) for i in range(100)]

        # Las lanzamos todas a la vez
        await asyncio.gather(*tasks)

        duration = time.perf_counter() - start_time
        print(f"\n🏁 Test completado en {duration:.2f} segundos.")


if __name__ == "__main__":
    try:
        asyncio.run(run_stress_test())
    except KeyboardInterrupt:
        print("\n🛑 Test cancelado por el usuario.")
