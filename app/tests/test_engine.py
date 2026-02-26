import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    """Verifica que el endpoint base responda correctamente."""
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


@pytest.mark.asyncio
async def test_backpressure_logic():
    """Prueba unitaria de la lógica del semáforo del orquestador."""
    from app.engine import orchestrator

    initial_slots = orchestrator.queue_semaphore._value
    async with orchestrator.queue_semaphore:
        assert orchestrator.queue_semaphore._value == initial_slots - 1
    assert orchestrator.queue_semaphore._value == initial_slots


@pytest.mark.asyncio
async def test_process_data_flow(client):
    """Valida el flujo de datos: API -> Pool -> Respuesta."""
    test_data = {"id": "test_job_123", "values": [0.5, 1.5, 2.5]}
    response = await client.post("/process-data", json=test_data, timeout=10)
    assert response.status_code == 200
    assert "result" in response.json()
    assert response.json()["status"] == "processed"
