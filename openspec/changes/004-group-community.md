# Change #4: Groups, Shared Library, Rehearsals & Community

## Summary
Design and document the group-based collaboration experience for Music Folder, where a director manages a group of students or members, shares a common library of materials, schedules rehearsals, and opens a communication space for group and community conversations.

---

## What & Why

### Problem
Current Music Folder flows support personal scores and general community conversations, but they do not yet support a group-based organization with a clear director role, shared music resources, rehearsal scheduling, and member communication.

### Solution
Add a structured group feature where:
- the director owns and manages the group
- members/students join and participate with role-based permissions
- the group has a shared library of scores and files
- rehearsals are created and tracked within the group
- the group has a communication channel for announcements and chat
- the platform also supports a broader community conversation layer

### Goals
1. Create a group model with members and roles.
2. Allow a director to manage the group and its roster.
3. Assign each group a unique join code that the director can share with students.
4. Allow students to join by entering the director's code.
5. Share resources and library files within the group.
6. Plan and track rehearsals for the group.
7. Support announcement and conversation threads.
8. Keep private group communication separate from public community discourse.

### Non-Goals
- Private direct messaging outside the group context.
- Video streaming or live remote rehearsal sessions.
- Billing or subscription management.
- AI-assisted music analysis in MVP.

---

## Proposed Scope

### Group Experience
- Group creation by director
- Unique join code assigned to each group and displayed to the director
- Student join flow using the group code
- Membership requests and invitations
- Role management: director, member, student, admin
- Group visibility control: private, invite-only, public

### Shared Library
- Scores, PDFs, references, recordings, notes
- Upload permissions by role
- Repertoire organization and search
- Group-level access control

### Rehearsal Feature
- Scheduled rehearsals with date, time, agenda, notes
- Attendance tracking
- Rehearsal files and references
- Summary and follow-up notes

### Communication Features
- Group announcements
- Group chat or thread discussions
- Community posts for general conversation

---

## Success Criteria

- A director can create a group and invite members.
- A member can view the library and group events.
- Rehearsal information is visible and organized by group.
- Communication is separated between private group channels and public community spaces.
- Permissions prevent unauthorized access to group resources.
