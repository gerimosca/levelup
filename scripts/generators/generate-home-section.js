#!/usr/bin/env node

/**
 * Generator for new home page sections
 * Creates a new admin-ready section with all required files
 * Usage: npm run generate:home-section [section-name]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get section name from command line
const sectionName = process.argv[2];

if (!sectionName) {
  console.error('❌ Please provide a section name');
  console.log('Usage: npm run generate:home-section [section-name]');
  console.log('Example: npm run generate:home-section testimonials');
  process.exit(1);
}

// Convert kebab-case to different formats
const kebabCase = sectionName.toLowerCase().replace(/\s+/g, '-');
const camelCase = kebabCase.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
const titleCase = kebabCase.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

console.log(`\n🚀 Generating home section: ${titleCase}`);

// Paths
const basePath = path.join(process.cwd(), 'src/core/features/home');
const typesPath = path.join(basePath, 'types/sections.ts');
const configPath = path.join(basePath, 'config/content.ts');
const componentPath = path.join(basePath, `components/sections/${kebabCase}-section.tsx`);
const indexPath = path.join(basePath, 'index.ts');

// 1. Create the component file
const componentContent = `import { SectionWrapper } from '../base/section-wrapper';
import type { ${pascalCase}Content } from '../../types/sections';

interface ${pascalCase}SectionProps {
  content: ${pascalCase}Content;
  locale: string;
  variant?: 'A' | 'B';
}

/**
 * ${titleCase} Section Component
 * Admin-ready with full content externalization
 */
export function ${pascalCase}Section({
  content,
  locale,
  variant = 'A'
}: ${pascalCase}SectionProps) {
  // Get localized text with fallback
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline ? getLocalizedText(content.subheadline) : null;

  return (
    <SectionWrapper
      sectionKey="${kebabCase}"
      variant={variant}
      className="py-16 md:py-24"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2
            data-editable-field="headline"
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            {headline}
          </h2>

          {subheadline && (
            <p
              data-editable-field="subheadline"
              className="text-lg text-muted-foreground"
            >
              {subheadline}
            </p>
          )}
        </div>

        {/* Section Content */}
        <div data-editable-field="content">
          {/* TODO: Implement your section content here */}
          <p className="text-center text-muted-foreground">
            ${titleCase} content goes here
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}`;

fs.writeFileSync(componentPath, componentContent);
console.log(`✅ Created component: ${componentPath}`);

// 2. Add type definition (append to existing file)
const typeDefinition = `
// ${titleCase} Section
export interface ${pascalCase}Content {
  headline: Record<string, string>;
  subheadline?: Record<string, string>;
  // TODO: Add your specific content fields here
  items?: Array<{
    id: string;
    title: Record<string, string>;
    description: Record<string, string>;
  }>;
}
`;

// Read existing types file
let typesContent = fs.readFileSync(typesPath, 'utf8');

// Check if type already exists
if (typesContent.includes(`${pascalCase}Content`)) {
  console.log(`⚠️  Type ${pascalCase}Content already exists in types file`);
} else {
  // Add before the closing of HomePageContent interface
  const insertPosition = typesContent.lastIndexOf('// Complete Home Content');
  if (insertPosition !== -1) {
    typesContent = typesContent.slice(0, insertPosition) + typeDefinition + '\n' + typesContent.slice(insertPosition);
    fs.writeFileSync(typesPath, typesContent);
    console.log(`✅ Added type definition to: ${typesPath}`);
  } else {
    console.log(`⚠️  Could not find insertion point in types file. Please add manually.`);
  }
}

// 3. Add to HomePageContent interface
typesContent = fs.readFileSync(typesPath, 'utf8');
const homePageContentRegex = /export interface HomePageContent \{([^}]+)\}/;
const match = typesContent.match(homePageContentRegex);

if (match && !match[1].includes(camelCase)) {
  const newField = `  ${camelCase}?: SectionContent<${pascalCase}Content>;\n`;
  const updatedInterface = match[0].replace('}', newField + '}');
  typesContent = typesContent.replace(homePageContentRegex, updatedInterface);
  fs.writeFileSync(typesPath, typesContent);
  console.log(`✅ Added to HomePageContent interface`);
}

// 4. Add content configuration
const contentAddition = `
  ${camelCase}: {
    id: '${kebabCase}',
    enabled: false, // Set to true when ready
    order: 10, // Adjust order as needed
    content: {
      headline: {
        en: '${titleCase}',
        es: '${titleCase}' // TODO: Translate
      },
      subheadline: {
        en: 'Subheadline for ${titleCase}',
        es: 'Subtítulo para ${titleCase}' // TODO: Translate
      },
      // TODO: Add your content here
      items: []
    } as any // Remove 'as any' after implementing the type
  },`;

// Read config file
let configContent = fs.readFileSync(configPath, 'utf8');

// Check if already exists
if (configContent.includes(`${camelCase}:`)) {
  console.log(`⚠️  Section ${camelCase} already exists in config`);
} else {
  // Find the closing of homeContent object
  const lastSectionRegex = /cta:\s*\{[^}]+\}[^}]+\}[^}]+\}/;
  const lastMatch = configContent.match(lastSectionRegex);

  if (lastMatch) {
    const insertPos = configContent.indexOf(lastMatch[0]) + lastMatch[0].length;
    configContent = configContent.slice(0, insertPos) + ',' + contentAddition + configContent.slice(insertPos);
    fs.writeFileSync(configPath, configContent);
    console.log(`✅ Added content configuration to: ${configPath}`);
  } else {
    console.log(`⚠️  Could not find insertion point in config. Please add manually.`);
  }
}

// 5. Add export to index file
let indexContent = fs.readFileSync(indexPath, 'utf8');

if (!indexContent.includes(`${pascalCase}Section`)) {
  // Find the components section
  const componentsSection = indexContent.indexOf('// Components');
  if (componentsSection !== -1) {
    const newExport = `export { ${pascalCase}Section } from './components/sections/${kebabCase}-section';\n`;
    const lines = indexContent.split('\n');
    let insertLine = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('// Components')) {
        // Find the last export after this comment
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].includes('export {') && lines[j].includes('Section')) {
            insertLine = j + 1;
          } else if (lines[j].trim() === '' || !lines[j].includes('export {')) {
            break;
          }
        }
        break;
      }
    }

    if (insertLine > 0) {
      lines.splice(insertLine, 0, newExport.trim());
      indexContent = lines.join('\n');
      fs.writeFileSync(indexPath, indexContent);
      console.log(`✅ Added export to index.ts`);
    }
  }
}

// 6. Instructions for the developer
console.log(`
✨ Section "${titleCase}" has been created!

📝 Next steps:
1. Implement the content structure in:
   ${typesPath}

2. Add your section content in:
   ${configPath}

3. Build your component UI in:
   ${componentPath}

4. Add the section to your page:
   import { ${pascalCase}Section } from '@/features/home';

   <${pascalCase}Section
     content={homeContent.${camelCase}.content}
     locale={locale}
   />

5. Set enabled: true in config when ready to show

💡 Remember:
- Keep all text in the content configuration
- Use data-editable-field attributes
- Support multiple languages from day 1
`);

// Run type check
console.log('\n🔍 Running type check...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Type check failed. Please fix any TypeScript errors.');
}