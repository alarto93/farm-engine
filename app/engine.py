import os
import psutil
import asyncio
from aiomultiprocess import Pool


def get_cpu_topology():
    total = os.cpu_count() or 1
    p_cores = list(range(0, max(1, total - 2)))
    return p_cores


def set_affinity():
    try:
        psutil.Process().cpu_affinity(get_cpu_topology())
    except:
        pass


class HeavyOrchestrator:
    def __init__(self, max_queue_size: int = 10):
        # ESTO ES LO QUE FALTABA:
        self.pool = None
        self.max_size = max_queue_size
        self.queue_semaphore = asyncio.Semaphore(max_queue_size)

    async def start(self):
        if not self.pool:
            self.pool = Pool(
                processes=len(get_cpu_topology()),
                initializer=set_affinity,
                childconcurrency=1,
            )

    async def get_pool(self):
        if not self.pool:
            await self.start()
        return self.pool


# Instancia única
orchestrator = HeavyOrchestrator(max_queue_size=10)
