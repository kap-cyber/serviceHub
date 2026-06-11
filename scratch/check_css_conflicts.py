import os
import re
from collections import defaultdict

css_dir = "c:/Users/Kapil Panchal/Downloads/servicehub/servicehub/src"
selector_files = defaultdict(list)

# Regex to find selectors in CSS (simplified to class names starting with .)
class_regex = re.compile(r'\.([a-zA-Z0-9_-]+)(?::[a-zA-Z0-9_-]+|\[.*\])?(?:\s*,\s*\.([a-zA-Z0-9_-]+)(?::[a-zA-Z0-9_-]+|\[.*\])?)*\s*\{')

for root, dirs, files in os.walk(css_dir):
    for file in files:
        if file.endswith(".css"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                # Remove comments to avoid false positives
                content_clean = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
                
                # Find all class selectors
                classes = re.findall(r'\.([a-zA-Z0-9_-]+)', content_clean)
                for cls in set(classes):
                    selector_files[cls].append(file)

print("DUPLICATE CLASSES FOUND:")
for cls, files in sorted(selector_files.items()):
    if len(files) > 1:
        # Exclude common utility classes if any, e.g. layout/theme classes if we expect them
        print(f"Class: .{cls} defined in: {files}")
