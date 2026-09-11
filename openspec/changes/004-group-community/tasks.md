# Tasks: Groups, Shared Library & Community

## Phase 1: Group Foundation
- [ ] Define the `Group` entity with `join_code` and active/inactive join status.
- [ ] Create `GroupController` and `GroupService` for creation, listing, and update flows.
- [ ] Add director-generated group code flow and ability to regenerate it.
- [ ] Add join-by-code endpoint for students and validation rules.
- [ ] Add invite and join request workflow for members.
- [ ] Define role-based access rules for director, member, and guest.

## Phase 2: Shared Library
- [ ] Define `GroupLibraryItem` entity and file metadata model.
- [ ] Create upload and listing endpoints for group resources.
- [ ] Add permission checks for upload and access by role.
- [ ] Create the frontend group library view and file cards.

## Phase 3: Rehearsal Sessions
- [ ] Define `RehearsalSession` and `AttendanceRecord` entities.
- [ ] Implement creation and update flow for group rehearsals.
- [ ] Add attendance updates and summary notes.
- [ ] Build the rehearsal dashboard for the group.

## Phase 4: Communication & Community
- [ ] Define `GroupMessage` and `CommunityPost` entities.
- [ ] Implement announcements and thread creation endpoints.
- [ ] Add public and private visibility rules.
- [ ] Build the communication panel for group discussions and community posts.

## Phase 5: Verification
- [ ] Validate role permissions end-to-end for group access.
- [ ] Verify shared library visibility rules across members.
- [ ] Validate rehearsal creation and attendance flow.
- [ ] Ensure community posts remain separated from private group communication.
- [ ] Run API and frontend smoke tests for the complete flow.
