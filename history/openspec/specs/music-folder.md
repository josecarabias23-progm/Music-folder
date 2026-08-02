# Music Folder - Project Specification

## Overview

**Music Folder** is a comprehensive web platform designed for musicians, conductors, and music organizations to collaborate, share resources, and manage their musical journey.

The platform serves three user types:
- **Individual Musicians**: Practicing and learning
- **Conductors & Directors**: Managing orchestras and rehearsals  
- **Music Communities**: Sharing knowledge and organizing groups

### Core Value Proposition
One unified place for musicians to organize their sheet music library, track rehearsal progress, learn about instruments, and connect with other musicians through community forums.

---

## Main Features

### 1. Score Management (Partituras)
Upload, organize, and share sheet music in PDF or image format.
- **Actions**: Upload, download, organize by instrument/difficulty
- **Organization**: By composer, key signature, difficulty level
- **Access Control**: Public sharing or organization-restricted
- **Metadata**: Key signature, time signature, duration, instrument role

### 2. Rehearsal Logs (Registros Musicales)
Document practice sessions and group rehearsals with notes and audio references.
- **Actions**: Create rehearsal entry, track attendance, add focus areas
- **Features**: Audio reference uploads, participant tracking, next session notes
- **Reports**: Attendance tracking, progress notes

### 3. Instruments Encyclopedia
Educational information about musical instruments.
- **Content**: Range, transposition, techniques, maintenance tips, history
- **Features**: Transposition calculator, repertoire suggestions
- **Access**: Public read-only for all users

### 4. Community Forum
Discussion platform for music-related topics.
- **Topics**: Technique, maintenance, composition, concerts, general
- **Features**: Threaded comments, markdown support, likes/reactions
- **Moderation**: Pin/lock discussions, moderate content

### 5. Organizations (Bands/Orchestras)
Create and manage team-based music groups.
- **Features**: Member management, role-based permissions, shared libraries
- **Access Control**: Organization-scoped resources (scores, rehearsals)

---

## Functional Goals

1. ✅ **Score Management**: Allow users to upload, organize, and share sheet music efficiently
2. ✅ **Rehearsal Tracking**: Enable directors to document rehearsals and track progress
3. ✅ **Instrument Learning**: Provide comprehensive, searchable instrument information
4. ✅ **Community Engagement**: Facilitate discussions and knowledge sharing
5. ✅ **Team Collaboration**: Support orchestras and bands with group management

---

## Non-Goals (Phase 1 MVP)

- ❌ Real-time audio/video streaming
- ❌ Payment processing or subscriptions
- ❌ Full social media features (following, direct messaging)
- ❌ Mobile apps (web-first approach)
- ❌ AI-powered composition or arrangement tools
- ❌ Integration with notation software (Phase 2+)

---

## User Stories

### Musician
- **As a musician**, I want to upload PDF scores to organize my personal practice library
- **As a musician**, I want to filter scores by instrument and difficulty to find appropriate materials
- **As a musician**, I want to download scores for offline access
- **As a musician**, I want to join a band and access shared rehearsal scores
- **As a musician**, I want to see my rehearsal attendance history

### Conductor/Director
- **As a conductor**, I want to create rehearsal logs after each session with notes and focus areas
- **As a conductor**, I want to track which musicians attended rehearsals
- **As a conductor**, I want to organize scores by the pieces we're working on
- **As a conductor**, I want to upload audio references for pieces we're learning
- **As a conductor**, I want to manage my orchestra's member list and permissions

### Student/Learner
- **As a learner**, I want to browse instrument information (range, transposition, techniques)
- **As a learner**, I want to understand transpositions for different instruments
- **As a learner**, I want to read about maintenance and care for various instruments
- **As a learner**, I want to follow instrument-specific forum discussions
- **As a learner**, I want to see example pieces for different instruments

### Community Member
- **As a forum user**, I want to post questions about technique and maintenance
- **As a forum user**, I want to see helpful responses from experienced musicians
- **As a forum user**, I want to organize concert details with other musicians
- **As a forum user**, I want to mark helpful answers with likes

