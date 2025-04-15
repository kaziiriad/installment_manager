from datetime import datetime, timezone, timedelta

def now():
    """
    Get the current UTC time with timezone information.
    
    Returns:
        datetime: Current UTC time with timezone information
    """
    return datetime.now(timezone.utc)

def add_days(days, from_date=None):
    """
    Add days to a date. If no date is provided, uses current time.
    
    Args:
        days (int): Number of days to add
        from_date (datetime, optional): Starting date. Defaults to now.
        
    Returns:
        datetime: Date with days added
    """
    if from_date is None:
        from_date = now()
    return from_date + timedelta(days=days)

def is_past_due(due_date):
    """
    Check if a due date is in the past.
    
    Args:
        due_date (datetime): The due date to check
        
    Returns:
        bool: True if due date is in the past, False otherwise
    """
    return now() > due_date

def days_until(target_date):
    """
    Calculate days until a target date.
    
    Args:
        target_date (datetime): The target date
        
    Returns:
        int: Number of days until target date (negative if in the past)
    """
    delta = target_date - now()
    return delta.days

def format_date(dt=None, format_str="%Y-%m-%d %H:%M:%S"):
    """
    Format a datetime as a string.
    
    Args:
        dt (datetime, optional): Datetime to format. Defaults to now.
        format_str (str, optional): Format string. Defaults to "%Y-%m-%d %H:%M:%S".
        
    Returns:
        str: Formatted datetime string
    """
    if dt is None:
        dt = now()
    return dt.strftime(format_str)