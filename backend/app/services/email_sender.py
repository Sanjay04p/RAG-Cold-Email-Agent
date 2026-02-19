import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailSenderService:
    def send_email(to_email: str, subject: str, body: str, sender_email: str, sender_password: str) -> bool:
        try:
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))

            # Assuming Gmail for now, but you could make these dynamic too!
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            
            # Log in as the specific user!
            server.login(sender_email, sender_password)
            server.send_message(msg)
            server.quit()
            return True
        except Exception as e:
            print(f"SMTP Error: {e}")
            return False

email_sender = EmailSenderService()