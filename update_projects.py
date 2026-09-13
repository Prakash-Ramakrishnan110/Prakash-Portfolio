import re
import sys
import os

def update_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_project_html = """				<!-- Project 1 -->
				<div class="col-md-4 d-flex mb-5">
					<div class="project-card ftco-animate">
						<span class="rank-badge">#1</span>
						<h3><a href="https://github.com/Prakash-Ramakrishnan110/devorax" target="_blank">DevoraX — Modern Utility Toolkit</a></h3>
						<p>An open-source NPM package providing a robust collection of modular, production-ready utility functions for AI API integrations, secure data handling, and asynchronous task management. Built with TypeScript for first-class type safety.</p>
						<div class="tech-tags">
							<span class="tech-tag tag-ts">TypeScript</span>
							<span class="tech-tag tag-saas">NPM</span>
							<span class="tech-tag tag-ts">Open Source</span>
						</div>
						<a href="https://github.com/Prakash-Ramakrishnan110/devorax" target="_blank" class="github-btn">
							<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
							View Repo
						</a>
					</div>
				</div>

"""

    for i in range(9, 0, -1):
        content = content.replace(f'<!-- Project {i} -->', f'<!-- Project {i+1} -->')
        content = content.replace(f'<span class="rank-badge">#{i}</span>', f'<span class="rank-badge">#{i+1}</span>')

    parts = content.split('<!-- Project 2 -->', 1)
    if len(parts) == 2:
        new_content = parts[0] + new_project_html + '<!-- Project 2 -->' + parts[1]
        with open('index_new.html', 'w', encoding='utf-8') as f2:
            f2.write(new_content)
        os.replace('index_new.html', file_path)
        print("Successfully updated index.html")
    else:
        print("Failed to find '<!-- Project 2 -->'")

if __name__ == '__main__':
    update_html(sys.argv[1])
