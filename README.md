# FCAPT-Cloud-Based-Attendance-Management-System
A system of marking attendance and saving it on the cloud

## Logo
Place your institutional logo as `logo.png` in the project root (optional). The app ships with `logo.svg` and uses it on the login page and dashboard headers.

## Lecturer presence notifications
When a student marks presence in the student portal, the assigned lecturer is notified on `lecturer_dashboard.html` via:
- Real-time attendance inserts (Supabase Realtime)
- Polling every 15 seconds
- Optional persisted rows in a `notifications` table

Create this table in Supabase SQL Editor if you want notifications to survive page reloads:

```sql
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  lecturer_id uuid references profiles(id) on delete cascade,
  student_id uuid references profiles(id) on delete set null,
  course_id uuid references courses(id) on delete set null,
  student_name text,
  course_code text,
  week_number int,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);
```

Enable **Realtime** for the `attendance` table in Supabase (Database → Replication) for instant toast alerts while the lecturer dashboard is open.

## One check-in per course per week
Students cannot mark presence twice for the same course in the same week (enforced in the student portal UI). For database-level protection, run:

```sql
create unique index if not exists attendance_student_course_week_unique
  on attendance (student_id, course_id, week_number);
```
