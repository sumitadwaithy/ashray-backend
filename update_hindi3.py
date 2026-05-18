import os
import glob
import re

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

    # Fix ););
    content = content.replace("'););", "'));")
    content = content.replace('"););', '"));')
    
    # Kheti Zameen has `formatDate(` still?
    # wait, earlier we did: content = content.replace('formatDate(', 'formatHindiDate(')
    # let's make sure it's correct.

    with open(filepath, 'w') as f:
        f.write(content)

print("Fixed syntax errors.")
