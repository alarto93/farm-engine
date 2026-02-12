import pytest
import asyncio
import os
import sys
from httpx import AsyncClient, ASGITransport

# Aseguramos que el path sea correcto para importar 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.engine import orchestrator
from app.database import db_telemetry


@pytest.fixture(scope="session")
def event_loop():
    """Configuración del bucle de eventos para la sesión de pruebas."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def initialize_engine():
    """Inicialización de servicios críticos antes de los tests."""
    await db_telemetry.init_db()
    await orchestrator.start()
    yield
    # Apagado limpio de recursos
    if orchestrator.pool:
        orchestrator.pool.terminate()
        await orchestrator.pool.join()


@pytest.fixture
async def client():
    """
    Fixture para el cliente de pruebas.
    NOTA: En httpx >= 0.27, 'app' debe pasarse mediante ASGITransport.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
