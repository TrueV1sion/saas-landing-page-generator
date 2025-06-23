#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * Advanced TypeScript ES Module Import Fixer
 * Automatically adds .js extensions to all relative imports for ESNext compatibility
 */

class ESModuleImportFixer {
  private processedFiles = new Set<string>();
  private fixCount = 0;

  /**
   * Recursively process all TypeScript files in a directory
   */
  processDirectory(dirPath: string): void {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !entry.includes('node_modules') && !entry.includes('dist')) {
        this.processDirectory(fullPath);
      } else if (stat.isFile() && entry.endsWith('.ts')) {
        this.processFile(fullPath);
      }
    }
  }

  /**
   * Process a single TypeScript file
   */
  private processFile(filePath: string): void {
    if (this.processedFiles.has(filePath)) return;
    this.processedFiles.add(filePath);
    
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let modified = false;
    
    const processedLines = lines.map(line => {
      // Match import statements with relative paths
      const importMatch = line.match(/^(\s*import\s+(?:.*?\s+from\s+)?['"])(\.[^'"]+)(['"].*)/);
      const exportMatch = line.match(/^(\s*export\s+(?:.*?\s+from\s+)?['"])(\.[^'"]+)(['"].*)/);
      const dynamicImportMatch = line.match(/(import\s*\(\s*['"])(\.[^'"]+)(['"].*\))/);
      
      if (importMatch || exportMatch || dynamicImportMatch) {
        const match = importMatch || exportMatch || dynamicImportMatch;
        const [, prefix, importPath, suffix] = match!;
        
        // Check if the import already has an extension
        if (!importPath.endsWith('.js') && !importPath.endsWith('.json') && 
            !importPath.endsWith('.css') && !importPath.endsWith('.scss')) {
          modified = true;
          this.fixCount++;
          return `${prefix}${importPath}.js${suffix}`;
        }
      }
      
      return line;
    });
    
    if (modified) {
      writeFileSync(filePath, processedLines.join('\n'));
      console.log(`✅ Fixed imports in: ${filePath}`);
    }
  }

  /**
   * Execute the fixing process
   */
  execute(srcPath: string): void {
    console.log('🔧 Starting ES Module import fix...\n');
    this.processDirectory(srcPath);
    console.log(`\n✨ Fixed ${this.fixCount} imports in ${this.processedFiles.size} files`);
  }
}

// Execute the fixer
const fixer = new ESModuleImportFixer();
fixer.execute(join(process.cwd(), 'src'));