# Groups, Community & Shared Rehearsal Flow

## Overview

This specification defines the group experience for Music Folder, focused on a director-led space where musicians, students, and community members collaborate inside a single group environment.

The system must support:
- group creation and membership management
- the director as the owner and administrator of the group
- a shared library of scores and rehearsal materials
- rehearsal sessions with agenda, notes, attendance, and recordings
- an internal communication space for announcements and discussion
- a community layer for broader conversation and participation

---

## Core Use Case

A director creates a music group, receives a unique join code for that group, and manages the group from one place. Students or members join by entering that code, then they can see the roster, access shared files, join rehearsals, participate in group chat, and contribute to the community conversations about learning, repertoire, and performance.

---

## Group Access and Join Flow

### Director-created Group Code
- Each group receives a unique access code generated automatically when the director creates it.
- The director can view and copy the code from the group dashboard.
- The code is used as the entry point for students to request access.

### Student Join Flow
1. The director creates the group and receives its code.
2. The student opens the join panel in the platform.
3. The student enters the group code.
4. The system validates the code and checks whether the group accepts new members.
5. The student is added to the group with a pending or active status, depending on the group policy.
6. Once accepted, the student can see the group library, rehearsal schedule, and communication spaces.

### Validation Rules
- The join code must be unique per group.
- The code can be active or revoked by the director.
- Duplicate or invalid codes cannot be used to join a group.
- The director can regenerate the code if needed for security or privacy reasons.

---

## Goals

1. Allow a director to create and manage a music group.
2. Support members and students with distinct roles and permissions.
3. Share a common library of scores, resources, and reference files.
4. Organize rehearsal sessions inside each group.
5. Enable communication between members and the director.
6. Provide a community channel for broader discussion and announcements.

## Non-Goals

- Real-time audio/video conference features in the MVP.
- Native mobile push notifications for all devices.
- Payment, subscriptions, or premium access tiers.
- Full social network features beyond group/community discussion.

---

## Actors

### Director
- Creates the group
- Invites members
- Assigns roles
- Reviews attendance and rehearsals
- Publishes shared resources and announcements

### Member / Student
- Joins an existing group
- Accesses the library
- Views rehearsals and notes
- Participates in discussion and messaging
- Uploads or comments on group materials when permitted

### Community Member
- Participates in community-level conversations
- Follows group announcements
- Interacts in public discussions related to the ensemble or learning path

### Admin / System
- Manages account-level moderation
- Oversees global platform safety and user validation

---

## Functional Requirements

### 1. Group Creation and Membership

- A director can create a group with a name, description, type, and visibility.
- Each group receives a unique join code assigned to the director at creation time.
- The group has a roster of members.
- Members can have roles such as director, instructor, student, accompanist, or guest.
- Membership can be invited, accepted, or requested by join code.
- Each member has status values: active, pending, blocked.

### 1.1 Join-by-Code Flow

- Students can join a group by entering the group code provided by the director.
- The platform validates the code against the group record before creating the membership.
- A successful join creates a pending membership if moderation is enabled or an active membership immediately if the group is open.
- A director can disable or regenerate the code without affecting existing members.

### 2. Group Library

- Each group has a shared library.
- The library can contain scores, PDFs, recordings, reference files, and notes.
- Files can be uploaded by the director or authorized members.
- Files can be organized by repertoire, topic, section, or difficulty.
- Access can be restricted by role or by the group.

### 3. Rehearsal Group

- Each group can contain one or more rehearsal sessions.
- A rehearsal includes date, time, location, agenda, and notes.
- The director can assign attendance and mark status per member.
- Materials related to the rehearsal can be attached from the group library.
- Rehearsal summaries can be stored as notes or reports.

### 4. Communication and Community

- Group members can send direct messages or group discussions inside the group.
- The director can publish announcements to the whole group.
- Community conversations allow public comments, questions, and topic-based threads.
- Group and community discussions should be separate from the user personal inbox.

### 5. Permissions and Access

- Only the director or allowed managers may invite members.
- Only authorized users may change library permissions.
- Students can view shared materials but may require approval for uploads.
- Community discussions may have public or restricted visibility based on group type.

---

## User Stories

### Director
- As a director, I want to create a group so I can organize my students and ensemble.
- As a director, I want to invite members and manage access so they can join properly.
- As a director, I want to share a common library so everyone uses the same repertoire.
- As a director, I want to create rehearsals and track attendance so the group stays organized.
- As a director, I want to send announcements so everyone understands updates.

### Student / Member
- As a member, I want to enter a group code provided by the director so I can join the right group.
- As a member, I want to join a group so I can access my ensemble information.
- As a member, I want to see the shared library so I can practice the correct materials.
- As a member, I want to access rehearsal details so I know when and where to meet.
- As a member, I want to participate in discussions so I can ask questions and collaborate.

### Community Member
- As a community member, I want to participate in broader conversations so I learn and share knowledge.
- As a community member, I want to engage with group announcements so I stay informed.

---

## Entity Model

### Group
- id
- name
- description
- type
- visibility
- owner_id
- join_code
- is_join_code_active
- created_at
- updated_at

### GroupMember
- id
- group_id
- user_id
- role
- status
- joined_at

### GroupLibraryItem
- id
- group_id
- title
- type
- file_url
- description
- uploaded_by
- created_at

### RehearsalSession
- id
- group_id
- title
- date
- time
- location
- notes
- agenda
- created_by
- created_at

### AttendanceRecord
- id
- rehearsal_id
- user_id
- status
- notes
- updated_at

### GroupDiscussion
- id
- group_id
- created_by
- title
- body
- visibility
- created_at

### GroupMessage
- id
- group_id
- sender_id
- body
- reply_to_id
- created_at

### CommunityPost
- id
- group_id
- author_id
- title
- content
- visibility
- created_at

---

## Journey Summary

1. Director creates a group.
2. Director adds members and assigns roles.
3. Members join and access the shared library.
4. Director schedules rehearsals.
5. Members confirm attendance and access materials.
6. Group discussions and announcements are created.
7. Community posts allow broader conversation and learning.

---

## Success Criteria

- A director can create a group in under 2 steps.
- Members can join and see the correct group context.
- Shared library access is restricted to the correct group members.
- Rehearsal information is visible to group participants.
- Communication channels support discussion and announcements.
- Community participation is clearly separated from private group conversations.
