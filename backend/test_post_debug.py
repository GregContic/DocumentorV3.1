import requests
url='http://127.0.0.1:5001/api/extract-debug'
with open(r'c:/Users/ACER/OneDrive/Desktop/Others/DocumentorV3/backend/uploads/enrollments/form137File-1753020267542-62120889-form137 ex.pdf','rb') as f:
    files={'document': f}
    resp = requests.post(url, files=files)
    print(resp.status_code)
    try:
        j = resp.json()
        print('\n-- raw_text_preview --\n')
        print(j.get('raw_text_preview','')[:3000])
        print('\n-- corrected_text_preview --\n')
        print(j.get('corrected_text_preview','')[:3000])
    except Exception as e:
        print(resp.text)
