import sys

path = 'frontend/src/modules/hrModule/pages/EmployeeHub.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find:
#         </div>
#            {/* --- PREMIUM NODE REGISTRATION MODAL --- */}

wrong_part = '         </div>\n            {/* --- PREMIUM NODE REGISTRATION MODAL --- */}'
correct_part = '         </div>\n      )}\n\n      {/* --- PREMIUM NODE REGISTRATION MODAL --- */}'

if wrong_part in content:
    content = content.replace(wrong_part, correct_part)
    print("Fixed!")
else:
    print("Pattern not found exactly. Trying with whitespace flexibility.")
    import re
    content = re.sub(r'</div>\s+\{/\* --- PREMIUM NODE REGISTRATION MODAL --- \*/\}', '</div>\n      )}\n\n      {/* --- PREMIUM NODE REGISTRATION MODAL --- */}', content)

# Also remove any previous failed attempts
content = content.replace('\n      )}\n                </div>', '\n                </div>')
content = content.replace('\n                   </div>\n      )}\n                </div>', '\n                   </div>\n                </div>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
