import requests
url='http://127.0.0.1:5001/api/extract-pdf'
with open(r'c:/Users/ACER/OneDrive/Desktop/Others/DocumentorV3/backend/uploads/enrollments/form137File-1753020267542-62120889-form137 ex.pdf','rb') as f:
    files={'document': f}
    resp = requests.post(url, files=files)
    print(resp.status_code)
    print(resp.text)
