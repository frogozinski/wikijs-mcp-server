# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.0.0] - 2025-11-05

### Added
- Add path-based page identification to update, delete, and move tools
- Initial Wiki.js MCP Server implementation

### Changed
- fixed verion in package.json
- Reset CHANGELOG.md for fresh start
- Add support/donation section to README
- Minimize README and reference Wiki.js documentation
- Change WIKIJS_API_URL to a customizable placeholder
- Remove local release script in favor of master script
- Add release automation script
- Update installation and troubleshooting with correct paths

### Fixed
- Require tags parameter in update to work around Wiki.js API bug
- Remove tags field from single page queries
- Fix tags mapping in get-page tool
- Only pass defined parameters to updatePage
- Handle undefined values in updatePage variable definitions
- Add required isPrivate field to page creation
- Correct GraphQL tags field structure
- Load .env from deployment directory

### Added
- Nothing yet

### Changed
- Nothing yet

### Deprecated
- Nothing yet

### Removed
- Nothing yet

### Fixed
- Nothing yet

### Security
- Nothing yet

---

[Unreleased]: https://github.com/markus-michalski/wikijs-mcp-server/compare/v1.0.0...HEAD
