import sys

def check_js(filepath):
    print(f"Checking {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    line = 1
    col = 0
    in_str = False
    str_char = None
    in_comment = False
    comment_type = None
    
    i = 0
    n = len(content)
    while i < n:
        c = content[i]
        if c == '\n':
            line += 1
            col = 0
            if in_comment and comment_type == '//':
                in_comment = False
            i += 1
            continue
        col += 1
        
        if in_comment:
            if comment_type == '/*' and content[i:i+2] == '*/':
                in_comment = False
                i += 2
                continue
            i += 1
            continue
            
        if in_str:
            if c == str_char and (i == 0 or content[i-1] != '\\'):
                in_str = False
            i += 1
            continue
            
        if content[i:i+2] == '//':
            in_comment = True
            comment_type = '//'
            i += 2
            continue
        elif content[i:i+2] == '/*':
            in_comment = True
            comment_type = '/*'
            i += 2
            continue
            
        if c in ['"', "'", '`']:
            in_str = True
            str_char = c
            i += 1
            continue
            
        if c in '({[':
            stack.append((c, line, col))
        elif c in ')}]':
            if not stack:
                print(f"Unmatched closing {c} at line {line}:{col}")
                return False
            top, tline, tcol = stack.pop()
            expected = {'(': ')', '{': '}', '[': ']'}[top]
            if c != expected:
                print(f"Mismatched {top} from line {tline}:{tcol} closed with {c} at line {line}:{col}")
                return False
        i += 1
                
    if stack:
        top, tline, tcol = stack.pop()
        print(f"Unclosed {top} from line {tline}:{tcol}")
        return False
    print(f"{filepath} OK!")
    return True

for js in ['js/data.js', 'js/auth.js', 'js/app.js', 'js/pages.js']:
    check_js(js)
