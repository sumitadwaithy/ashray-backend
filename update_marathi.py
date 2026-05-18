import os
import glob
import re

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

    # Replace formatDate block using regex
    format_date_pattern = r'const formatDate = \(dateStr\?: string\) => \{.*?\n\s*\};'
    new_format_date = """const formatMarathiDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return convertNumberToMarathi(dateStr);
    const day = convertNumberToMarathi(date.getDate());
    const month = convertNumberToMarathi(date.getMonth() + 1);
    const year = convertNumberToMarathi(date.getFullYear());
    return `${day}/${month}/${year}`;
  };"""
    content = re.sub(format_date_pattern, new_format_date, content, flags=re.DOTALL)
    
    # KhetiZameen has different type signature: const formatDate = (dateStr?: string): string => {
    format_date_pattern2 = r'const formatDate = \(dateStr\?: string\): string => \{.*?\n\s*\};'
    content = re.sub(format_date_pattern2, new_format_date, content, flags=re.DOTALL)

    content = content.replace('formatDate(', 'formatMarathiDate(')

    format_phone_pattern = r'const formatPhone = \(phone\?: string\) => \{.*?\n\s*\};'
    new_format_phone = """const formatPhone = (phone?: string) => {
    if (!phone) return '';
    return convertNumberToMarathi(`+91 ${phone.replace('+91', '').trim()}`);
  };"""
    content = re.sub(format_phone_pattern, new_format_phone, content, flags=re.DOTALL)

    # Multi-line wrappers
    def wrap_multiline(match):
        var_name = match.group(1)
        var_val = match.group(2)
        if not var_val.strip().startswith('convertToMarathi'):
            return f"{var_name}convertToMarathi({var_val});"
        return match.group(0)

    content = re.sub(r'(const employerAddress =\s*)(.+?;)', wrap_multiline, content, flags=re.DOTALL)
    content = re.sub(r'(const employeeAddress =\s*)(.+?;)', wrap_multiline, content, flags=re.DOTALL)
    content = re.sub(r'(const employerFullName =\s*)(.+?;)', wrap_multiline, content, flags=re.DOTALL)
    content = re.sub(r'(const employeeFullName =\s*)(.+?;)', wrap_multiline, content, flags=re.DOTALL)

    # Wrap variable assignments safely
    def wrap_with_func(match, func_name):
        var_name = match.group(1)
        var_val = match.group(2).strip()
        if var_val.endswith(';'):
            var_val = var_val[:-1]
        if not var_val.startswith(func_name + '('):
            return f"{var_name}{func_name}({var_val});\n"
        return match.group(0)

    # Signatory Name
    content = re.sub(r'(const signatoryName =\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToMarathi'), content)
    # Signatory Role
    content = re.sub(r'(const signatoryRole =\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToMarathi'), content)
    # Designation
    content = re.sub(r'(const designation\s*=\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToMarathi'), content)
    # empType
    content = re.sub(r'(const empType\s*=\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToMarathi'), content)

    # Inline replacements
    content = re.sub(r'String\(data\.employment\?\.grossAnnualSalary \|\| \'\'\)', r'convertNumberToMarathi(data.employment?.grossAnnualSalary || \'\')', content)
    content = re.sub(r'String\(data\.employment\?\.grossMonthlySalary \|\| \'\'\)', r'convertNumberToMarathi(data.employment?.grossMonthlySalary || \'\')', content)
    
    content = content.replace('{data.employment?.grossAnnualSalary || \'\'}', '{convertNumberToMarathi(data.employment?.grossAnnualSalary || \'\')}')
    content = content.replace('{data.employment?.grossMonthlySalary || \'\'}', '{convertNumberToMarathi(data.employment?.grossMonthlySalary || \'\')}')
    content = content.replace('{data.employment?.grossAnnualSalaryWords || \'\'}', '{convertToMarathi(data.employment?.grossAnnualSalaryWords || \'\')}')
    content = content.replace('{data.employment?.grossMonthlySalaryWords || \'\'}', '{convertToMarathi(data.employment?.grossMonthlySalaryWords || \'\')}')
    
    content = content.replace('{data.employment?.annualLeaves || \'१२\'}', '{convertNumberToMarathi(data.employment?.annualLeaves || \'12\')}')
    content = content.replace('{data.employment?.casualLeaves || \'६\'}', '{convertNumberToMarathi(data.employment?.casualLeaves || \'6\')}')
    content = content.replace('{data.employment?.medicalLeaves || \'६\'}', '{convertNumberToMarathi(data.employment?.medicalLeaves || \'6\')}')
    content = content.replace('{data.employment?.annualLeaves || \'12\'}', '{convertNumberToMarathi(data.employment?.annualLeaves || \'12\')}')
    content = content.replace('{data.employment?.casualLeaves || \'6\'}', '{convertNumberToMarathi(data.employment?.casualLeaves || \'6\')}')
    content = content.replace('{data.employment?.medicalLeaves || \'6\'}', '{convertNumberToMarathi(data.employment?.medicalLeaves || \'6\')}')
    
    content = content.replace('{data.employment?.nonCompetePeriod || \'६ (सहा) महिने\'}', '{convertToMarathi(data.employment?.nonCompetePeriod || \'६ (सहा) महिने\')}')
    content = content.replace('{data.employment?.nonCompetePeriod || \'6 (सहा) महिने\'}', '{convertToMarathi(data.employment?.nonCompetePeriod || \'६ (सहा) महिने\')}')
    
    content = content.replace('{data.employment?.nonCompeteRadius || \'२५ कि.मी.\'}', '{convertToMarathi(data.employment?.nonCompeteRadius || \'२५ कि.मी.\')}')
    content = content.replace('{data.employment?.nonCompeteRadius || \'25 कि.मी.\'}', '{convertToMarathi(data.employment?.nonCompeteRadius || \'२५ कि.मी.\')}')
    
    content = content.replace('{data.employment?.noticePeriodEmployer || \'३० (तीस) दिवस\'}', '{convertToMarathi(data.employment?.noticePeriodEmployer || \'३० (तीस) दिवस\')}')
    content = content.replace('{data.employment?.noticePeriodEmployer || \'30 (तीस) दिवस\'}', '{convertToMarathi(data.employment?.noticePeriodEmployer || \'३० (तीस) दिवस\')}')
    
    content = content.replace('{data.employment?.noticePeriodEmployee || \'३० (तीस) दिवस\'}', '{convertToMarathi(data.employment?.noticePeriodEmployee || \'३० (तीस) दिवस\')}')
    content = content.replace('{data.employment?.noticePeriodEmployee || \'30 (तीस) दिवस\'}', '{convertToMarathi(data.employment?.noticePeriodEmployee || \'३० (तीस) दिवस\')}')
    
    content = content.replace('{data.company?.companyName || \'\'}', '{convertToMarathi(data.company?.companyName || \'\')}')
    
    # Aadhaar/PAN mapping
    content = content.replace('{data.employee?.aadhaar || ', '{formatAadhaarMarathi(data.employee?.aadhaar) || ')
    
    # Other common fields
    content = content.replace('{data.employment?.reportingTo || \'\'}', '{convertToMarathi(data.employment?.reportingTo || \'\')}')
    content = content.replace('{data.employment?.department ? ` ${data.employment.department} विभागात` : \'\'}', '{data.employment?.department ? ` ${convertToMarathi(data.employment.department)} विभागात` : \'\'}')
    
    with open(filepath, 'w') as f:
        f.write(content)

print(f"Processed {len(files)} files.")
