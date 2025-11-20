#!/bin/bash
# Auto-fix TypeScript lint errors

echo "Fixing TypeScript lint errors..."

# Install eslint with auto-fix if not installed
if ! command -v eslint &> /dev/null; then
    echo "Installing ESLint..."
    npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
fi

# Run ESLint with auto-fix
echo "Running ESLint auto-fix..."
npx eslint src --ext .ts,.tsx --fix || true

# Or use TypeScript compiler to show errors without failing
echo "Checking TypeScript errors..."
npx tsc --noEmit || echo "Some TypeScript errors remain, but they won't block build"

echo "Done! Unused imports should be removed."
