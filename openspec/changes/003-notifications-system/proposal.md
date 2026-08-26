# Proposal: Notifications System

## Summary
Add a comprehensive Notification System for Music Folder, featuring a frontend UI Notification Center and an event-driven NestJS backend service.

## What & Why
- **Problem**: Musicians and conductors miss critical updates when rehearsals are scheduled, scores are uploaded, or attendance is recorded.
- **Solution**: Centralize notifications in a top-bar notification bell dropdown popover with badges, filters, toast notifications, and NestJS event emitters for `rehearsal_scheduled`, `sheet_uploaded`, and `attendance_marked`.

## Goals
1. Connect and design the Notifications place in the frontend UI.
2. Define the `Notification` entity schema and REST API endpoints.
3. Decouple notification dispatching using NestJS event emitters (`rehearsal.scheduled`, `sheet.uploaded`, `attendance.marked`).
4. Provide step-by-step tasks for backend implementation.
