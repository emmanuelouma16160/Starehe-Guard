# Starehe-Guard
This is a school security system that modernizes signing in and out of students by scanning there QRCODES and respective parents automatically are notified about the status of there children, visitors signing in and out has also been automated.

 StaSentry- School Security Management System
A production-ready, enterprise-grade school security management system designed to streamline gate access control, student attendance tracking, parent communication, and incident management through an intuitive role-based interface.


Features
Authentication & Security
Supabase Authentication with JWT-based session management

Role-Based Access Control (RBAC) with 5 user roles

Admin approval workflow for user registrations

Secure password hashing and encrypted sessions

Student Management
Full CRUD operations with QR code generation

Parent linking with phone/email for notifications

Medical information tracking for emergencies

Watchlist functionality for restricted individuals

Gate Operations (Guard Interface)
QR code scanning via camera or manual entry

Real-time entry/exit logging with timestamps

Automatic SMS/Email notifications to parents

Watchlist alerts to prevent unauthorized access

Communication & Notifications
Real-time messaging between staff members

Broadcast messaging for emergency alerts

SMS notifications via Africa's Talking API



Incident Management
Comprehensive incident reporting with severity levels

Incident lifecycle tracking (Open → Resolved)

Emergency lockdown functionality

Photo attachments and person involvement

Reporting & Analytics
Daily attendance summaries

Student attendance reports with date filtering

Dashboard analytics with key metrics

 Technology Stack
Backend
Component	Technology	Version
Runtime	Node.js
Framework	Express.js	
Database	MongoDB	
ODM	Mongoose	
Authentication	Supabase	
SMS Gateway	Africa's Talking	
Email Service	SendGrid	
QR Generation	QRCode.js
Validation	Express Validator	
Security	Helmet, CORS, bcryptjs	Latest
Logging	Winston + Morgan	Latest
Frontend
Component	Technology	Version
Framework	Next.js	 (App Router)
Styling	Tailwind CSS	
State Management	Zustand	
HTTP Client	Axios	
Forms	React Hook Form + Zod	
Icons	Lucide React	
Charts	Recharts	
QR Scanning	html5-qrcode	

Installation
Prerequisites
Requirement	Version	Installation Link
Node.js	v18+	nodejs.org
MongoDB	v6+	mongodb.com
npm	v9+	Included with Node.js
Supabase Account	-	supabase.com
Africa's Talking Account	-	africastalking.com
SendGrid Account	-
