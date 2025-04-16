from celery.schedules import crontab

# Celery Beat schedule configuration
beat_schedule = {
    # Send notifications for installments due tomorrow - runs daily at 9:00 AM
    'daily-tomorrow-due-notifications': {
        'task': 'check_tomorrow_due_installments',
        'schedule': crontab(hour=9, minute=0),
        'options': {
            'expires': 3600,  # Task expires after 1 hour
        },
    },
    
    # Send notifications for installments due in 3 days - runs daily at 10:00 AM
    'daily-upcoming-due-notifications': {
        'task': 'check_upcoming_due_installments',
        'schedule': crontab(hour=10, minute=0),
        'options': {
            'expires': 3600,  # Task expires after 1 hour
        },
    },
}

# Task routing configuration
task_routes = {
    'app.tasks.notification.send_due_notification': {'queue': 'notifications'},
    'app.tasks.notification.send_all_due_notifications': {'queue': 'notifications'},
    'app.tasks.notification.check_tomorrow_due_installments': {'queue': 'notifications'},
    'app.tasks.notification.check_upcoming_due_installments': {'queue': 'notifications'},
}
