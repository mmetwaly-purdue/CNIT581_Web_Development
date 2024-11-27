import google.generativeai as genai

#
# 1,000,000 tokens/minute
# 1,500 requests/day
# 15 requests/minute
#

genai.configure(api_key="AIzaSyD39nN2zoujaH5FHFPeviZPDWN24VtgYpI")
model = genai.GenerativeModel("gemini-1.5-flash")

def process_document_with_gemini(document_content, agent_name):
    cleaned_specifier = agent_name.replace(" Agent", "").strip()
    # Define the question dynamically
    question = f"""
    I need you to give me a list of {cleaned_specifier} that you find in this document. Make it comma-separated and if it's only 1 value
    don't do anything special.
    {document_content}
    """
    # Generate a response
    response = model.generate_content(question)
    return response.text