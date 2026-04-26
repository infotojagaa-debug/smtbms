import sys

path = 'frontend/src/modules/hrModule/pages/EmployeeHub.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The error is around line 356
# 356:         </div> </div>
# 357:              );
# 358:           })}
# 359:         </div>

# We want to remove lines 356, 357, 358.
# And change 356 to just </div>

if '</div> </div>' in lines[355]:
    lines[355] = '         </div>\n'
    del lines[356:358]
    print("Fixed duplication v2!")

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
