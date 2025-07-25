# Tower Defense Game

## About
Tower Defense is a browser-based game where players build towers to defend against waves of enemies. Built with TypeScript and Phaser.js.

## Getting Started
1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run start
```

3. Open in browser:
```
http://localhost:1234
```

## Building
For production build:
```bash
npm run build
```

## Testing
### Linters
```bash
npm run lint
```

### Unit Tests (Jest)
```bash
npm test
```

### E2E Tests (Playwright)
```bash
npx playwright test
```

## License
This project is licensed under MIT License. See [LICENSE](LICENSE) for details.

## CI/CD
GitHub Actions automatically runs:
- Linters
- Unit tests
- E2E tests

on every push and pull request.
