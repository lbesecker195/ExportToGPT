#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const IGNORED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.cache',
  '.next',
  '.nuxt',
  '.vercel',
  '.firebase',
  'coverage',
  '.parcel-cache',
  '.expo',
  '.env',
  'tmp',
  'temp',
  'docs',
  'logs',
  'public',
  'static'
];

const IGNORED_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', // Image files
  '.css', '.scss', '.less', '.sass' // Stylesheets
];

const TEMPLATE_EXTENSIONS = [
  '.ejs', '.pug', '.hbs', '.handlebars', // Common template files
  '.html' // If using embedded HTML templates
];

const FRAMEWORKS = {
  EXPRESS: 'express',
  REACT: 'react',
  VUE: 'vue',
  ANGULAR: 'angular',
  KOA: 'koa',
  NEST: 'nestjs',
};

function detectFramework(projectDir) {
  if (fs.existsSync(path.join(projectDir, 'angular.json'))) return FRAMEWORKS.ANGULAR;
  if (fs.existsSync(path.join(projectDir, 'vue.config.js'))) return FRAMEWORKS.VUE;
  if (fs.existsSync(path.join(projectDir, 'package.json'))) {
    const packageJson = require(path.join(projectDir, 'package.json'));
    if (packageJson.dependencies['express']) return FRAMEWORKS.EXPRESS;
    if (packageJson.dependencies['koa']) return FRAMEWORKS.KOA;
    if (packageJson.dependencies['@nestjs/core']) return FRAMEWORKS.NEST;
    if (packageJson.dependencies['react']) return FRAMEWORKS.REACT;
  }
  return null;
}

function getRelevantFiles(framework, entryFile, projectDir, seen = new Set()) {
  let relevantFiles = new Set();

  if (framework === FRAMEWORKS.EXPRESS) {
    const entryPoints = ['app.js', 'server.js'];
    entryPoints.forEach(entry => {
      const fullPath = path.join(projectDir, entry);
      if (fs.existsSync(fullPath)) relevantFiles.add(fullPath);
    });

    const routes = glob.sync(path.join(projectDir, 'routes/**/*.js'));
    const controllers = glob.sync(path.join(projectDir, 'controllers/**/*.js'));
    const models = glob.sync(path.join(projectDir, 'models/**/*.js'));
    const views = glob.sync(path.join(projectDir, `views/**/*{${TEMPLATE_EXTENSIONS.join(',')}}`));

    routes.forEach(file => relevantFiles.add(file));
    controllers.forEach(file => relevantFiles.add(file));
    models.forEach(file => relevantFiles.add(file));
    views.forEach(file => relevantFiles.add(file));
  } else if (framework === FRAMEWORKS.REACT) {
    const components = glob.sync(path.join(projectDir, 'src/components/**/*.{js,jsx,tsx}'));
    const hooks = glob.sync(path.join(projectDir, 'src/hooks/**/*.{js,jsx,tsx}'));
    const redux = glob.sync(path.join(projectDir, 'src/redux/**/*.{js,jsx,tsx}'));
    // Styles are ignored here based on requirement
    // const styles = glob.sync(path.join(projectDir, 'src/styles/**/*.{css,scss}'));

    components.forEach(file => relevantFiles.add(file));
    hooks.forEach(file => relevantFiles.add(file));
    redux.forEach(file => relevantFiles.add(file));
    // styles.forEach(file => relevantFiles.add(file));
  } else if (framework === FRAMEWORKS.VUE) {
    const components = glob.sync(path.join(projectDir, 'src/components/**/*.vue'));
    const store = glob.sync(path.join(projectDir, 'src/store/**/*.js'));
    const mixins = glob.sync(path.join(projectDir, 'src/mixins/**/*.js'));
    // Styles are ignored here based on requirement
    // const styles = glob.sync(path.join(projectDir, 'src/assets/**/*.{css,scss}'));

    components.forEach(file => relevantFiles.add(file));
    store.forEach(file => relevantFiles.add(file));
    mixins.forEach(file => relevantFiles.add(file));
    // styles.forEach(file => relevantFiles.add(file));
  } else if (framework === FRAMEWORKS.ANGULAR) {
    const components = glob.sync(path.join(projectDir, 'src/app/**/*.{ts,html}'));
    const services = glob.sync(path.join(projectDir, 'src/app/services/**/*.ts'));
    const store = glob.sync(path.join(projectDir, 'src/app/store/**/*.ts'));
    // Styles are ignored here based on requirement
    // const styles = glob.sync(path.join(projectDir, 'src/styles/**/*.{css,scss}'));

    components.forEach(file => relevantFiles.add(file));
    services.forEach(file => relevantFiles.add(file));
    store.forEach(file => relevantFiles.add(file));
    // styles.forEach(file => relevantFiles.add(file));
  } else {
    const jsRelevantFiles = glob.sync(path.join(projectDir, `**/*.js`), {
      ignore: IGNORED_DIRS.map(dir => `${dir}/**`)
    });

    jsRelevantFiles.forEach(file => relevantFiles.add(file));
  }

  relevantFiles.add(entryFile);
  getDependencies(entryFile, projectDir, seen, relevantFiles);
  return Array.from(relevantFiles).filter(file => !IGNORED_EXTENSIONS.some(ext => file.endsWith(ext)));
}

