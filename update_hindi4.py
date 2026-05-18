import os
import glob

base_dir = '/Users/sumitadwaithy/Local Sites/Ashray-Group-Ledger-main/src/components/agreements'

files = []
for root, dirs, filenames in os.walk(base_dir):
    if 'client' in root:
        continue
    for filename in filenames:
        if filename.startswith('Hindi') and filename.endswith('.tsx'):
            files.append(os.path.join(root, filename))

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix the literal backslashes
    content = content.replace("|| \\'\\')", "|| '')")
    
    # Also I noticed I did `String(data.employment?.grossAnnualSalary || '')` 
    # to `convertNumberToHindi(data.employment?.grossAnnualSalary || '')`
    # Let's clean up any escaped quotes that were accidentally added
    content = content.replace("\\'", "'")

    with open(filepath, 'w') as f:
        f.write(content)

print("Fixed escaped quotes.")
