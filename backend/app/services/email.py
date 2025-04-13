# sendgrid_email.py (renamed file)
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, From, To, Content
from core.config import settings

def send_email(to_email: str, subject: str, content: str):
    message = Mail(
        from_email=From(settings.EMAIL_SENDER, "Installment Manager"),
        to_emails=To(to_email),
        subject=subject,
        plain_text_content=content
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code
    except Exception as e:
        print(e)
        return None
    

