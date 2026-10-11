# Labspace Harmony

Build a complete, modern, responsive **College Laboratory Management System (CLMS)** as a functional full-stack web application.

This is a **college case-study project**, so make it look like a realistic production-style college management system, not a simple CRUD demo.

## PROJECT NAME

**LabSphere — College Laboratory Management System**

---

## 1. MAIN OBJECTIVE

The system should digitally manage college laboratories, equipment, laboratory bookings, practical sessions, students, faculty, attendance, inventory, and maintenance.

The application must have **three user roles**:

1. Admin / Lab Administrator
2. Faculty
3. Student

Implement role-based access so each user sees the appropriate dashboard and features.

Use Lovable's supported database/authentication capabilities and make the data persistent.

---

# 2. DESIGN REQUIREMENTS

Create a professional academic-management UI.

### Layout

Use:

- Left sidebar navigation
- Top navigation bar
- Main dashboard content
- Responsive mobile layout

### Visual style

Use:

- Modern blue/indigo academic theme
- White/light backgrounds
- Clean cards
- Rounded corners
- Subtle shadows
- Professional tables
- Status badges
- Clear typography
- Responsive design
- Lucide icons
- Charts where appropriate

Avoid excessive gradients, animations, and unnecessary decorative elements.

The application should feel similar to a professional college ERP/admin system.

---

# 3. AUTHENTICATION

Create a login page with:

- College logo
- Email
- Password
- Remember me
- Login button
- Forgot password
- Demo account information

Create demo users for:

### Admin

Email:
admin@college.edu

### Faculty

Email:
faculty@college.edu

### Student

Email:
student@college.edu

After login, redirect users to the correct dashboard according to their role.

---

# 4. ADMIN DASHBOARD

Create an Admin Dashboard.

Show statistics:

- Total Laboratories
- Total Equipment
- Available Equipment
- Equipment Under Maintenance
- Today's Lab Sessions
- Pending Booking Requests
- Total Students
- Total Faculty

Create charts:

### Laboratory Utilization

Show monthly laboratory usage.

### Equipment Status

Show:

- Available
- In Use
- Maintenance
- Damaged

### Maintenance Requests

Show monthly maintenance requests.

### Booking Statistics

Show:

- Approved
- Pending
- Rejected
- Cancelled

Create a "Recent Activity" section.

Example activities:

- New equipment added
- Booking approved
- Maintenance request submitted
- Equipment marked damaged
- New student registered

---

# 5. LABORATORY MANAGEMENT

Create a **Laboratories** page.

Display laboratories in a professional table/card layout.

Each laboratory should have:

- Lab ID
- Lab Name
- Department
- Building
- Floor
- Room Number
- Capacity
- Lab Type
- Status
- Responsible Faculty
- Equipment Count

Example laboratories:

- Computer Networks Lab
- Operating Systems Lab
- Database Lab
- Data Science Lab
- IoT Lab
- Electronics Lab

Lab status:

- Available
- Occupied
- Maintenance
- Inactive

Admin can:

- Add laboratory
- Edit laboratory
- Delete laboratory
- View details
- View equipment
- View booking schedule

Add search and filters.

---

# 6. EQUIPMENT MANAGEMENT

Create an **Equipment** page.

Each equipment item should contain:

- Equipment ID
- Equipment Name
- Category
- Laboratory
- Brand
- Model
- Serial Number
- Purchase Date
- Warranty Expiry
- Quantity
- Condition
- Status

Statuses:

- Available
- In Use
- Under Maintenance
- Damaged
- Lost

Functions:

- Add equipment
- Edit equipment
- Delete equipment
- View equipment details
- Search equipment
- Filter equipment
- Sort equipment

Use different status badges.

---

# 7. LABORATORY BOOKING SYSTEM

Create a complete laboratory booking system.

Faculty should be able to:

1. Select laboratory
2. Select date
3. Select start time
4. Select end time
5. Enter subject
6. Select class/batch
7. Enter purpose
8. Submit booking request

After submission:

**Status = Pending**

Admin can:

- Approve
- Reject
- View booking details

Approved bookings should automatically appear in the laboratory timetable.

### IMPORTANT

Prevent double booking.

If Lab A is already booked from 10:00–12:00, another user must not be able to book Lab A during that period.

Booking statuses:

- Pending
- Approved
- Rejected
- Completed
- Cancelled

---

# 8. LABORATORY TIMETABLE

Create a timetable page.

Show:

Monday → Saturday

Time slots:

