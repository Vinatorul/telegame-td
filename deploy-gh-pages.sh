#!/bin/bash

if [ ! -f "package.json" ]; then
  echo "Error: script must be run from project root directory"
  exit 1
fi

echo "Installing dependencies..."
npm install || {
  echo "Failed to install dependencies"
  exit 1
}

echo "Building project..."
npm run build || {
  echo "Build failed"
  exit 1
}

TEMP_DIR="../gh-pages-temp"
echo "Creating temp directory: $TEMP_DIR"
mkdir -p "$TEMP_DIR" || {
  echo "Failed to create temp directory"
  exit 1
}

echo "Copying build files..."
cp dist/index.html "$TEMP_DIR/" || {
  echo "Failed to copy index.html"
  exit 1
}

JS_FILE=$(grep -o 'src=[^ ]*telegame-td\.[^ ]*\.js' dist/index.html | cut -d= -f2)
if [ -z "$JS_FILE" ]; then
  echo "Error: Could not find local JS file reference in index.html"
  exit 1
fi

JS_PATH="dist/$JS_FILE"
MAP_PATH="$JS_PATH.map"

if [ ! -f "$JS_PATH" ]; then
  echo "Error: JS file $JS_PATH not found"
  exit 1
fi

cp "$JS_PATH" "$TEMP_DIR/" || {
  echo "Failed to copy JS file"
  exit 1
}

if [ -f "$MAP_PATH" ]; then
  cp "$MAP_PATH" "$TEMP_DIR/" || {
    echo "Failed to copy source map"
    exit 1
  }
fi

echo "Switching to gh-pages branch..."
if git show-ref --quiet refs/heads/gh-pages; then
  git switch gh-pages || {
    echo "Failed to switch to existing gh-pages branch"
    exit 1
  }
else
  git switch --orphan gh-pages || {
    echo "Failed to create gh-pages branch"
    exit 1
  }
fi

echo "Cleaning branch..."
git rm -rf . > /dev/null 2>&1 || true

echo "Moving files..."
cp -r "$TEMP_DIR"/* . || {
  echo "Failed to move files"
  exit 1
}

echo "Cleaning up..."
rm -rf "$TEMP_DIR"

echo "Committing changes..."
git add index.html telegame-td.*.js telegame-td.*.js.map || {
  echo "Failed to add files"
  exit 1
}
git commit -m "Deploy to GitHub Pages (auto)" || {
  echo "Failed to commit"
  exit 1
}

echo "Pushing to origin..."
git push origin gh-pages || {
  echo "Failed to push"
  exit 1
}

echo "Switching back to original branch..."
git checkout - || {
  echo "Failed to switch back"
  exit 1
}

echo "Deployment completed successfully!"
