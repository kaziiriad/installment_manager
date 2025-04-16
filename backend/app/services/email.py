from datetime import datetime
from pydantic import EmailStr
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, From, To, Content
from app.core.config import settings
import os
from jinja2 import Environment, FileSystemLoader, select_autoescape

# Set up Jinja2 environment for email templates
template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(
    loader=FileSystemLoader(template_dir),
    autoescape=select_autoescape(['html', 'xml'])
)

def send_email(to_email: EmailStr, subject: str, content: str):
    """
    Send a generic email with HTML content
    """
    message = Mail(
        from_email=From(settings.EMAIL_SENDER, "Installment Manager"),
        to_emails=To(to_email),
        subject=subject,
        html_content=Content("text/html", content),
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        return response
    except Exception as e:
        print(f"Error sending email: {e}")
        return None

def send_otp_email(to_email: EmailStr, otp: str, expiry_minutes: int = 5):
    """
    Send an OTP verification email using the template
    """
    # Get the template
    template = env.get_template("otp_email.html")
    
    # Create verification URL (optional, can be used if you have a frontend page)
    # verification_url = f"{settings.FRONTEND_URL}/verify?email={to_email}"
    
    # Render the template with the OTP and expiry time
    html_content = template.render(
        otp=otp,
        expiry_minutes=expiry_minutes,
        # verification_url=verification_url
    )
    
    # Send the email
    subject = "Your Verification Code - Installment Manager"
    return send_email(to_email, subject, html_content)

async def send_due_email(to_email: EmailStr, product_name: str, due_date: datetime):
    """
    Send a due date reminder email using the template
    """
    # Get the template
    template = env.get_template("due_email.html")
    
    # Render the template with the product name and due date
    html_content = template.render(
        product_name=product_name,
        due_date=due_date
    )

    # Send the email
    subject = "Reminder: Installment Due - Installment Manager"
    return send_email(to_email, subject, html_content)