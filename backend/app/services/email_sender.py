import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailSenderService:
    def send_email(self, to_email: str, subject: str, body: str, sender_email: str, sender_password: str) -> bool:
        try:
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))

            # THE FIX: Use SMTP_SSL on Port 465 instead of standard SMTP on 587
            # This starts a fully encrypted connection immediately, bypassing firewalls
            server = smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=15)
            
            server.login(sender_email, sender_password)
            server.send_message(msg)
            server.quit()
            return True
        except Exception as e:
            print(f"SMTP Error: {e}")
            return False

# Ensure this instance is created at the bottom of the file
email_sender = EmailSenderService()