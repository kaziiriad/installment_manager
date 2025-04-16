from celery import Celery
from .config import settings
from .celery_config import beat_schedule, task_routes

# Create Celery app with the queue-specific Redis URL
app = Celery(
    "installment_manager",
    broker=settings.REDIS_URL_QUEUE,
    backend=settings.REDIS_URL_QUEUE,
    include=[
        "app.tasks.notification",
        # Add other task modules here as needed
    ]
)

# Configure Celery
app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule=beat_schedule,
    task_routes=task_routes,
)

# Optional: Configure task-specific settings
app.conf.task_default_queue = 'default'

# This allows you to use the app directly when imported
if __name__ == '__main__':
    app.start()