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


@pytest.fixture(scope="function")
async def client():
    """
    Fixture para el cliente de pruebas.
    NOTA: En httpx >= 0.27, 'app' debe pasarse mediante ASGITransport.
    Inicializa el engine antes de cada test y lo limpia después.
    """
    # Resetear el orchestrator antes de cada test
    if orchestrator.pool:
        orchestrator.pool.terminate()
    orchestrator.pool = None

    # Inicializar motor antes de cada test
    await db_telemetry.init_db()
    await orchestrator.start()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    # Limpiar de forma simple sin await complejo
    orchestrator.pool = None
