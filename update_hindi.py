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

    # Replace formatDate block using regex
    format_date_pattern = r'const formatDate = \(dateStr\?: string\) => \{.*?\n\s*\};'
    new_format_date = """const formatHindiDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return convertNumberToHindi(dateStr);
    const day = convertNumberToHindi(date.getDate());
    const month = convertNumberToHindi(date.getMonth() + 1);
    const year = convertNumberToHindi(date.getFullYear());
    return `${day}/${month}/${year}`;
  };"""
    content = re.sub(format_date_pattern, new_format_date, content, flags=re.DOTALL)
    
    # KhetiZameen has different type signature: const formatDate = (dateStr?: string): string => {
    format_date_pattern2 = r'const formatDate = \(dateStr\?: string\): string => \{.*?\n\s*\};'
    content = re.sub(format_date_pattern2, new_format_date, content, flags=re.DOTALL)

    content = content.replace('formatDate(', 'formatHindiDate(')

    format_phone_pattern = r'const formatPhone = \(phone\?: string\) => \{.*?\n\s*\};'
    new_format_phone = """const formatPhone = (phone?: string) => {
    if (!phone) return '';
    return convertNumberToHindi(`+91 ${phone.replace('+91', '').trim()}`);
  };"""
    content = re.sub(format_phone_pattern, new_format_phone, content, flags=re.DOTALL)

    # Wrap variable assignments safely
    def wrap_with_func(match, func_name):
        var_name = match.group(1)
        var_val = match.group(2).strip()
        if var_val.endswith(';'):
            var_val = var_val[:-1]
        if not var_val.startswith(func_name + '('):
            return f"{var_name}{func_name}({var_val});\n"
        return match.group(0)

    # Employer full name
    content = re.sub(r'(const employerFullName =\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToHindi'), content)
    # Employer address
    content = re.sub(r'(const employerAddress =\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToHindi'), content)
    # Employee full name
    content = re.sub(r'(const employeeFullName =\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToHindi'), content)
    # Employee address
    content = re.sub(r'(const employeeAddress =\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToHindi'), content)
    # Signatory Name
    content = re.sub(r'(const signatoryName =\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToHindi'), content)
    # Signatory Role
    content = re.sub(r'(const signatoryRole =\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToHindi'), content)
    # Designation
    content = re.sub(r'(const designation\s*=\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToHindi'), content)
    # empType
    content = re.sub(r'(const empType\s*=\s*)(.+?;)', lambda m: wrap_with_func(m, 'convertToHindi'), content)

    # Inline replacements
    content = re.sub(r'String\(data\.employment\?\.grossAnnualSalary \|\| \'\'\)', r'convertNumberToHindi(data.employment?.grossAnnualSalary || \'\')', content)
    content = re.sub(r'String\(data\.employment\?\.grossMonthlySalary \|\| \'\'\)', r'convertNumberToHindi(data.employment?.grossMonthlySalary || \'\')', content)
    
    content = content.replace('{data.employment?.grossAnnualSalary || \'\'}', '{convertNumberToHindi(data.employment?.grossAnnualSalary || \'\')}')
    content = content.replace('{data.employment?.grossMonthlySalary || \'\'}', '{convertNumberToHindi(data.employment?.grossMonthlySalary || \'\')}')
    content = content.replace('{data.employment?.grossAnnualSalaryWords || \'\'}', '{convertToHindi(data.employment?.grossAnnualSalaryWords || \'\')}')
    content = content.replace('{data.employment?.grossMonthlySalaryWords || \'\'}', '{convertToHindi(data.employment?.grossMonthlySalaryWords || \'\')}')
    
    content = content.replace('{data.employment?.annualLeaves || \'12\'}', '{convertNumberToHindi(data.employment?.annualLeaves || \'12\')}')
    content = content.replace('{data.employment?.casualLeaves || \'6\'}', '{convertNumberToHindi(data.employment?.casualLeaves || \'6\')}')
    content = content.replace('{data.employment?.medicalLeaves || \'6\'}', '{convertNumberToHindi(data.employment?.medicalLeaves || \'6\')}')
    content = content.replace('{data.employment?.nonCompetePeriod || \'6 (छह) माह\'}', '{convertToHindi(data.employment?.nonCompetePeriod || \'6 (छह) माह\')}')
    content = content.replace('{data.employment?.nonCompeteRadius || \'25 कि.मी.\'}', '{convertToHindi(data.employment?.nonCompeteRadius || \'25 कि.मी.\')}')
    content = content.replace('{data.employment?.noticePeriodEmployer || \'30 (तीस) दिन\'}', '{convertToHindi(data.employment?.noticePeriodEmployer || \'30 (तीस) दिन\')}')
    content = content.replace('{data.employment?.noticePeriodEmployee || \'30 (तीस) दिन\'}', '{convertToHindi(data.employment?.noticePeriodEmployee || \'30 (तीस) दिन\')}')
    
    content = content.replace('{data.company?.companyName || \'\'}', '{convertToHindi(data.company?.companyName || \'\')}')
    
    # Aadhaar/PAN mapping
    content = content.replace('{data.employee?.aadhaar || ', '{formatAadhaarHindi(data.employee?.aadhaar) || ')
    
    # Other common fields
    content = content.replace('{data.employment?.reportingTo || \'\'}', '{convertToHindi(data.employment?.reportingTo || \'\')}')
    content = content.replace('{data.employment?.department ? ` ${data.employment.department} विभाग में` : \'\'}', '{data.employment?.department ? ` ${convertToHindi(data.employment.department)} विभाग में` : \'\'}')
    
    with open(filepath, 'w') as f:
        f.write(content)

print(f"Processed {len(files)} files.")
