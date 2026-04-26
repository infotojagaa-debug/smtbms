import sys

path = 'frontend/src/modules/hrModule/pages/EmployeeHub.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Correct the state:
# 358 (idx 357) is '       )}\n' -> REMOVE
# 361 (idx 360) is '         </div>\n' -> KEEP
# 362 (idx 361) is '       )}\n' -> KEEP (this is the correct one for the grid ternary)
# Wait! Let's check 362.

# 361:         </div>
# 362:       )}
# This is correct for the grid ternary starting at line 248.

# So I just need to remove the one at 358.
if ')}' in lines[357]:
    del lines[357]
    print("Removed misplaced brace at 358")

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
