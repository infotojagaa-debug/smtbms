import sys

path = 'frontend/src/modules/hrModule/pages/EmployeeHub.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove the wrong line 357 (index 356)
if ')}' in lines[356]:
    del lines[356]

# Find the correct div to close (index 360)
for i in range(len(lines)):
    if '</div>' in lines[i] and i > 355 and i < 365:
         lines[i] = lines[i] + '      )}\n'
         print(f"Fixed at correct line {i+1}")
         break

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
