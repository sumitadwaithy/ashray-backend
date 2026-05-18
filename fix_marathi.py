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

    # Fix the literal backslashes
    content = content.replace("|| \\'\\')", "|| '')")
    content = content.replace("\\'", "'")

    # Fix ););
    content = content.replace("'););", "'));")
    content = content.replace('"););', '"));')

    with open(filepath, 'w') as f:
        f.write(content)

print("Fixed syntax issues.")