09:00–10:00
10:00–11:00
11:00–12:00
12:00–01:00
02:00–03:00
03:00–04:00
04:00–05:00

Display:

- Laboratory
- Subject
- Faculty
- Class
- Time
- Date

Allow filtering by:

- Laboratory
- Faculty
- Department
- Class
- Date

---

# 9. MAINTENANCE MANAGEMENT

Create a **Maintenance** module.

Students and faculty can report equipment problems.

Maintenance request fields:

- Request ID
- Equipment
- Laboratory
- Reported By
- Problem Description
- Priority
- Date
- Status
- Assigned Technician
- Resolution

Priority:

- Low
- Medium
- High
- Critical

Status:

- Open
- Assigned
- In Progress
- Resolved
- Closed

Admin can update the status.

When equipment is reported for serious damage:

**Equipment Status → Under Maintenance**

After resolution:

**Equipment Status → Available**

---

# 10. INVENTORY MANAGEMENT

Create an Inventory module for consumable laboratory resources.

Example items:

- HDMI cables
- Ethernet cables
- Breadboards
- Resistors
- Sensors
- ICs
- Arduino boards
- Raspberry Pi boards
- Batteries
- Connectors

Fields:

- Item ID
- Item Name
- Category
- Laboratory
- Quantity
- Minimum Stock
- Supplier
- Last Updated

Automatically calculate:

### In Stock

Quantity > Minimum Stock

### Low Stock

Quantity <= Minimum Stock

### Out of Stock

Quantity = 0

Display a prominent low-stock warning.

---

# 11. STUDENT MANAGEMENT

Admin should be able to manage students.

Fields:

- Student ID
- Name
- Roll Number
- Department
- Year
- Section
- Email
- Assigned Laboratory

Functions:

- Add student
- Edit student
- Delete student
- View student
- Search
- Filter

---

# 12. FACULTY MANAGEMENT

Admin should be able to manage faculty.

Fields:

- Faculty ID
- Name
- Department
- Email
- Phone
- Specialization
- Assigned Laboratory

Include:

- Search
- Filter
- Add
- Edit
- Delete
- View details

---

# 13. ATTENDANCE

Create a Laboratory Attendance module.

Faculty can select:

- Laboratory
- Subject
- Date
- Class/Batch

Display all students.

Allow faculty to mark:

- Present
- Absent

Show attendance statistics:

- Total sessions
- Present
- Absent
- Attendance percentage

Use progress bars for attendance percentage.

Students should be able to view their own attendance.

---

# 14. EQUIPMENT ISSUE REPORTING

Students and faculty can report damaged equipment.

Create a form:

- Equipment
- Laboratory
- Issue Type
- Description
- Severity
- Optional image upload
- Submit Report

Workflow:

Reported
↓
Inspected
↓
Under Maintenance
↓
Resolved

Admin should be able to update the status.

---

# 15. NOTIFICATIONS

Create a notification bell in the top navigation.

Notifications should appear for:

- Booking approved
- Booking rejected
- Maintenance request updated
- Equipment unavailable
- Low inventory
- Upcoming laboratory session

Allow users to mark notifications as read.

---

# 16. REPORTS

Create an Admin Reports page.

### Laboratory Utilization Report

Show:

- Laboratory
- Total bookings
- Total hours
- Utilization percentage

### Equipment Report

Show:

- Total equipment
- Available
- In Use
- Damaged
- Under Maintenance

### Maintenance Report

Show:

- Total requests
- Open
- In Progress
- Resolved

### Inventory Report

Show:

- Total inventory
- Low stock
- Out of stock

Include:

- Export CSV
- Print Report

---

# 17. ROLE-BASED SIDEBAR

## ADMIN

Dashboard
Laboratories
Equipment
Bookings
Timetable
Maintenance
Inventory
Students
Faculty
Attendance
Reports
Notifications
Settings

## FACULTY

Dashboard
Laboratories
Equipment
Book Laboratory
Timetable
Attendance
Maintenance
Notifications
Profile

## STUDENT

Dashboard
Laboratories
Timetable
My Attendance
Equipment
Report Issue
Notifications
Profile

Do not show admin-only pages to students or faculty.

---

# 18. FACULTY DASHBOARD

Create a faculty dashboard showing:

- Today's Lab Sessions
- Upcoming Bookings
- Pending Booking Requests
- Assigned Laboratories
- Attendance Summary
- Open Maintenance Requests

Quick actions:

- Book Laboratory
- Mark Attendance
- Report Equipment Issue

---

# 19. STUDENT DASHBOARD

Create a student dashboard showing:

