import sys

path = 'frontend/src/modules/hrModule/pages/EmployeeHub.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The error is around line 360-362
# 360:         </div>
# 361:            {/* --- PREMIUM NODE REGISTRATION MODAL --- */}
# 362:       {isModalOpen && (

# We want to add )} after 360.
for i in range(len(lines)):
    if '</div>' in lines[i] and i > 350 and i < 370:
        if ')}' not in lines[i+1]:
             lines[i] = lines[i] + '      )}\n'
             print(f"Fixed at line {i+1}")
             break

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
