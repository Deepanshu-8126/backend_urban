import os
import re
import shutil
from datetime import datetime
from pathlib import Path

def remove_comments_from_dart(content):
    """Remove all types of comments from Dart code."""
    
    # Remove multi-line comments (/* ... */)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Remove single-line comments (// ...)
    # This regex handles // comments but tries to avoid strings
    lines = []
    for line in content.split('\n'):
        # Simple approach: if line has //, remove everything after it
        # unless it's likely in a string (contains quotes before //)
        if '//' in line:
            # Check if // is likely in a string by looking for quotes
            before_comment = line.split('//')[0]
            quote_count = before_comment.count('"') + before_comment.count("'")
            # If odd number of quotes, // might be in string, keep line as is
            # Otherwise, remove comment part
            if quote_count % 2 == 0:
                line = before_comment
        lines.append(line)
    content = '\n'.join(lines)
    
    # Clean up excessive blank lines (more than 2 consecutive)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    return content

def main():
    lib_path = Path("lib")
    backup_path = Path(f"lib_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    
    print(f"🔍 Starting comment removal process...")
    
    # Create backup
    print(f"📦 Creating backup at: {backup_path}")
    shutil.copytree(lib_path, backup_path)
    print(f"✅ Backup created successfully")
    
    # Get all Dart files
    dart_files = list(lib_path.rglob("*.dart"))
    print(f"📝 Found {len(dart_files)} Dart files to process")
    
    processed_count = 0
    
    for dart_file in dart_files:
        processed_count += 1
        print(f"[{processed_count}/{len(dart_files)}] Processing: {dart_file.name}")
        
        try:
            # Read file
            with open(dart_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove comments
            cleaned_content = remove_comments_from_dart(content)
            
            # Write back
            with open(dart_file, 'w', encoding='utf-8', newline='') as f:
                f.write(cleaned_content)
                
        except Exception as e:
            print(f"❌ Error processing {dart_file.name}: {e}")
    
    print(f"\n✅ Successfully processed {processed_count} files")
    print(f"📂 Backup location: {backup_path}")
    print(f"\n🔧 Running flutter analyze...")
    
    # Run flutter analyze
    os.system("flutter analyze")
    
    print(f"\n✅ Comment removal complete!")
    print(f"⚠️  Please verify the changes and run 'flutter build web' to ensure everything works.")

if __name__ == "__main__":
    main()
