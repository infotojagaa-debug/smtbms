import sys

path = 'frontend/src/pages/admin/UserManagement.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The error is around line 373
# 373:         </div>
# 374:              );
# 375:           })}
# 376:         </div>

if '</div>\n' in lines[372] and '             );\n' in lines[373]:
    del lines[373:376]
    print("Fixed duplication in UserManagement!")

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
