# test_gemini.py
import google.generativeai as genai

# Your API Key
genai.configure(api_key="AIzaSyDAfZO4YMTxjpROmT7M2yttAo0xoS8TQdY")

model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content("Hello, are you working?")
print(response.text)