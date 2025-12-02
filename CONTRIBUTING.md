# Contributing to farm-3j

Thank you for your interest in contributing! We welcome contributions from everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Linting](#linting)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Releases](#releases)
- [Issues](#issues)
- [Pull Requests (PRs)](#pull-requests-prs)
- [Branching](#branching)
- [Commit Messages](#commit-messages)

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

## Testing

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

## 📧 Questions?

If you have questions, feel free to:

- Open an issue with the `question` label
- Join our [community chat/forum] (TODO: ADD_LINK)
- Contact the maintainers at [contact@email.com]

Thank you for contributing! 🎉