# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2024-01-15

### Added
- LICENSE file (MIT License)
- AI multi-provider support (Zhipu, Wenxin, Tongyi, Kimi, DeepSeek)
- Vercel deployment configuration
- GitHub Actions CI/CD pipeline
- Prettier and EditorConfig for code consistency
- Comprehensive documentation updates

### Fixed
- Resolved all ESLint warnings (5 warnings fixed)
- Fixed useEffect missing dependency in editor page
- Added proper eslint-disable comments for dynamic base64 images

### Improved
- Enhanced API route to support dynamic provider selection
- Better error messages for invalid provider requests
- Added provider name in API response for client-side tracking

## [0.1.0] - 2024-01-01

### Added
- Initial release of ZeroHeart Resume Builder
- Next.js 14 with App Router
- TypeScript support
- Real-time resume editing and preview
- PDF export functionality (A4, multi-page support)
- AI-powered content generation (Zhipu AI)
- Local storage for data persistence
- Responsive design for mobile and desktop
- Multiple resume templates (Simple, Modern, Classic, Creative)
- Photo upload and cropping functionality
- Module-based editing system

### Security
- API key protection via server-side proxy
- Input validation and sanitization
- File path traversal prevention
- Request body size limiting (5MB)

### Testing
- Vitest integration with 88 test cases
- Coverage reporting support
- Storage, security, and utility testing
