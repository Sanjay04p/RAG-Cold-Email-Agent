import resend
import os

class EmailSenderService:
    def send_email(self, to_email: str, subject: str, body: str, sender_email: str, sender_password: str) -> bool:
        # In a real SaaS with Resend, you'd use your Resend API Key
        # But to keep your "Gmail Settings" feature, we can use Resend's API
        resend.api_key = os.getenv("RESEND_API_KEY") 

        try:
            resend.Emails.send({
                "from": f"Your Name <onboarding@resend.dev>", # Or your verified domain
                "to": to_email,
                "subject": subject,
                "html": body,
            })
            return True
        except Exception as e:
            print(f"Resend Error: {e}")
            return False