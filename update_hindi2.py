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

    # We need to wrap employerAddress and employeeAddress in convertToHindi
    # Example:
    # const employerAddress = [
    #   data.company?.companyAddress,
    #   ...
    # ].filter(Boolean).join(', ') + (data.company?.companyPincode ? ` - ${data.company.companyPincode}` : '');
    
    # Let's do a robust replacement: Find the declaration, find the semicolon.
    def wrap_multiline(match):
        var_name = match.group(1)
        var_val = match.group(2)
        if not var_val.strip().startswith('convertToHindi'):
            return f"{var_name}convertToHindi({var_val});"
        return match.group(0)

    content = re.sub(r'(const employerAddress =\s*)(.+?;)', wrap_multiline, content, flags=re.DOTALL)
    content = re.sub(r'(const employeeAddress =\s*)(.+?;)', wrap_multiline, content, flags=re.DOTALL)
    content = re.sub(r'(const employerFullName =\s*)(.+?;)', wrap_multiline, content, flags=re.DOTALL)
    content = re.sub(r'(const employeeFullName =\s*)(.+?;)', wrap_multiline, content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)

print("Fixed multiline assignments.")
