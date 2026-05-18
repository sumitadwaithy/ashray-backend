import os
import glob

base_dir = '/Users/sumitadwaithy/Local Sites/Ashray-Group-Ledger-main/src/components/agreements'

files = []
for root, dirs, filenames in os.walk(base_dir):
    if 'client' in root:
        continue
    for filename in filenames:
        if filename.startswith('Marathi') and filename.endswith('.tsx'):
            files.append(os.path.join(root, filename))

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix .trim(););
    content = content.replace(".trim(););", ".trim());")
    content = content.replace("].filter(Boolean).join(' '););", "].filter(Boolean).join(' '));")
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Fixed trim syntax issues.")