function getDependencies(filePath, projectDir, seen, relevantFiles) {
  if (seen.has(filePath)) return;

  seen.add(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const dir = path.dirname(filePath);
  
  const requireMatches = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
  const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
  const includeMatches = content.match(/include\s+['"]([^'"]+)['"]/g) || [];
  
  [...requireMatches, ...importMatches, ...includeMatches].forEach(match => {
    const matchedPath = match.match(/['"]([^'"]+)['"]/)[1];

    let resolvedPath;

    if (!path.isAbsolute(matchedPath)) {
      resolvedPath = path.resolve(dir, matchedPath);
      if (!fs.existsSync(resolvedPath) && fs.existsSync(resolvedPath + '.js')) {
        resolvedPath += '.js';
      } else if (!fs.existsSync(resolvedPath) && fs.existsSync(resolvedPath + '.json')) {
        resolvedPath += '.json';
      } else if (!fs.existsSync(resolvedPath) && fs.existsSync(resolvedPath + '.hbs')) {
        resolvedPath += '.hbs';
      }
      TEMPLATE_EXTENSIONS.forEach(templateExt => {
        if (!fs.existsSync(resolvedPath) && fs.existsSync(resolvedPath + templateExt)) {
          resolvedPath += templateExt;
        }
      });
    } else {
      resolvedPath = matchedPath;
    }

    if (fs.existsSync(resolvedPath) && !IGNORED_DIRS.some(ignoreDir => resolvedPath.includes(ignoreDir))) {
      relevantFiles.add(resolvedPath);
      getDependencies(resolvedPath, projectDir, seen, relevantFiles);
    }
  });
}

function getDirectoryStructure(dir) {
  const structure = {};

  function readDir(currentDir, parentStructure) {
    const items = fs.readdirSync(currentDir);
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const relativePath = path.relative(dir, fullPath);
      const stat = fs.lstatSync(fullPath);
  
      if (IGNORED_DIRS.some(ignoreDir => relativePath.startsWith(ignoreDir))) {
        return;
      }

      if (stat.isDirectory()) {
        parentStructure[item] = {};
        readDir(fullPath, parentStructure[item]);
      } else {
        if (!IGNORED_EXTENSIONS.some(ext => item.endsWith(ext))) {
          parentStructure[item] = 'file';
        }
      }
    });
  }

  readDir(dir, structure);
  return structure;
}

function outputResults(dir, relevantFiles, entryFile) {
  console.log('Directory Structure:');
  console.log(JSON.stringify(getDirectoryStructure(dir), null, 2));
  
  const filesToOutput = relevantFiles.length > 5 ? [entryFile, ...relevantFiles, entryFile] : relevantFiles;
  
  filesToOutput.forEach(file => {
    console.log(`\nFile: ${file}`);
    console.log('----------------------');
    console.log(fs.readFileSync(file, 'utf-8'));
    console.log('----------------------');
  });

  console.log("\n\n")
}

function main() {
  const [projectDirInput, inputFile] = process.argv.slice(2);
  if (!projectDirInput || !inputFile) {
    console.error('Usage: node <script> <project_directory> <filename>');
    process.exit(1);
  }

  const projectDir = path.resolve(projectDirInput);
  const absInputFile = path.resolve(projectDir, inputFile);
  const framework = detectFramework(projectDir);
  const relevantFiles = getRelevantFiles(framework, absInputFile, projectDir);

  console.log(`\n\n\nSYSTEM:\nYou are a Senior Node.js Software Engineer. Please use the following directory structure and provided project files to respond about the '${inputFile}' file.  Also, please try to keep the programming style and structure similar to the provided file(s).\n\n`);
  
  outputResults(projectDir, relevantFiles, absInputFile);
}

main();