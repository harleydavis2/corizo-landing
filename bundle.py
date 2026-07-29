import os
import shutil
import re
from urllib.parse import urlparse, unquote

src_dir = r"e:\corizo\corizo.in\corizo.in"
dest_dir = r"e:\corizo\corizo.in\landing_page_bundle"
assets_dir = os.path.join(dest_dir, "assets")

os.makedirs(assets_dir, exist_ok=True)

def is_local(url):
    if not url: return False
    parsed = urlparse(url)
    if parsed.scheme in ["http", "https", "data", "mailto", "tel"]: return False
    if url.startswith("//"): return False
    if url.startswith("#"): return False
    return True

copied_files = set()

def process_css(css_path, original_url_dir):
    with open(css_path, "r", encoding="utf-8", errors="ignore") as f:
        css_content = f.read()
        
    def css_replacer(match):
        url = match.group(2)
        quote = match.group(1) if match.group(1) else ""
        if is_local(url):
            clean_url = url.split("?")[0].split("#")[0]
            clean_url = unquote(clean_url)
            
            css_dir = os.path.dirname(css_path)
            src_file = os.path.normpath(os.path.join(css_dir, clean_url.replace("/", os.sep)))
            
            if os.path.exists(src_file) and os.path.isfile(src_file):
                try:
                    rel_to_src = os.path.relpath(src_file, src_dir)
                except ValueError:
                    return match.group(0)
                
                if rel_to_src.startswith(".."):
                    return match.group(0)
                
                target_asset_dir = os.path.join(assets_dir, os.path.dirname(rel_to_src))
                os.makedirs(target_asset_dir, exist_ok=True)
                target_file = os.path.join(target_asset_dir, os.path.basename(rel_to_src))
                
                if src_file not in copied_files:
                    shutil.copy2(src_file, target_file)
                    copied_files.add(src_file)
                    
        return match.group(0)
        
    url_pattern = re.compile(r'url\(([\'"]?)(.*?)\1\)', re.IGNORECASE)
    url_pattern.sub(css_replacer, css_content)

def process_html(html_path, base_dest):
    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()
        
    def replace_and_copy(match):
        attr = match.group(1)
        quote = match.group(2)
        url = match.group(3)
        
        if is_local(url):
            clean_url = url.split("?")[0].split("#")[0]
            clean_url = unquote(clean_url)
            
            if clean_url.startswith("/"):
                clean_url = clean_url[1:]
                
            src_file = os.path.normpath(os.path.join(src_dir, clean_url.replace("/", os.sep)))
            
            if os.path.exists(src_file) and os.path.isfile(src_file):
                try:
                    rel_to_src = os.path.relpath(src_file, src_dir)
                except ValueError:
                    return match.group(0)
                
                if rel_to_src.startswith(".."):
                    return match.group(0)
                    
                target_asset_dir = os.path.join(assets_dir, os.path.dirname(rel_to_src))
                os.makedirs(target_asset_dir, exist_ok=True)
                target_file = os.path.join(target_asset_dir, os.path.basename(rel_to_src))
                
                if src_file not in copied_files:
                    shutil.copy2(src_file, target_file)
                    copied_files.add(src_file)
                    
                    if src_file.endswith(".css"):
                        process_css(src_file, os.path.dirname(rel_to_src))
                
                new_url = "assets/" + rel_to_src.replace(os.sep, "/")
                if "?" in url:
                    new_url += "?" + url.split("?")[1]
                elif "#" in url:
                    new_url += "#" + url.split("#")[1]
                    
                return f"{attr}={quote}{new_url}{quote}"
            else:
                pass
                
        return match.group(0)

    pattern = re.compile(r'(href|src)=([\'"])(.*?)\2', re.IGNORECASE)
    new_html = pattern.sub(replace_and_copy, html_content)
    
    with open(os.path.join(base_dest, "index.html"), "w", encoding="utf-8") as f:
        f.write(new_html)

process_html(os.path.join(src_dir, "index.html"), dest_dir)
print("Bundling complete.")
