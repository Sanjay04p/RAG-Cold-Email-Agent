import requests
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from playwright_stealth import stealth_sync
import urllib.parse

class ScraperService:
    def scrape_website(self, url: str) -> str:
        """
        Attempts to scrape using Stealth Playwright. 
        If it fails or times out, falls back to the standard Requests library.
        """
        print(f"Attempting to scrape: {url}")
        html_content = ""

        # --- METHOD 1: STEALTH PLAYWRIGHT ---
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    args=["--disable-blink-features=AutomationControlled", "--disable-infobars"]
                )
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                )
                page = context.new_page()
                stealth_sync(page)
                
                # CHANGED: Back to domcontentloaded so it doesn't hang forever
                page.goto(url, wait_until="domcontentloaded", timeout=15000)
                html_content = page.content()
                browser.close()
                print("Playwright scraping successful.")
                
        except Exception as e:
            print(f"Playwright failed/timed out: {e}")
            print("Falling back to basic requests...")

        # --- METHOD 2: FALLBACK (Requests) ---
        if not html_content:
            try:
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()
                html_content = response.text
                print("Fallback request successful.")
            except Exception as e:
                print(f"Fallback request also failed: {e}")
                return ""

        # --- PARSE AND CLEAN THE HTML ---
        if html_content:
            soup = BeautifulSoup(html_content, "html.parser")

            # Remove junk tags
            for element in soup(["script", "style", "noscript", "nav", "footer", "header", "aside"]):
                element.decompose()

            # Extract text
            text = soup.get_text(separator=' ')
            clean_text = " ".join(text.split())
            
            return clean_text[:2000]
            
        return ""
    

    async def get_linkedin_snippet(name: str, company: str, page) -> str:
        """Scrapes the Google search snippet for a prospect's LinkedIn profile."""
        # Format the strict search query
        query = f'site:linkedin.com/in/ "{name}" "{company}"'
        url = f"https://www.google.com/search?q={urllib.parse.quote(query)}"
        
        await page.goto(url)
        
        try:
            # Target the first organic search result block
            first_result = await page.query_selector("#search .g")
            if first_result:
                snippet = await first_result.inner_text()
                # Clean up the text to save LLM tokens
                return snippet.replace("\n", " ").strip()
        except Exception as e:
            print(f"Snippet extraction failed: {e}")
            
        return "No LinkedIn data found."

scraper = ScraperService()