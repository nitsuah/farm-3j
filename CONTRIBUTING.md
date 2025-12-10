# Contributing to farm-3j

Thank you for your interest in contributing! We welcome contributions from everyone.

## 📋 Table of Contents

- [Contributing to farm-3j](#contributing-to-farm-3j)
  - [📋 Table of Contents](#-table-of-contents)
  - [🤝 Code of Conduct](#-code-of-conduct)
  - [🚀 Getting Started](#-getting-started)
  - [💡 How to Contribute](#-how-to-contribute)
    - [Types of Contributions](#types-of-contributions)
    - [Before You Start](#before-you-start)
  - [🛠️ Development Setup](#️-development-setup)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [🔄 Pull Request Process](#-pull-request-process)
  - [📝 Coding Standards](#-coding-standards)
    - [General Guidelines](#general-guidelines)
    - [Language-Specific Standards](#language-specific-standards)
    - [Testing](#testing)
    - [Documentation](#documentation)
  - [Testing Commands](#testing-commands)
  - [Linting](#linting)
  - [🐛 Reporting Bugs](#-reporting-bugs)
  - [💡 Suggesting Features](#-suggesting-features)
  - [Releases](#releases)
  - [Issues](#issues)
  - [Pull Requests (PRs)](#pull-requests-prs)
  - [Branching](#branching)
  - [Commit Messages](#commit-messages)
  - [🙏 Recognition](#-recognition)
  - [📄 License](#-license)
  - [Prerequisites](#prerequisites-1)
  - [Getting Started](#getting-started)
  - [Available Scripts](#available-scripts)
    - [Development](#development)
    - [Code Quality](#code-quality)
    - [Testing](#testing-1)
  - [Project Structure](#project-structure)
  - [Development Workflow](#development-workflow)
  - [Pre-commit Hooks](#pre-commit-hooks)
  - [Docker](#docker)
    - [Build Docker image](#build-docker-image)
    - [Run Docker container](#run-docker-container)
    - [Docker Compose (optional)](#docker-compose-optional)
  - [Testing Strategy](#testing-strategy)
    - [Writing Tests](#writing-tests)
    - [Test Naming Convention](#test-naming-convention)
  - [Troubleshooting](#troubleshooting)
    - [Port already in use](#port-already-in-use)
    - [Node modules issues](#node-modules-issues)
    - [Type errors](#type-errors)
  - [Resources](#resources)
  - [📧 Questions?](#-questions)

## 🤝 Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [maintainer@email.com]. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/farm-3j.git
   cd farm-3j
   ```

3. **Add the upstream repository**:

   ```bash
   git remote add upstream https://github.com/nitsuah/farm-3j.git
   ```

4. **Create a new branch** for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💡 How to Contribute

### Types of Contributions

- **Bug fixes**: Fix issues or problems in the codebase
- **New features**: Add new functionality or capabilities
- **Documentation**: Improve or add to project documentation
- **Tests**: Add or improve test coverage
- **Performance**: Optimize existing code
- **Refactoring**: Improve code quality without changing functionality

### Before You Start

- Check existing [issues](../../issues) and [pull requests](../../pulls) to avoid duplicate work
- For major changes, please open an issue first to discuss what you would like to change
- Make sure your code follows the project's coding standards

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev
```

## 🔄 Pull Request Process

1. **Update your branch** with the latest upstream changes:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes** following the coding standards

3. **Test your changes** thoroughly:

   - Run all existing tests
   - Add new tests for new features
   - Ensure all tests pass
   - Check code coverage

4. **Commit your changes** with clear, descriptive messages:

   ```bash
   git commit -m "feat: add new feature description"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):

   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for adding or updating tests
   - `refactor:` for code refactoring
   - `chore:` for maintenance tasks

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub:

   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots/videos for UI changes
   - Ensure CI checks pass

7. **Respond to feedback** from maintainers and update as needed

## 📝 Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow the existing code style and conventions
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable and function names

### Language-Specific Standards

- **TypeScript**:
  - Use TypeScript for type safety
  - Follow ESLint rules
  - Use async/await over promises when possible
  - Prefer functional programming patterns

### Testing

- Write unit tests for new functions
- Write integration tests for new features
- Aim for >80% code coverage
- Test edge cases and error conditions

### Documentation

- Update README.md for new features
- Add JSDoc comments for public APIs
- Update CHANGELOG.md for notable changes
- Include inline comments for complex logic

## Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Ensure tests pass before submitting a PR.

## Linting

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

Run linters and formatters before submitting a PR.

## 🐛 Reporting Bugs

When reporting bugs, please include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots or error messages** if applicable
- **Environment details**: OS, browser, version numbers, etc.
- **Possible solution** if you have one

Use the [bug report template](../../issues/new?template=bug_report.md) if available.

## 💡 Suggesting Features

When suggesting features, please include:

- **Clear title and description**
- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've thought about
- **Additional context**: Screenshots, mockups, examples

Use the [feature request template](../../issues/new?template=feature_request.md) if available.

## Releases

Releases are managed by the core team.

## Issues

Use issues to report bugs, suggest features, or ask questions.

## Pull Requests (PRs)

All code changes should be submitted via pull requests. Ensure your PR:

- Has a clear title and description.
- Addresses a specific issue or feature.
- Includes tests.
- Passes all CI checks.
- Is reviewed by at least one maintainer.

## Branching

Use feature branches for all contributions. Branch names should be descriptive and follow the format `feature/your-feature-name` or `fix/your-bug-fix`.

## Commit Messages

Follow the Conventional Commits specification. This helps automate release notes and versioning.

## 🙏 Recognition

Contributors will be recognized in:

- The project README
- Release notes for significant contributions
- The [CONTRIBUTORS](CONTRIBUTORS.md) file (if applicable)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

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

```bash
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

```bash
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

## 📧 Questions?

If you have questions, feel free to:

- Open an issue with the `question` label
- Contact the maintainers at [contact@email.com]

Thank you for contributing! 🎉
