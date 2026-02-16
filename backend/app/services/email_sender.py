import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailSenderService:
    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Sends an email using the configured SMTP server."""
        try:
            # 1. Construct the email
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_USER
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            # 2. Connect to the server
            print(f"Connecting to SMTP server {settings.SMTP_HOST}...")
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls() # Secure the connection
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            
            # 3. Send and close
            server.send_message(msg)
            server.quit()
            
            print(f"Successfully sent email to {to_email}")
            return True
            
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

email_sender = EmailSenderService()