---

## User Roles & Permissions

### Role: Guest (Unauthenticated)
- View public scores
- Browse instruments
- Read forum discussions
- Cannot upload, comment, or create organizations

### Role: Musician (Authenticated)
- Upload personal scores
- Create/join organizations
- Participate in forums
- Create rehearsal logs (personal or organization)
- View shared organization resources

### Role: Conductor (Authenticated, elevated)
- All Musician permissions
- Invite members to organizations
- Manage organization scores
- Track rehearsal attendance
- Access organization analytics

### Role: Admin (System)
- Manage all instruments database
- Moderate forum discussions (pin/lock threads)
- Create system-wide announcements
- Access platform statistics
- Manage user accounts

---

## Target Users by Use Case

### Individual Musician
- **Primary Goal**: Organize personal music practice
- **Pain Point**: Currently uses folders, email, cloud storage separately
- **Value**: Centralized music library + community

### Orchestra/Band Director
- **Primary Goal**: Manage ensemble, track progress
- **Pain Point**: Using email, spreadsheets, scattered files
- **Value**: Organized rehearsal system + team coordination

### Student Musician
- **Primary Goal**: Learn instrument information
- **Pain Point**: Information scattered across multiple websites
- **Value**: Unified instrument reference + community Q&A

### Music Teacher
- **Primary Goal**: Share materials with students
- **Pain Point**: Email attachments, outdated repositories
- **Value**: Organized sharing + student access tracking

---

## Success Metrics (MVP)

### Adoption
- 100+ registered users by Month 3
- 50+ active monthly users by Month 6
- 30+ pieces of sheet music uploaded by Month 3

### Engagement
- Average session duration: 10+ minutes
- Forum discussions: 20+ threads by Month 3
- 70%+ of conductors tracking rehearsals

### Quality
- Uptime: 99.5%
- API response time: <200ms (p95)
- User satisfaction: 4.0+ stars (if reviewed)

---

## Specification Documents

This specification is implemented across multiple markdown documents:

1. **Data Models** (`data-models.md`)
   - Entity definitions with attributes and relationships
   - Database schema architecture

2. **API Endpoints** (`api-endpoints.md`)
   - RESTful endpoint specifications
   - Request/response formats
   - Pagination and filtering

3. **Architecture** (`architecture.md`)
   - Backend module structure (NestJS)
   - Frontend component structure (React)
   - System design and flows

4. **Tech Stack** (`tech-stack.md`)
   - Technology selections and justifications
   - Dependencies and versions
   - Deployment options

5. **File Structure** (`file-structure.md`)
   - Directory organization
   - File naming conventions
   - Project growth guidelines

6. **Implementation Changes** (`../changes/`)
   - Phase-based feature rollouts
   - Integration roadmap

---

## Implementation Roadmap

### Phase 1: Core API & Basic UI (Weeks 1-8)
- REST API for all core entities
- Basic React UI for scores, instruments, forums
- User authentication
- Organization basic features

### Phase 2: Enhanced UI & Team Features (Weeks 9-16)
- Polished responsive UI
- Advanced organization management
- Rehearsal tracking enhancements
- Attendance reporting

### Phase 3: Scalability & Community (Weeks 17-24)
- Performance optimization
- Advanced search and filtering
- Notifications and alerts
- Analytics dashboard
- Public beta launch

---

## Integration Points (Future Phases)

- **Notation Software**: Import from Sibelius, MuseScore, Finale
- **Calendar**: Sync rehearsal dates with Google Calendar, Outlook
- **Email**: Notifications for rehearsal changes, forum replies
- **Storage**: Direct integration with Google Drive, Dropbox
- **Analytics**: Performance tracking and learning curves

---

## Related Documents

- [Change: Complete Initial Specification](../changes/002-complete-initial-spec.md)
- [OpenSpec Configuration](../config.yaml)
- [Architecture Decision Records](../decisions/)
