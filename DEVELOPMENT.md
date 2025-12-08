# Development Guide

## Prerequisites

- Node.js 20+
- pnpm 9+
- Git

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/nitsuah/farm-3j.git
   cd farm-3j
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your configuration values.

4. **Run the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

### Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm type-check` - Run TypeScript type checking

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Testing

- `pnpm test` - Run tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage report

## Project Structure

```
farm-3j/
├── app/                  # Next.js App Router pages
├── components/          # React components
│   └── ui/             # UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── scripts/            # Build and utility scripts
└── styles/             # Global styles
```

## Development Workflow

1. **Create a new branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following the project conventions
   - Add tests for new functionality
   - Update documentation as needed

3. **Run tests and linting**

   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/) format.

5. **Push and create a pull request**

   ```bash
   git push origin feature/your-feature-name
   ```

## Pre-commit Hooks

This project uses pre-commit hooks to ensure code quality:

1. **Install pre-commit** (if not already installed)

   ```bash
   pip install pre-commit
   # or
   brew install pre-commit
   ```

2. **Install the hooks**

   ```bash
   pre-commit install
   ```

Now the hooks will run automatically on `git commit`.

## Docker

### Build Docker image

```bash
docker build -t farm-3j .
```

### Run Docker container

```bash
docker run -p 3000:3000 farm-3j
```

### Docker Compose (optional)

```bash
docker-compose up
```

## Testing Strategy

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **Coverage**: Aim for >60% coverage (target: 80%)

### Writing Tests

Place test files next to the code they test:

```
components/
  ui/
    button.tsx
    button.test.tsx  # Test file
```

### Test Naming Convention

```typescript
describe('ComponentName', () => {
  it('does something specific', () => {
    // test code
  });
});
```

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# or on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Node modules issues

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Type errors

```bash
pnpm type-check
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
