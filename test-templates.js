const validationUi = require('./bin/src/templates/validationUiHelpers.js');
const autoModule = require('./bin/src/templates/autoFormsBuilderModule.js');

const uiTemplate = validationUi.validationUiHelpersTemplate.getTemplate();
const moduleTemplate = autoModule.autoFormsBuilderModuleTemplate.getTemplate();

console.log('=== Checking validationUiHelpers ===');
console.log('Contains "standalone: true":', uiTemplate.includes('standalone: true'));
console.log('Contains "CommonModule":', uiTemplate.includes('CommonModule'));
console.log('\n=== Checking autoFormsBuilderModule ===');
console.log('Contains "imports:":', moduleTemplate.includes('imports:'));
console.log('Contains "declarations:":', moduleTemplate.includes('declarations:'));

// Show first 1000 chars of each
console.log('\n=== First 1000 chars of validationUiHelpers ===');
console.log(uiTemplate.substring(0, 1000));

console.log('\n=== Chars 800-1400 of autoFormsBuilderModule ===');
console.log(moduleTemplate.substring(800, 1400));