- Today's Lab
- Next Practical Session
- Attendance Percentage
- Assigned Laboratory
- Recent Notifications
- Reported Equipment Issues

Quick actions:

- View Timetable
- View Attendance
- Report Equipment Issue

---

# 20. DATABASE

Create a proper relational database.

Create entities/tables for:

### Users

id
name
email
password/auth reference
role

### Students

id
user
roll number
department
year
section

### Faculty

id
user
department
specialization
phone

### Laboratories

id
name
department
building
room
capacity
type
status
responsible faculty

### Equipment

id
name
category
laboratory
brand
model
serial number
purchase date
warranty expiry
quantity
condition
status

### Bookings

id
laboratory
faculty
date
start time
end time
subject
class
purpose
status

### Maintenance Requests

id
equipment
laboratory
reported by
description
priority
status
assigned technician
resolution

### Inventory

id
item name
category
laboratory
quantity
minimum stock
supplier

### Attendance

id
student
faculty
laboratory
subject
date
status

### Notifications

id
user
title
message
read status
created date

Create appropriate relationships between these entities.

---

# 21. IMPORTANT BUSINESS LOGIC

Implement these rules:

### Booking

A laboratory cannot have two approved bookings at overlapping times.

### Equipment

Equipment under maintenance cannot be booked/issued as available.

### Inventory

If quantity reaches zero, automatically show "Out of Stock".

### Maintenance

When a serious equipment issue is submitted, equipment status should change to "Under Maintenance".

### Attendance

Automatically calculate attendance percentage.

### Permissions

Students cannot approve bookings.

Faculty cannot delete laboratories.

Only Admin can manage laboratories, equipment, students, faculty and reports.

---

# 22. SEARCH AND FILTERING

Implement functional search and filtering across:

- Laboratories
- Equipment
- Students
- Faculty
- Bookings
- Maintenance
- Inventory

Add sorting where appropriate.

---

# 23. DEMO DATA

Populate the database with realistic demo data.

Create approximately:

- 6 laboratories
- 150 equipment records
- 300 students
- 20 faculty members
- 20 bookings
- 10 maintenance requests
- 20 inventory items
- Attendance records
- Notifications

Make the data internally consistent.

---

# 24. DASHBOARD QUICK ACTIONS

Admin:

[+ Add Laboratory]
[+ Add Equipment]
[Approve Bookings]
[View Maintenance]

Faculty:

[Book Laboratory]
[Mark Attendance]
[Report Issue]

Student:

[View Timetable]
[View Attendance]
[Report Issue]

---

# 25. UI DETAILS

Every page should have:

- Page title
- Short description
- Search where appropriate
- Filters where appropriate
- Primary action button
- Loading state
- Empty state
- Error state
- Confirmation dialog before destructive actions

Tables should be responsive.

Forms should have proper validation and helpful error messages.

---

# 26. IMPORTANT: DO NOT CREATE A STATIC MOCKUP

The application must be functional.

Buttons should perform real actions.

Forms should save data.

Tables should update after changes.

Bookings should be stored.

Approvals should update booking status.

Equipment status should update.

Maintenance requests should be stored.

Attendance should be stored.

Notifications should update.

Use persistent database storage.

---

# 27. MAIN WORKFLOW

The most important workflow is:

Faculty needs a laboratory
→ Checks availability
→ Creates booking request
→ Admin receives request
→ Admin approves/rejects
→ Approved booking appears in timetable
→ Students attend practical
→ Faculty marks attendance
→ Equipment gets damaged
→ Student/Faculty reports issue
→ Admin reviews issue
→ Equipment becomes Under Maintenance
→ Maintenance completed
→ Equipment becomes Available

Make this workflow fully functional.

---

# 28. FINAL QUALITY REQUIREMENTS

Before finishing:

1. Check all navigation links.
2. Check all forms.
3. Check database operations.
4. Check role permissions.
5. Check booking conflicts.
6. Check equipment status updates.
7. Check maintenance workflow.
8. Check attendance calculations.
9. Check responsive design.
10. Fix console/runtime errors.
11. Make sure no major buttons are placeholders.
12. Use realistic demo data.

Build the application incrementally, starting with:

1. Authentication
2. Database schema
3. Role-based dashboards
4. Laboratory management
5. Equipment management
6. Booking system
7. Timetable
8. Maintenance
9. Inventory
10. Attendance
11. Reports
12. Notifications

After implementing the first version, review the application for missing functionality and fix obvious issues.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1857a050-1c42-5fee-9240-b7af9e086d39).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
