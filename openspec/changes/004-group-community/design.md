# Technical Design: Groups, Shared Library & Community

## Architecture Overview
The feature will be implemented as a dedicated group domain in the backend and a corresponding UI section in the frontend.

### Backend Modules
- `groups/` module for group lifecycle and member management
- `group-library/` module for shared files and resources
- `rehearsals/` module for group rehearsal planning
- `community/` module for group discussion and public threads
- `notifications/` module for announcements and updates

### Frontend Areas
- Group dashboard
- Group roster and member management
- Shared library view
- Rehearsal list and detail panel
- Community feed and announcement center

---

## Entity Model

### Group
- id: UUID
- name: string
- description: text
- type: enum [ensemble, course, community, studio]
- visibility: enum [private, invite_only, public]
- owner_id: UUID
- join_code: string
- is_join_code_active: boolean
- created_at: timestamp
- updated_at: timestamp

### GroupMember
- id: UUID
- group_id: UUID
- user_id: UUID
- role: enum [director, instructor, student, accompanist, guest]
- status: enum [pending, active, blocked]
- joined_at: timestamp

### GroupLibraryItem
- id: UUID
- group_id: UUID
- title: string
- description: text
- type: enum [score, pdf, audio, note, reference]
- file_url: string
- uploaded_by: UUID
- created_at: timestamp

### RehearsalSession
- id: UUID
- group_id: UUID
- title: string
- date: date
- time: time
- location: string
- agenda: text
- notes: text
- created_by: UUID
- created_at: timestamp

### AttendanceRecord
- id: UUID
- rehearsal_id: UUID
- user_id: UUID
- status: enum [present, absent, late, excused]
- notes: text
- updated_at: timestamp

### GroupMessage
- id: UUID
- group_id: UUID
- sender_id: UUID
- message: text
- reply_to_id: UUID nullable
- created_at: timestamp

### CommunityPost
- id: UUID
- group_id: UUID
- author_id: UUID
- title: string
- content: text
- visibility: enum [group, public]
- created_at: timestamp

---

## Role Model

### Director
- Create groups
- Invite members
- Manage roster and statuses
- Publish announcements
- Schedule rehearsals
- Manage library permissions

### Student / Member
- View group details and resources
- Access rehearsal information
- Participate in communication threads
- Upload files if granted

### Guest
- Can view publicly available community posts
- Cannot access private group material without invitation

---

## Group Workflow

1. Director creates a group and receives a unique join code.
2. Director shares the code with students or members.
3. Student enters the code in the join flow and becomes a member if valid.
4. Director invites users or approves requests.
5. Members are assigned roles and statuses.
6. The group library is created and populated.
7. Rehearsals are scheduled by date and agenda.
8. Members communicate through group chat or discussions.
9. Community discussions support broader learning and announcements.

---

## API Design

### Group endpoints
- `POST /api/v1/groups`
- `GET /api/v1/groups/:id`
- `PATCH /api/v1/groups/:id`
- `POST /api/v1/groups/join` with body `{ code: string }`
- `POST /api/v1/groups/:id/members`
- `PATCH /api/v1/groups/:id/members/:memberId`

### Group library endpoints
- `POST /api/v1/groups/:id/library`
- `GET /api/v1/groups/:id/library`
- `DELETE /api/v1/groups/:id/library/:itemId`

### Rehearsal endpoints
- `POST /api/v1/groups/:id/rehearsals`
- `GET /api/v1/groups/:id/rehearsals`
- `PATCH /api/v1/groups/:id/rehearsals/:rehearsalId`
- `POST /api/v1/rehearsals/:id/attendance`

### Communication endpoints
- `POST /api/v1/groups/:id/messages`
- `GET /api/v1/groups/:id/messages`
- `POST /api/v1/groups/:id/posts`
- `GET /api/v1/groups/:id/posts`

---

## Permissions Rules

- Director actions are allowed only to group owners or managers.
- Group members can read group resources and participate in communications.
- Public community posts are visible to users outside the group if group visibility permits.
- File uploads require explicit authorization or role-based permission.

---

## Data Security Considerations

- Private groups must enforce access checks at the backend level.
- Membership validation is required for every group resource request.
- File access should respect group membership and role restrictions.
- Rehearsals and attendance records should be restricted to group participants.

---

## UX Notes

- Group dashboard should show: roster, upcoming rehearsals, library, announcements, community feed.
- A director should have a quick action menu for invite, schedule rehearsal, and publish announcement.
- Members should see a unified timeline of rehearsals, discussions, and shared materials.
