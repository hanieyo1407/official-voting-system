📌 Comprehensive AI App Builder Prompt for DMI Voting System

Task:
Build a secure, transparent, and fully functional electronic voting system named DMI Voting System, following the complete specifications provided below. The app must implement all described workflows, roles, database structures, and security protocols.

1. General Requirements

Name: DMI Voting System

Purpose: Secure, accessible, and transparent electronic voting platform for DMI St John The Baptist University.

Core phases:

Registration Phase – Student enrollment, voucher issuance.

Voting Phase – Secure vote casting with QR + email OTP authentication.

Verification & Results Phase – Students verify votes; results tallied and published.

Key Features:

QR-code voucher system (one vote per voucher)

Two-factor authentication (voucher + email OTP)

Real-time results dashboard

Offline capability with resync

Audit trail and transparency tools

Inclusive design (works without reg numbers or campus emails)

2. User Roles & Permissions

Student Voter: Register once, vote once, verify vote, view results.

Registration Official: Verify IDs, register voters, issue/reissue vouchers.

Poll Worker: Scan vouchers, assist voters, report incidents.

Election Administrator: Configure elections, monitor stats, manage results, review logs.

System Administrator: Full technical access (backups, database, security).

All roles must follow principle of least privilege; actions logged in audit logs.

3. Architecture

Frontend: React 18+ with Tailwind CSS, mobile-first design, QR scanning via html5-qrcode.

Backend: Python (Flask/Django) or Node.js (Express).

Database: PostgreSQL/MySQL with given schema.

Infrastructure: Cloud hosting (AWS/DigitalOcean) or on-campus server, daily backups.

Security:

AES-256 encryption for votes

SHA-256 hashing for blockchain-style integrity chain

TLS 1.3 for data in transit

CSRF & XSS protection

Rate limiting & CAPTCHA against abuse

Optional: SMS fallback (Twilio or Africa’s Talking).

4. Database Schema

Implement tables as documented:

voters (ID, email, phone, voucher_code, qr_hash, has_voted, timestamps, status).

votes (vote_id, position_id, candidate_id, encrypted_vote, hash chain, verification_code).

positions (id, name, description, order, is_active).

candidates (id, position_id, name, photo, bio, manifesto, order).

audit_logs (id, timestamp, event_type, user_type, action, details, ip, status).

Ensure unique constraints on voucher codes, emails, verification codes.

5. Core Modules

Registration Module

Student shows ID → official verifies → system generates voter_id + voucher (QR + serial).

Voucher printed + email confirmation sent.

Lost vouchers can be reissued (old invalidated).

Authentication Module

Voting day: Student presents voucher.

QR scanned → system validates voucher.

OTP sent to email → student enters code.

Access to ballot granted.

Voting Module

Ballot displayed position by position.

Only one candidate (or abstain) per position.

Review screen before submission.

Votes encrypted, hashed, stored.

Verification code generated, receipt emailed/printed.

Results Module

Tally votes automatically.

Publish official results dashboard (with graphs, turnout stats, downloadable reports).

Voters can verify votes with receipt code, but vote choices remain anonymous.

Admin Dashboard

Real-time statistics (turnout, per-station status, incident logs).

Role-based access (admins vs sysadmins).

Incident reporting and monitoring.

Integrity check tools (audit logs, vote chain validation).

6. Security & Compliance

Multi-factor authentication: Voucher (something you have) + OTP (something you know).

Optional biometrics extension (fingerprint/face).

Offline fallback with resync.

Blockchain-like vote integrity chain (tamper detection).

Full audit logs, immutable storage.

Compliance: Data privacy, secret ballot protection, transparent results.

7. User Experience

Students: Simple registration, clear ballot UI, mobile-friendly, receipt-based verification.

Officials: Easy voucher issuance, scanning, and problem resolution workflows.

Admins: Intuitive dashboards, strong reporting, monitoring, and security alerts.

Accessibility: Support for students without reg numbers, allow Gmail/Outlook accounts.

8. Deliverables

Fully functional web application (responsive).

Optionally packaged as desktop client for polling stations.

Installation + configuration scripts.

Complete documentation: Setup guide, user manual, troubleshooting.

Exportable reports (CSV, PDF).

Audit tools and logs.

⚡ Instruction:
Generate the full application codebase, database migrations, APIs, frontend interfaces, and deployment configurations based on the above specifications. Ensure end-to-end security, usability, and auditability.


# DMI VOTING SYSTEM
## Complete System Documentation

**Version:** 1.0  
**Date:** September 30, 2025  
**Developed by:** DMI Science and Tech Club  
**Institution:** DMI St John The Baptist University

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [System Architecture](#system-architecture)
4. [User Roles and Permissions](#user-roles-and-permissions)
5. [Registration Phase](#registration-phase)
6. [Voting Phase](#voting-phase)
7. [Verification and Results Phase](#verification-and-results-phase)
8. [Security Framework](#security-framework)
9. [Technical Specifications](#technical-specifications)
10. [Implementation Guide](#implementation-guide)
11. [User Manuals](#user-manuals)
12. [Troubleshooting Guide](#troubleshooting-guide)
13. [Legal and Compliance](#legal-and-compliance)
14. [Appendices](#appendices)

---

## 1. Executive Summary

### 1.1 Purpose
The DMI Voting System is a secure, accessible, and transparent electronic voting platform designed specifically for DMI St John The Baptist University. It enables students to participate in campus elections for various leadership positions while ensuring vote integrity, preventing fraud, and maintaining voter anonymity.

### 1.2 Key Features
- **QR Code Voucher System** - Physical-digital hybrid security
- **Personal Email Verification** - Two-factor authentication
- **One-Vote-Per-Position** - Prevents double voting
- **Real-time Results** - Transparent tallying and reporting
- **Inclusive Design** - Accommodates students without registration numbers
- **Audit Trail** - Complete transparency and verifiability
- **Offline Capability** - Functions during internet disruptions

### 1.3 Project Team
**DMI Science and Tech Club**
- Project Lead: [Name]
- Lead Developer: [Name]
- Security Specialist: [Name]
- UI/UX Designer: [Name]
- Database Administrator: [Name]
- Documentation Lead: [Name]

### 1.4 Stakeholders
- **Primary Users:** DMI St John The Baptist University students
- **Administrators:** Student Union, Election Committee
- **Oversight:** University Administration, DMI Science and Tech Club
- **Support:** IT Department (if available)

---

## 2. System Overview

### 2.1 Problem Statement
DMI St John The Baptist University requires a voting system that:
- Works without institutional email infrastructure
- Accommodates students without registration numbers
- Prevents vote tampering and double voting
- Functions without a working university portal
- Maintains voter anonymity while ensuring accountability

### 2.2 Solution
A three-phase hybrid voting system combining:
- Physical voucher distribution (QR codes)
- Personal email verification
- Digital ballot casting
- Cryptographic vote protection
- Public result verification

### 2.3 System Workflow

```
REGISTRATION PHASE (1-2 weeks before election)
↓
Student presents ID → Official verifies → System generates Voter ID
→ Print QR Voucher → Email confirmation sent → Student receives voucher

VOTING PHASE (Election day)
↓
Student presents voucher → QR scanned → Email OTP sent
→ Student enters OTP → Ballot displayed → Student votes
→ Vote encrypted & stored → Receipt generated → Email confirmation

VERIFICATION PHASE (After voting closes)
↓
Results calculated → Public portal opens → Students verify with receipt code
→ Aggregate results published → Audit reports generated
```

### 2.4 Core Principles
1. **Security First** - Multiple layers of protection against fraud
2. **Accessibility** - Works for all students regardless of status
3. **Transparency** - Open verification and audit capabilities
4. **Privacy** - Anonymous ballots with verifiable receipts
5. **Simplicity** - Easy to use for voters and administrators
6. **Resilience** - Offline capabilities and backup procedures

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
├──────────────┬──────────────┬──────────────┬────────────┤
│ Registration │ Voting       │ Results      │ Admin      │
│ Interface    │ Interface    │ Portal       │ Dashboard  │
└──────────────┴──────────────┴──────────────┴────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
├──────────────┬──────────────┬──────────────┬────────────┤
│ Auth Service │ Vote Service │ Email Service│ QR Service │
└──────────────┴──────────────┴──────────────┴────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                       DATA LAYER                         │
├──────────────┬──────────────┬──────────────┬────────────┤
│ Voter DB     │ Vote DB      │ Candidate DB │ Audit Logs │
└──────────────┴──────────────┴──────────────┴────────────┘
```

### 3.2 Component Description

#### 3.2.1 Registration Module
- **Function:** Enrolls voters and issues credentials
- **Inputs:** Student ID, Personal email, Phone number (optional)
- **Outputs:** QR voucher, Voter ID, Confirmation email
- **Security:** Email uniqueness check, Manual ID verification

#### 3.2.2 Authentication Module
- **Function:** Verifies voter identity during voting
- **Inputs:** QR code/Serial number, Email OTP
- **Outputs:** Authenticated session, Access to ballot
- **Security:** Two-factor authentication, One-time voucher use

#### 3.2.3 Voting Module
- **Function:** Presents ballot and records votes
- **Inputs:** Candidate selections per position
- **Outputs:** Encrypted vote record, Receipt code
- **Security:** Anonymous storage, Cryptographic hashing

#### 3.2.4 Results Module
- **Function:** Tallies votes and displays results
- **Inputs:** Encrypted votes from database
- **Outputs:** Aggregate results, Verification portal
- **Security:** Tamper-evident logs, Public auditability

#### 3.2.5 Admin Dashboard
- **Function:** System management and monitoring
- **Features:** 
  - Real-time voting statistics
  - Voter turnout tracking
  - System health monitoring
  - Incident reporting
  - Results management
- **Access:** Role-based with audit logging

### 3.3 Database Schema

#### Voters Table
```sql
CREATE TABLE voters (
    voter_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    voucher_code VARCHAR(100) UNIQUE NOT NULL,
    qr_hash VARCHAR(256) UNIQUE NOT NULL,
    registration_timestamp TIMESTAMP,
    has_voted BOOLEAN DEFAULT FALSE,
    voted_timestamp TIMESTAMP NULL,
    status ENUM('active', 'revoked', 'reissued')
);
```

#### Votes Table
```sql
CREATE TABLE votes (
    vote_id VARCHAR(50) PRIMARY KEY,
    position_id VARCHAR(50) NOT NULL,
    candidate_id VARCHAR(50) NOT NULL,
    encrypted_vote TEXT NOT NULL,
    vote_hash VARCHAR(256) NOT NULL,
    previous_vote_hash VARCHAR(256),
    timestamp TIMESTAMP,
    verification_code VARCHAR(20) UNIQUE NOT NULL
);
```

#### Positions Table
```sql
CREATE TABLE positions (
    position_id VARCHAR(50) PRIMARY KEY,
    position_name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### Candidates Table
```sql
CREATE TABLE candidates (
    candidate_id VARCHAR(50) PRIMARY KEY,
    position_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    photo_url VARCHAR(500),
    bio TEXT,
    manifesto TEXT,
    display_order INT,
    FOREIGN KEY (position_id) REFERENCES positions(position_id)
);
```

#### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL,
    user_type ENUM('voter', 'admin', 'system'),
    user_id VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    status ENUM('success', 'failure', 'warning')
);
```

### 3.4 Technology Stack

#### Backend
- **Language:** Python 3.9+ or Node.js 16+
- **Framework:** Flask/Django (Python) or Express.js (Node.js)
- **Database:** MySQL 8.0+ or PostgreSQL 13+
- **Encryption:** AES-256 for vote data, SHA-256 for hashing
- **QR Code:** Python: `qrcode` library, Node.js: `qrcode` npm package

#### Frontend
- **Framework:** React 18+ or Vue.js 3+
- **Styling:** Tailwind CSS or Bootstrap 5
- **QR Scanner:** `html5-qrcode` library
- **State Management:** Redux (React) or Vuex (Vue)

#### Infrastructure
- **Hosting:** Local server or Cloud (AWS/Azure/DigitalOcean)
- **Email Service:** SMTP (Gmail/Outlook) or SendGrid/Mailgun
- **SMS Service (Optional):** Twilio or Africa's Talking
- **Backup:** Daily automated backups to external storage

#### Security Tools
- **SSL/TLS:** Let's Encrypt certificates
- **Rate Limiting:** To prevent brute force attacks
- **Input Validation:** Against SQL injection and XSS
- **CSRF Protection:** Token-based verification

---

## 4. User Roles and Permissions

### 4.1 Student Voter
**Permissions:**
- Register for voting (once)
- Cast votes on election day
- Verify their vote was counted
- View election results

**Restrictions:**
- Cannot vote multiple times
- Cannot access admin functions
- Cannot view other voters' choices
- Cannot modify votes after submission

### 4.2 Registration Official
**Permissions:**
- Verify student identity
- Register eligible voters
- Issue voting vouchers
- Reissue lost vouchers
- View registration statistics

**Restrictions:**
- Cannot cast votes on behalf of students
- Cannot access vote data
- Cannot modify election results
- Cannot delete voter registrations (only deactivate)

### 4.3 Poll Worker
**Permissions:**
- Scan voter vouchers
- Assist with technical issues
- Monitor voting station
- Report incidents

**Restrictions:**
- Cannot view voter selections
- Cannot modify vote data
- Cannot override authentication
- Cannot access admin dashboard

### 4.4 Election Administrator
**Permissions:**
- Configure elections (positions, candidates)
- Monitor real-time voting statistics
- Generate reports
- Manage system settings
- Access audit logs
- Resolve disputes

**Restrictions:**
- Cannot cast votes
- Cannot view individual voter choices
- Cannot modify votes after casting
- Requires multi-admin approval for critical actions

### 4.5 System Administrator (DMI Science and Tech Club)
**Permissions:**
- Full system access
- Database management
- Security configuration
- Backup and recovery
- System updates
- User role management

**Restrictions:**
- All actions are logged
- Cannot delete audit logs
- Cannot access encrypted vote content
- Requires dual authorization for critical operations

---

## 5. Registration Phase

### 5.1 Objectives
- Enroll all eligible students
- Issue secure voting credentials
- Verify student identities
- Prevent duplicate registrations

### 5.2 Timeline
**Duration:** 1-2 weeks before election day

**Schedule:**
- Week 1: Main registration period (Mon-Fri, 8 AM - 5 PM)
- Week 2: Extended hours including evenings
- Election Day: Emergency registration desk available

### 5.3 Registration Locations
Suggested setup across campus:
- Main Administration Block
- Library entrance
- Student Union office
- Each faculty/department
- Hostels/Dormitories (evening sessions)

### 5.4 Registration Process (Step-by-Step)

#### Step 1: Student Arrival
Student approaches registration desk with:
- **Required:** Any valid identification
  - Admission letter
  - National ID card
  - Passport
  - Driver's license
  - School fee receipt
- **Required:** Personal email address (to be provided verbally)
- **Optional:** Phone number for backup

#### Step 2: Official Verification
Registration official:
1. Checks ID document authenticity
2. Verifies student name against enrollment records (if available)
3. For new students: Accepts admission letter as proof
4. Confirms student hasn't registered already (checks database)

#### Step 3: Data Entry
Official enters into system:
- Student full name (as per ID)
- Email address
- Phone number (optional)
- ID type and number (for records)
- Faculty/Department (if known)

#### Step 4: System Processing
System automatically:
1. Generates unique Voter ID (e.g., `DMI2025-00123`)
2. Creates cryptographic QR code linked to Voter ID
3. Generates serial number (backup: `SN-458921`)
4. Stores encrypted record in database
5. Marks email as registered

#### Step 5: Voucher Printing
System prints voting voucher containing:
```
╔════════════════════════════════════════╗
║    DMI VOTING SYSTEM 2025             ║
║    OFFICIAL VOTING VOUCHER            ║
╠════════════════════════════════════════╣
║                                        ║
║         [QR CODE HERE]                ║
║                                        ║
║    Serial No: SN-458921               ║
║                                        ║
║    IMPORTANT INSTRUCTIONS:            ║
║    1. Keep this voucher secure        ║
║    2. Bring it on election day        ║
║    3. One voucher = One vote          ║
║    4. Check your email for details    ║
║                                        ║
║    Voting Date: [DATE]                ║
║    Voting Locations: [LOCATIONS]      ║
║                                        ║
║    Questions? Contact DMI Sci & Tech  ║
║    Email: voting@dmi.ac.mw           ║
╚════════════════════════════════════════╝
```

#### Step 6: Email Confirmation
System sends automated email to student:
```
Subject: DMI Voting System - Registration Successful

Dear [Student Name],

You have successfully registered for the DMI St John The Baptist 
University Student Elections 2025.

Registration Details:
- Registration Date: [Date & Time]
- Voter ID: DMI2025-00123
- Backup Serial Number: SN-458921

IMPORTANT REMINDERS:
✓ You have been issued a physical voting voucher - keep it safe
✓ Bring your voucher on election day
✓ You will need access to this email to vote
✓ You can only vote once per position

Election Details:
- Date: [Election Date]
- Time: 8:00 AM - 5:00 PM
- Locations:
  • Main Campus Polling Station (Library Hall)
  • Faculty of Science Polling Station
  • Student Center Polling Station

Positions to vote for:
1. Student Union President
2. Vice President
3. Secretary General
4. Treasurer
[... other positions]

Candidates:
View all candidates and their manifestos at:
https://voting.dmi.ac.mw/candidates

What to expect on election day:
1. Present your voting voucher at any polling station
2. Official will scan your QR code
3. You'll receive a verification code via email
4. Enter the code to access your ballot
5. Vote for your preferred candidates
6. Submit and receive a receipt code

LOST YOUR VOUCHER?
Visit the helpdesk with your original ID to request a reissue.

Questions?
Contact: voting@dmi.ac.mw
WhatsApp: +265 XXX XXX XXX

Powered by DMI Science and Tech Club
For a transparent and secure election
```

#### Step 7: Student Acknowledgment
Student:
- Receives voucher
- Confirms email receipt
- Signs registration logbook (physical backup)
- Leaves registration area

### 5.5 Registration Statistics Dashboard
Real-time tracking available to administrators:
- Total registrations by hour/day
- Registration by faculty/department
- Percentage of enrolled students registered
- Peak registration times
- Email delivery success rate
- Voucher reissue requests

### 5.6 Quality Assurance
- Daily reconciliation: Physical logbook vs. database entries
- Random verification calls/emails to registered students
- Test registrations to verify system functionality
- Backup systems tested daily

### 5.7 Special Cases

#### Late Registration
- Available on election day at designated helpdesk
- Requires compelling reason (just admitted, was sick, etc.)
- Same process but expedited
- Flagged in system for audit purposes

#### Duplicate Email Detection
If email already registered:
- System alerts official
- Check if legitimate reissue request or fraud attempt
- If legitimate: Follow reissue procedure
- If fraud: Document incident and deny registration

#### Lost Voucher Before Election
- Student visits helpdesk with original ID
- Official verifies identity against registration record
- Must verify email access (send OTP)
- Original voucher invalidated in database
- New voucher printed with new QR code
- Limited to ONE reissue per student
- Incident logged for audit

#### No Personal Email
Rare case handling:
- Student can create free email on-site (Gmail, Outlook, etc.)
- Officials can assist with account creation
- Alternative: Use trusted family member's email (documented)
- Last resort: Phone-only registration (SMS-based voting)

---

## 6. Voting Phase

### 6.1 Objectives
- Enable all registered students to cast votes securely
- Maintain voter anonymity
- Prevent double voting
- Ensure vote integrity
- Provide immediate confirmation

### 6.2 Timeline
**Election Day:** Single day voting (extensible if needed)
- **Hours:** 8:00 AM - 5:00 PM
- **Early voting:** Optional (day before for special cases)
- **Extended hours:** If turnout requires (until 7:00 PM)

### 6.3 Polling Station Setup

#### Physical Layout
Each polling station requires:

**Reception Area:**
- Queue management (numbered tickets)
- Information desk
- Lost voucher helpdesk

**Verification Zone:**
- 2-3 desks with QR scanners
- Officials with tablets/laptops
- Privacy from voting area

**Voting Booths:**
- 5-10 private voting stations
- Devices: Tablets or laptops
- Privacy screens/dividers
- Chairs and tables

**Exit Area:**
- Receipt collection point
- Feedback forms
- "I Voted" stickers (optional)

#### Equipment Checklist Per Station
- [ ] Laptops/Tablets (10+)
- [ ] QR Code Scanners (3-5)
- [ ] Internet connection (primary)
- [ ] Mobile hotspot (backup)
- [ ] Power strips and UPS
- [ ] Generator (for extended outages)
- [ ] Printer (for receipts)
- [ ] Paper receipt rolls
- [ ] Privacy screens
- [ ] Tables and chairs
- [ ] Signage (instructions, directions)
- [ ] Hand sanitizer and pens

#### Staffing Per Station
- 1 Station Supervisor
- 3 Verification Officials (with QR scanners)
- 1 Technical Support Person
- 2 Queue Managers
- 1 Security Personnel
- Shifts: 2 shifts (8 AM-12:30 PM, 12:30 PM-5 PM)

### 6.4 Voting Process (Step-by-Step)

#### Step 1: Student Arrival and Queueing
- Student joins queue at any polling station
- Receives numbered ticket (optional, for organization)
- Reviews candidate posters/information while waiting
- Estimated wait time displayed

#### Step 2: Voucher Verification
**Student Action:**
- Approaches verification desk
- Presents voting voucher to official

**Official Action:**
- Scans QR code using handheld scanner or device camera
- If QR doesn't scan: Manually enters serial number

**System Action:**
- Queries database for voucher code
- Checks:
  - ✅ Valid voucher?
  - ✅ Not already used?
  - ✅ Registered email active?
  
**Possible Outcomes:**

**Success:**
```
✅ VALID VOUCHER
Voter ID: DMI2025-00123
Status: Ready to vote
Email: j***n@gmail.com
```

**Already Voted:**
```
❌ VOUCHER ALREADY USED
This voucher was used to vote at 10:23 AM today.
If this is an error, please contact the supervisor.
```

**Invalid Voucher:**
```
❌ INVALID VOUCHER
This voucher is not in our system.
Please visit the helpdesk.
```

#### Step 3: Email Verification (Two-Factor Authentication)
**If voucher is valid:**

**System Action:**
- Displays partially masked email: `j***n@gmail.com`
- Asks official: "Send OTP to this email?"

**Official Action:**
- Confirms with student that email is correct
- Clicks "Send OTP"

**System Action:**
- Generates random 6-digit code (e.g., `847293`)
- Sends email immediately:

```
Subject: DMI Voting System - Your Voting Code

Your voting verification code is:

847293

This code expires in 10 minutes.

DO NOT share this code with anyone.

If you didn't request this code, please report it immediately.

DMI Science and Tech Club
```

**Student Action:**
- Checks email on their phone/device
- Tells code to official OR enters it themselves

**Official Action:**
- Types code into system
- System verifies code

**Possible Outcomes:**

**Correct Code:**
```
✅ AUTHENTICATED
Voter verified. Proceed to voting booth.
```

**Incorrect Code:**
```
❌ INVALID CODE
Please try again. Attempts remaining: 2/3
```

**Code Expired:**
```
⏱️ CODE EXPIRED
Generating new code... Check your email.
```

**Too Many Failed Attempts:**
```
🔒 LOCKED
Too many failed attempts.
Please wait 15 minutes or contact supervisor.
```

#### Step 4: Booth Assignment
**Official Action:**
- Assigns student to available voting booth
- "Please proceed to Booth #3"
- Hands instruction card (optional):

```
VOTING INSTRUCTIONS:
1. Review all candidates carefully
2. Select ONE candidate per position
3. You may choose to abstain
4. Review your selections before submitting
5. Once submitted, votes CANNOT be changed
6. Save your receipt code
```

**System Action:**
- Opens authenticated voting session on assigned booth
- Starts 15-minute session timer (auto-logout if inactive)
- Marks voucher as "IN PROGRESS"

#### Step 5: Ballot Display
**Student sees screen:**

```
╔════════════════════════════════════════════════════════╗
║  DMI VOTING SYSTEM 2025                               ║
║  Student Elections Ballot                             ║
╠════════════════════════════════════════════════════════╣
║  You are voting for 6 positions                       ║
║  Select ONE candidate per position                     ║
║  Progress: Position 1 of 6                            ║
╚════════════════════════════════════════════════════════╝

POSITION 1: STUDENT UNION PRESIDENT

┌────────────────────────────────────────────────────────┐
│ [Photo]  Candidate Name: John Banda                    │
│          Faculty: Engineering                          │
│          Manifesto: "Unity and Progress"               │
│                                                        │
│          [VIEW FULL MANIFESTO] [○ SELECT]             │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ [Photo]  Candidate Name: Mary Chirwa                   │
│          Faculty: Business                             │
│          Manifesto: "Student Voice First"              │
│                                                        │
│          [VIEW FULL MANIFESTO] [○ SELECT]             │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ [Photo]  Candidate Name: Peter Mwale                   │
│          Faculty: Science                              │
│          Manifesto: "Innovation for All"               │
│                                                        │
│          [VIEW FULL MANIFESTO] [○ SELECT]             │
└────────────────────────────────────────────────────────┘

                    [◉ ABSTAIN]

            [← BACK]  [NEXT POSITION →]
```

**Features:**
- Large photos of candidates
- Clear candidate information
- Option to view full manifesto (modal/popup)
- Radio buttons (only one selection possible)
- Option to abstain (not vote for this position)
- Progress indicator
- Navigation buttons

#### Step 6: Voting for All Positions
Student proceeds through each position:
1. Student Union President
2. Vice President
3. Secretary General
4. Treasurer
5. [Other positions]

For each position:
- Reviews candidates
- Selects ONE candidate or abstains
- Clicks "Next Position"
- Cannot proceed until selection is made (or abstain chosen)

#### Step 7: Review Screen
After all positions:

```
╔════════════════════════════════════════════════════════╗
║  REVIEW YOUR BALLOT                                    ║
║  Please carefully review your selections before        ║
║  submitting. Once submitted, you CANNOT change votes.  ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Position: Student Union President                     ║
║  Your Vote: John Banda                                 ║
║  [Change]                                              ║
║  ─────────────────────────────────────────────────────║
║  Position: Vice President                              ║
║  Your Vote: Mary Chirwa                                ║
║  [Change]                                              ║
║  ─────────────────────────────────────────────────────║
║  Position: Secretary General                           ║
║  Your Vote: ABSTAIN                                    ║
║  [Change]                                              ║
║  ─────────────────────────────────────────────────────║
║  ... (other positions)                                 ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  ⚠️  WARNING: Once you click SUBMIT, your votes       ║
║     will be recorded and CANNOT be changed.            ║
║                                                        ║
║          [← GO BACK]      [SUBMIT BALLOT ✓]          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

**Actions:**
- Student can click [Change] to go back to any position
- When satisfied, clicks [SUBMIT BALLOT]
- System asks for final confirmation:

```
╔════════════════════════════════════════════════════════╗
║  ⚠️  FINAL CONFIRMATION                                ║
║                                                        ║
║  Are you sure you want to submit your ballot?          ║
║                                                        ║
║  This action is FINAL and IRREVERSIBLE.                ║
║                                                        ║
║         [NO, GO BACK]    [YES, SUBMIT NOW]            ║
╚════════════════════════════════════════════════════════╝
```

#### Step 8: Vote Submission and Encryption
**When student clicks "YES, SUBMIT NOW":**

**System Actions (Backend):**
1. **Separates voter identity from vote:**
   ```
   Voter Record: [Voter ID] → HAS_VOTED = TRUE
   Vote Record:  [Anonymous] → [Encrypted votes]
   ```

2. **Encrypts each vote:**
   ```
   Plain vote: {"position": "president", "candidate": "John Banda"}
   Encrypted: "U2FsdGVkX1+... [AES-256 encryption]"
   ```

3. **Creates cryptographic hash:**
   ```
   Current vote hash = SHA-256(vote data + previous vote hash)
   ```
   This creates a "blockchain-like" chain where tampering is detectable.

4. **Generates verification code:**
   ```
   Random 12-character code: "DMI-8X4K-9P2L"
   Stored with vote record (not voter record)
   ```

5. **Stores in database:**
   ```sql
   INSERT INTO votes (
       vote_id,
       position_id,
       candidate_id,
       encrypted_vote,
       vote_hash,
       previous_vote_hash,
       timestamp,
       verification_code
   ) VALUES (...);
   
   UPDATE voters 
   SET has_voted = TRUE, 
       voted_timestamp = NOW() 
   WHERE voter_id = 'DMI2025-00123';
   ```

6. **Logs audit trail:**
   ```
   [2025-09-30 10:23:15] Vote cast successfully
   Voter ID: DMI2025-00123 (identity separated after this point)
   Polling Station: Main Campus
   Total votes cast: 234
   ```

#### Step 9: Confirmation and Receipt
**Student sees:**

```
╔════════════════════════════════════════════════════════╗
║  ✅ VOTE SUBMITTED SUCCESSFULLY!                       ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Your votes have been securely recorded.               ║
║                                                        ║
║  Your Verification Code:                               ║
║                                                        ║
║        ┌─────────────────────────┐                    ║
║        │   DMI-8X4K-9P2L        │                    ║
║        └─────────────────────────┘                    ║
║                                                        ║
║  SAVE THIS CODE!                                       ║
║  Use it to verify your vote was counted after the      ║
║  election at: https://voting.dmi.ac.mw/verify          ║
║                                                        ║
║  A copy has been sent to your email.                   ║
║                                                        ║
║  Thank you for participating in DMI elections!         ║
║                                                        ║
║          [PRINT RECEIPT]    [FINISH]                  ║
╚════════════════════════════════════════════════════════╝
```

**System sends email:**

```
Subject: DMI Voting System - Vote Confirmed

Dear Voter,

Your votes have been successfully recorded in the DMI St John 
The Baptist University Student Elections 2025.

Vote Details:
- Date: September 30, 2025
- Time: 10:23:15 AM
- Polling Station: Main Campus
- Positions voted: 6

Your Verification Code: DMI-8X4K-9P2L

IMPORTANT: Save this code!

After voting closes, you can verify your vote was counted:
1. Visit: https://voting.dmi.ac.mw/verify
2. Enter your verification code
3. Confirm your vote is in the system

You will NOT be able to see who you voted for (secret ballot), 
but you can confirm your vote was counted.

Results will be announced at: [Date and Time]
Live results available at: https://voting.dmi.ac.mw/results

Thank you for voting!

DMI Science and Tech Club
```

**Optional: Print Receipt**
If student clicks [PRINT RECEIPT]:

```
═══════════════════════════════════════
   DMI VOTING SYSTEM 2025
   OFFICIAL VOTE RECEIPT
═══════════════════════════════════════

Date: September 30, 2025
Time: 10:23:15 AM
Polling Station: Main Campus

Your Verification Code:
┌─────────────────────────┐
│    DMI-8X4K-9P2L       │
└─────────────────────────┘

Keep this receipt safe!

Use this code to verify your vote
was counted after the election.

Verification Portal:
https://voting.dmi.ac.mw/verify

Results will be announced on:
[Date and Time]

Thank you for participating!

Powered by DMI Science and Tech Club
═══════════════════════════════════════
```

#### Step 10: Exit
**Student Action:**
- Clicks [FINISH]
- Collects printed receipt (if printed)
- Leaves voting booth

**Official Action:**
- Verifies student has left the booth
- Resets booth for next voter
- Optionally gives "I Voted" sticker

**System Action:**
- Closes voting session
- Clears all cached data from device
- Booth status: "Available"

### 6.5 Real-Time Monitoring

#### Administrator Dashboard
Election administrators can monitor in real-time:

```
╔═══════════════════════════════════════════════════════╗
║  DMI VOTING SYSTEM - ADMIN DASHBOARD                  ║
║  Election Day: September 30, 2025                     ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  📊 VOTING STATISTICS                                 ║
║  ─────────────────────────────────────────────────────║
║  Total Registered Voters:        1,247               ║
║  Votes Cast:                       523  (41.9%)      ║
║  Currently Voting:                  12               ║
║  Average Voting Time:            3.5 minutes         ║
║                                                       ║
║  ⏰ REAL-TIME UPDATES                                 ║
║  ─────────────────────────────────────────────────────║
║  10:23 AM - Vote cast (Main Campus)                  ║
║  10:22 AM - Vote cast (Science Faculty)              ║
║  10:21 AM - Vote cast (Main Campus)                  ║
║  10:20 AM - Voucher reissued (Helpdesk)             ║
║                                                       ║
║  📍 POLLING STATION STATUS                            ║
║  ─────────────────────────────────────────────────────║
║  Main Campus:        ✅ Online  | 234 votes          ║
║  Science Faculty:    ✅ Online  | 156 votes          ║
║  Student Center:     ✅ Online  | 133 votes          ║
║                                                       ║
║  ⚠️ ALERTS                                            ║
║  ─────────────────────────────────────────────────────║
║  No critical issues                                   ║
║                                                       ║
║  🎯 TURNOUT BY HOUR                                   ║
║  ─────────────────────────────────────────────────────║
║  8-9 AM:   ████████░░  87 votes                      ║
║  9-10 AM:  ███████████  123 votes                    ║
║  10-11 AM: ████████████  145 votes (current)         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

**Features:**
- Live vote count updates
- Turnout percentage tracking
- Polling station health monitoring
- Incident alerts
- Hourly turnout trends
- Average voting time
- Peak hour predictions

### 6.6 Troubleshooting During Voting

#### Issue 1: QR Code Won't Scan
**Symptoms:** Scanner can't read QR code

**Solutions:**
1. Clean scanner lens
2. Adjust lighting (avoid glare)
3. Flatten voucher (remove creases)
4. Try different scanner/device
5. **Fallback:** Manually enter serial number

**Process:**
```
Official: "The QR code isn't scanning. I'll enter 
          your serial number instead."
Student: "It's SN-458921"
Official: [Types into system]
System:   ✅ Valid voucher found. Proceeding...
```

#### Issue 2: Student Can't Access Email
**Symptoms:** Student doesn't have phone/data to check email

**Solutions:**
1. **On-site WiFi:** Provide guest WiFi for email access
2. **Station device:** Let student check email on secure device
3. **SMS Fallback:** If phone number registered, send OTP via SMS
4. **Manual override:** Supervisor verification process

**Manual Override Process:**
```
1. Student explains situation to supervisor
2. Supervisor verifies identity (checks ID against registration)
3. Supervisor enters admin code to bypass OTP
4. Student proceeds to vote
5. Incident logged for audit
6. Limited to exceptional cases only
```

#### Issue 3: Student Says They Already Voted (But Didn't)
**Symptoms:** System shows voucher already used, but student denies voting

**Investigation:**
1. Check audit logs for timestamp and location
2. Verify if someone may have stolen/photographed their voucher
3. Check if student voted earlier and forgot

**Resolution Options:**

**If voucher was stolen:**
```
1. Student files formal complaint
2. Supervisor reviews evidence
3. If credible, issue provisional ballot
4. Provisional ballot flagged for election committee review
5. Committee investigates before counting vote
```

**If student forgot they voted:**
```
1. Show student the timestamp/location
2. Help them recall the event
3. Explain votes cannot be changed
4. Student acknowledged understanding
```

#### Issue 4: Internet Connection Lost
**Symptoms:** Voting station goes offline

**Response:**

**Immediate Actions:**
1. Switch to backup internet (mobile hotspot)
2. If backup fails, activate **offline mode**

**Offline Mode Process:**
```
1. System displays: "⚠️ OFFLINE MODE ACTIVATED"
2. Votes stored locally in encrypted format
3. Continue accepting voters normally
4. When connection restored:
   - System automatically syncs votes to main server
   - Verifies data integrity
   - Updates central database
5. Supervisor notifies admin dashboard of offline period
```

**Technical Details:**
```javascript
// Offline mode logic
if (internetConnection === false) {
  localStorage.setItem('offlineMode', true);
  encryptAndStoreLocally(voteData);
  queueForSync(voteData);
}

// When back online
if (internetConnection === true && offlineQueue.length > 0) {
  syncOfflineVotes();
  verifyDataIntegrity();
  clearLocalStorage();
}
```

#### Issue 5: Power Outage
**Symptoms:** Electricity cut at polling station

**Response:**
1. **UPS kicks in:** 30-60 minutes backup power
2. **If prolonged:** Switch to generator
3. **If no backup power:** 
   - Close polling station temporarily
   - Direct voters to nearest operational station
   - Resume when power restored
   - Extend voting hours to compensate

#### Issue 6: Device Malfunction
**Symptoms:** Tablet/laptop crashes or freezes

**Response:**
1. Guide voter to different voting booth
2. Restart malfunctioning device
3. System automatically restores session (voter was authenticated)
4. If cannot restore: Re-scan voucher and authenticate again
5. Replace device if problem persists

#### Issue 7: Student Clicks Submit By Mistake
**Symptoms:** Student submits before reviewing all votes

**Policy:**
```
❌ VOTES CANNOT BE CHANGED AFTER SUBMISSION

This is a security feature to prevent:
- Vote buying/selling verification
- Coercion (forcing someone to prove who they voted for)
- System manipulation

Once submitted = FINAL
```

**Support Response:**
```
Official: "I understand, but for security and integrity, 
          votes cannot be changed once submitted. This 
          ensures your vote remains secret and cannot 
          be verified by anyone trying to coerce you."

Student: "But I made a mistake!"

Official: "We understand, but this policy protects all 
          voters. Your vote has been securely recorded."
```

### 6.7 Security Protocols During Voting

#### Privacy Measures
1. **Voting booth screens:** Angled away from others
2. **No phone cameras:** Policy against photographing ballot screens
3. **One voter per booth:** No companions allowed (except special needs)
4. **Officials stay at distance:** Cannot see voter's screen

#### Fraud Prevention
1. **One voucher, one vote:** System enforces this automatically
2. **No voucher sharing:** Physical possession required
3. **Timestamped audit:** Every action logged with timestamp
4. **Video surveillance:** (Optional) Cameras monitor queues, not booths
5. **Random audits:** Supervisors randomly check booth devices for tampering

#### Emergency Procedures

**Ballot Box Compromise (if applicable):**
- Seal station immediately
- Photograph/document evidence
- Contact election committee
- System audit to verify electronic records

**Violence or Intimidation:**
- Contact campus security immediately
- Evacuate polling station if necessary
- Document incident
- Extend voting hours or add makeup day if needed

**System-Wide Failure:**
- Activate contingency plan
- Paper ballot backup (if available)
- Extend election to additional day
- DMI Science and Tech Club emergency response

### 6.8 Closing Procedures (End of Voting Day)

#### At Exactly 5:00 PM (or designated closing time):

**Step 1: Close Voting**
```
System displays at all stations:
╔═══════════════════════════════════════╗
║  ⏰ VOTING HAS OFFICIALLY CLOSED      ║
║                                       ║
║  No new voters will be accepted.      ║
║                                       ║
║  Voters currently in booths may       ║
║  complete their ballots.              ║
╚═══════════════════════════════════════╝
```

**Step 2: Final Voters**
- Anyone IN a voting booth at 5:00 PM can complete their vote
- No new voucher scans accepted after 5:00 PM
- Last vote timestamp recorded

**Step 3: Station Shutdown**
- Each station completes a closing checklist:
  ```
  Closing Checklist - [Station Name]
  ─────────────────────────────────────
  ☑ All voters completed voting
  ☑ All offline votes synced
  ☑ Final vote count recorded: ___
  ☑ Equipment secured
  ☑ Incident reports filed: ___
  ☑ Physical vouchers collected
  ☑ Devices logged out
  ☑ Closing report signed
  
  Supervisor Signature: ______________
  Time Closed: _______
  ```

**Step 4: Data Verification**
- System performs integrity checks:
  ```
  ✓ Total votes = Sum of all station votes
  ✓ No duplicate verification codes
  ✓ All votes have valid timestamps
  ✓ Blockchain hash chain intact
  ✓ Audit logs complete
  ```

**Step 5: System Lock**
- Voting module locked (no new votes accepted)
- Database backup created
- Results calculation begins

---

## 7. Verification and Results Phase

### 7.1 Objectives
- Enable voters to verify their vote was counted
- Calculate and publish results transparently
- Provide audit capabilities
- Announce winners

### 7.2 Vote Verification Portal

#### Student Verification Process
**After voting closes, students can verify their vote:**

**Step 1: Visit Verification Portal**
```
URL: https://voting.dmi.ac.mw/verify

╔════════════════════════════════════════════════════════╗
║  DMI VOTING SYSTEM 2025                               ║
║  VOTE VERIFICATION PORTAL                             ║
╠════════════════════════════════════════════════════════╣
║                                                       ║
║  Election Status: ✅ CLOSED - Votes are being tallied║
║                                                       ║
║  Verify Your Vote Was Counted                         ║
║                                                       ║
║  Enter your verification code:                        ║
║  ┌─────────────────────────────────────────────────┐ ║
║  │ DMI-8X4K-9P2L                                   │ ║
║  └─────────────────────────────────────────────────┘ ║
║                                                       ║
║          [VERIFY MY VOTE]                            ║
║                                                       ║
║  This code was emailed to you after voting.           ║
║  Check your email if you've lost it.                  ║
║                                                       ║
╚════════════════════════════════════════════════════════╝
```

**Step 2: System Verification**
```
╔════════════════════════════════════════════════════════╗
║  ✅ VOTE VERIFIED                                      ║
╠════════════════════════════════════════════════════════╣
║                                                       ║
║  Your vote has been successfully counted in the       ║
║  DMI St John The Baptist University Student           ║
║  Elections 2025.                                      ║
║                                                       ║
║  Vote Details:                                        ║
║  • Cast on: September 30, 2025 at 10:23 AM          ║
║  • Polling Station: Main Campus                       ║
║  • Positions voted: 6                                 ║
║  • Verification Code: DMI-8X4K-9P2L                  ║
║                                                       ║
║  Your vote is securely stored and will be included    ║
║  in the final tally.                                  ║
║                                                       ║
║  Note: For privacy, we cannot show you who you        ║
║  voted for. This protects you from coercion.          ║
║                                                       ║
║  Results will be announced at:                        ║
║  [Date and Time]                                      ║
║                                                       ║
║          [VIEW LIVE RESULTS]                         ║
║                                                       ║
╚════════════════════════════════════════════════════════╝
```

**If Invalid Code:**
```
╔════════════════════════════════════════════════════════╗
║  ❌ VERIFICATION FAILED                                ║
╠════════════════════════════════════════════════════════╣
║                                                       ║
║  The code you entered is not in our system.           ║
║                                                       ║
║  Possible reasons:                                    ║
║  • Code was typed incorrectly                         ║
║  • Code is from a different election                  ║
║  • Code has been tampered with                        ║
║                                                       ║
║  Please check your email for the correct code.        ║
║                                                       ║
║  If you believe this is an error, contact:            ║
║  voting@dmi.ac.mw                                     ║
║                                                       ║
║          [TRY AGAIN]                                 ║
║                                                       ║
╚════════════════════════════════════════════════════════╝
```

### 7.3 Results Calculation

#### Automated Tallying Process

**Step 1: Data Extraction**
```sql
-- For each position, count votes per candidate
SELECT 
    p.position_name,
    c.candidate_name,
    COUNT(v.vote_id) as vote_count
FROM votes v
JOIN candidates c ON v.candidate_id = c.candidate_id
JOIN positions p ON c.position_id = p.position_id
GROUP BY p.position_id, c.candidate_id
ORDER BY p.display_order, vote_count DESC;
```

**Step 2: Verification Checks**
```
✓ Total votes ≤ Total registered voters
✓ No voter voted twice (check voter IDs)
✓ All votes have valid timestamps
✓ All votes are within voting hours
✓ Vote count matches verification codes issued
✓ Cryptographic chain integrity confirmed
```

**Step 3: Results Compilation**
```
Position: Student Union President
─────────────────────────────────────────
John Banda         245 votes (46.8%)  ✅ WINNER
Mary Chirwa        178 votes (34.0%)
Peter Mwale        100 votes (19.1%)
─────────────────────────────────────────
Total Valid Votes: 523
Abstentions: 12
Invalid Votes: 0
Turnout: 41.9% (523/1247)

Position: Vice President
─────────────────────────────────────────
[Similar format]
```

### 7.4 Results Publication

#### Public Results Dashboard

```
╔══════════════════════════════════════════════════════════╗
║  DMI VOTING SYSTEM 2025                                  ║
║  OFFICIAL ELECTION RESULTS                               ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Election Date: September 30, 2025                       ║
║  Results Published: September 30, 2025 at 7:00 PM       ║
║  Total Registered Voters: 1,247                          ║
║  Total Votes Cast: 523 (41.9% turnout)                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────┐
│ 👑 STUDENT UNION PRESIDENT                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ✅ JOHN BANDA - WINNER                                  │
│  245 votes (46.8%)                                       │
│  ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░       │
│                                                          │
│  Mary Chirwa                                             │
│  178 votes (34.0%)                                       │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░        │
│                                                          │
│  Peter Mwale                                             │
│  100 votes (19.1%)                                       │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │
│                                                          │
│  Abstentions: 12                                         │
│  Invalid: 0                                              │
│                                                          │
└──────────────────────────────────────────────────────────┘

[Similar cards for each position]

┌──────────────────────────────────────────────────────────┐
│ 📊 ELECTION STATISTICS                                   │
├──────────────────────────────────────────────────────────┤
│  Peak Voting Hour: 10-11 AM (145 votes)                  │
│  Average Voting Time: 3.5 minutes                        │
│  Polling Stations: 3                                     │
│  Busiest Station: Main Campus (234 votes)                │
│  Technical Issues Reported: 3 (all resolved)             │
│  Voucher Reissues: 8                                     │
└──────────────────────────────────────────────────────────┘

        [📥 DOWNLOAD FULL REPORT (PDF)]
        [📊 DOWNLOAD DATA (CSV)]
        [🔍 VERIFY YOUR VOTE]
```

#### Features:
- **Live updates** during counting (if count is done live)
- **Visual charts** (bar graphs, pie charts)
- **Detailed breakdowns** per position
- **Downloadable reports**
- **Mobile-responsive** design
- **Share buttons** for social media

### 7.5 Audit and Transparency

#### Independent Audit Process

**Who can audit:**
- Election committee members
- Student union representatives
- University administration
- Independent observers (with permission)

**What can be audited:**
1. **Vote totals:** Verify calculations are correct
2. **Audit logs:** Review all system activities
3. **Timestamp verification:** Ensure all votes within voting hours
4. **Cryptographic integrity:** Verify blockchain chain
5. **Voter list:** Check registered vs. voted counts

**Audit Dashboard:**
```
╔══════════════════════════════════════════════════════════╗
║  AUDIT DASHBOARD                                         ║
║  Access Level: Election Committee                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  📋 AVAILABLE REPORTS                                    ║
║  ─────────────────────────────────────────────────────── ║
║  ☑ Complete vote tally (anonymized)                     ║
║  ☑ Audit logs (all system activities)                   ║
║  ☑ Registration statistics                               ║
║  ☑ Voting timeline analysis                              ║
║  ☑ Incident reports                                      ║
║  ☑ Technical logs                                        ║
║  ☑ Cryptographic verification report                     ║
║                                                          ║
║  🔍 VERIFICATION TOOLS                                   ║
║  ─────────────────────────────────────────────────────── ║
║  [Verify Vote Count]                                     ║
║  [Check Blockchain Integrity]                            ║
║  [Cross-Reference Logs]                                  ║
║  [Export All Data]                                       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

#### Transparency Measures
1. **Open source code** (optional): Publish system code on GitHub
2. **Public audit logs** (anonymized): Key events visible to all
3. **Third-party verification**: Allow external security audits
4. **Documentation**: Complete paper trail of procedures
5. **Complaint mechanism**: Process for disputing results

### 7.6 Winner Announcement

#### Official Announcement Process

**Step 1: Internal Verification**
- Election committee reviews results
- DMI Science and Tech Club confirms technical integrity
- University administration approves

**Step 2: Public Announcement**
- **Email to all voters:**
```
Subject: DMI Student Elections 2025 - Official Results

Dear DMI Students,

The results of the DMI St John The Baptist University 
Student Elections 2025 are now official.

WINNERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Student Union President:  John Banda
Vice President:           Mary Chirwa
Secretary General:        Peter Mwale
Treasurer:               Sarah Phiri
[... other positions]

TURNOUT: 41.9% (523 of 1,247 registered voters)

View complete results:
https://voting.dmi.ac.mw/results

Thank you to all candidates and voters for participating
in this democratic process.

The inauguration ceremony will be held on [Date].

Congratulations to all winners!

DMI Student Union Election Committee
DMI Science and Tech Club
```

**Step 3: Campus Announcement**
- Posters at key locations
- Student union social media
- Campus radio/PA system (if available)
- Notice boards

**Step 4: Inauguration Planning**
- Schedule swearing-in ceremony
- Handover procedures
- Orientation for new leaders

---

## 8. Security Framework

### 8.1 Security Principles

The DMI Voting System is built on multiple security layers:

1. **Authentication Security** - Verify voter identity
2. **Authorization Security** - Control access to functions
3. **Data Security** - Protect vote integrity
4. **Network Security** - Secure communications
5. **Physical Security** - Protect equipment
6. **Operational Security** - Secure procedures

### 8.2 Authentication Security

#### Multi-Factor Authentication (MFA)
Every vote requires THREE factors:

**Factor 1: Something you HAVE**
- Physical voting voucher with QR code
- Cannot vote without the voucher
- Voucher is uniquely tied to one email

**Factor 2: Something you KNOW**
- Access to registered email account
- Must enter OTP sent to email
- Code expires after 10 minutes

**Factor 3: Something you ARE** (Optional enhancement)
- Biometric verification (fingerprint, face)
- Can be added for high-security elections
- Requires additional hardware

#### Password and Access Control

**Admin Accounts:**
```
Requirements:
- Minimum 12 characters
- Uppercase + lowercase + numbers + symbols
- Changed every 90 days
- Cannot reuse last 5 passwords
- Two-factor authentication (2FA) mandatory
- Account lockout after 3 failed attempts
```

**Session Management:**
```
- Voting session: 15-minute timeout
- Admin session: 30-minute timeout
- Automatic logout on inactivity
- Session tokens expire after use
- One active session per user
```

### 8.3 Data Security

#### Encryption Standards

**Data at Rest:**
```
Algorithm: AES-256
Key Management: Separate key server
Vote Storage: Each vote encrypted individually
Database: Full database encryption enabled
Backups: Encrypted before storage
```

**Data in Transit:**
```
Protocol: TLS 1.3
Certificate: Valid SSL/TLS certificate
API Calls: HTTPS only
No unencrypted transmission
```

#### Vote Anonymization Process

**How votes are separated from voters:**

```python
# Step 1: Voter authenticates
voter_id = "DMI2025-00123"
email = "john@example.com"
authenticate_voter(voter_id, email)

# Step 2: Vote is cast
vote_data = {
    "president": "candidate_001",
    "vice_president": "candidate_045",
    # ... other positions
}

# Step 3: CRITICAL - Separate identity from vote
verification_code = generate_random_code()  # "DMI-8X4K-9P2L"

# Store vote WITHOUT voter ID
encrypted_vote = encrypt_aes256(vote_data)
store_vote(
    vote=encrypted_vote,
    verification_code=verification_code,
    timestamp=now(),
    # NO voter_id stored here!
)

# Store that voter has voted (separate table)
mark_as_voted(voter_id)  # Just a boolean flag

# Connection is PERMANENTLY broken
# No way to link verification_code back to voter_id
```

**Result:**
- Vote record knows: "Someone voted for John Banda at 10:23 AM"
- Voter record knows: "DMI2025-00123 voted at 10:23 AM"
- **CANNOT connect** which specific vote belongs to which voter
- **CAN verify** that voter's vote exists via verification code

#### Blockchain-Inspired Integrity

**Vote Chain:**
```
Vote 1: hash(vote_1_data + "0")
        └─> Vote 1 Hash: "a3b2c1..."

Vote 2: hash(vote_2_data + "a3b2c1...")
        └─> Vote 2 Hash: "d4e5f6..."

Vote 3: hash(vote_3_data + "d4e5f6...")
        └─> Vote 3 Hash: "g7h8i9..."

If ANY vote is tampered with, the entire chain breaks!
```

**Verification:**
```python
def verify_vote_chain():
    votes = get_all_votes_ordered_by_timestamp()
    previous_hash = "0"  # Genesis
    
    for vote in votes:
        expected_hash = sha256(vote.data + previous_hash)
        
        if expected_hash != vote.stored_hash:
            alert("TAMPERING DETECTED!")
            alert(f"Vote {vote.id} has been modified!")
            return False
        
        previous_hash = vote.stored_hash
    
    return True  # Chain intact
```

### 8.4 Attack Prevention

#### Attack Type 1: Double Voting
**How it's prevented:**
1. Each voucher QR code is unique and one-time use
2. Database enforces UNIQUE constraint on voucher_code
3. System checks `has_voted` flag before allowing authentication
4. Once vote is submitted, flag is set permanently
5. Audit logs track all authentication attempts

**Database constraint:**
```sql
ALTER TABLE voters
ADD CONSTRAINT unique_email UNIQUE (email),
ADD CONSTRAINT unique_voucher UNIQUE (voucher_code);

CREATE TRIGGER prevent_double_vote
BEFORE INSERT ON votes
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM voters 
               WHERE voter_id = NEW.voter_id 
               AND has_voted = TRUE) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Voter has already voted';
    END IF;
END;
```

#### Attack Type 2: Voucher Theft/Fraud
**Scenario:** Someone steals or photographs another student's voucher

**Prevention:**
1. **Email OTP required:** Thief needs access to victim's email
2. **Time window:** Victim can vote first, invalidating stolen voucher
3. **Reporting mechanism:** Victim reports theft, voucher invalidated
4. **Reissue process:** Victim gets new voucher after ID verification

**If theft discovered after voting:**
```
1. Victim reports: "My voucher was stolen and someone voted with it"
2. System checks: Was vote cast before or after report?
3. If after report: Vote flagged for investigation
4. Election committee reviews:
   - Timestamp analysis
   - Email access logs
   - Witness statements
5. Decision: Count vote or issue provisional ballot
```

#### Attack Type 3: Email Hacking
**Scenario:** Attacker hacks student's email to receive OTP

**Prevention:**
1. **Still needs physical voucher:** Email alone isn't enough
2. **Time-limited OTP:** Code expires in 10 minutes
3. **One-time use:** After first use, code is invalid
4. **Alert system:** Student receives email after voting (can detect unauthorized vote)

**Response if detected:**
```
Student: "I received a voting confirmation but I didn't vote!"

Actions:
1. Immediately flag the vote
2. Lock the student's voter record
3. Investigation by election committee
4. Review audit logs for IP address, timestamp, location
5. If confirmed unauthorized: Invalidate vote, issue provisional ballot
6. If suspicious activity: Report to university security
```

#### Attack Type 4: Sys Admin Manipulation
**Scenario:** Rogue system administrator tries to change votes

**Prevention:**
1. **Encryption:** Votes are encrypted; admin can't read them
2. **Blockchain chain:** Changing a vote breaks the cryptographic chain
3. **Audit logs:** All admin actions are logged with timestamps
4. **Multi-admin approval:** Critical actions require two admins
5. **Regular integrity checks:** Automated verification every hour

**Detection:**
```python
# Automated integrity check (runs every hour)
def integrity_check():
    issues = []
    
    # Check 1: Vote chain intact
    if not verify_vote_chain():
        issues.append("CRITICAL: Vote chain broken!")
    
    # Check 2: Vote count matches
    votes_count = count_votes()
    voters_voted_count = count_voters_who_voted()
    if votes_count != voters_voted_count:
        issues.append(f"MISMATCH: {votes_count} votes but {voters_voted_count} voters voted")
    
    # Check 3: No votes outside voting hours
    invalid_timestamps = check_vote_timestamps()
    if invalid_timestamps:
        issues.append(f"ALERT: {len(invalid_timestamps)} votes with invalid timestamps")
    
    # Check 4: No duplicate verification codes
    duplicate_codes = find_duplicate_verification_codes()
    if duplicate_codes:
        issues.append(f"CRITICAL: Duplicate verification codes found")
    
    # Check 5: Admin activity review
    suspicious_admin_actions = check_admin_logs()
    if suspicious_admin_actions:
        issues.append(f"WARNING: {len(suspicious_admin_actions)} suspicious admin actions")
    
    # Alert if issues found
    if issues:
        send_alert_to_all_admins(issues)
        log_integrity_failure(issues)
        return False
    
    log_integrity_success()
    return True
```

**Multi-admin approval for critical operations:**
```python
# Example: Deleting a voter record
def delete_voter_record(voter_id, requesting_admin):
    # Step 1: Create approval request
    request_id = create_approval_request(
        action="DELETE_VOTER",
        target=voter_id,
        requester=requesting_admin,
        requires_approvals=2
    )
    
    # Step 2: Notify other admins
    notify_admins_for_approval(request_id)
    
    # Step 3: Wait for approvals
    # System locks the action until approved
    
    # Step 4: After 2 approvals, action executes
    if get_approvals_count(request_id) >= 2:
        execute_delete(voter_id)
        log_action("Voter deleted", voter_id, [requesting_admin, approvers])
    else:
        log_action("Delete request denied", voter_id)
```

#### Attack Type 5: SQL Injection
**Scenario:** Attacker tries to manipulate database through malicious input

**Prevention:**
1. **Parameterized queries:** Never concatenate user input into SQL
2. **Input validation:** Strict validation of all inputs
3. **ORM usage:** Use Object-Relational Mapping libraries
4. **Least privilege:** Database user has minimal permissions

**Bad (Vulnerable) Code:**
```python
# NEVER DO THIS!
email = request.form['email']
query = f"SELECT * FROM voters WHERE email = '{email}'"
cursor.execute(query)

# Attacker could input: admin@dmi.ac.mw' OR '1'='1
# Result: SELECT * FROM voters WHERE email = 'admin@dmi.ac.mw' OR '1'='1'
# This returns ALL voters!
```

**Good (Secure) Code:**
```python
# ALWAYS DO THIS!
email = request.form['email']
query = "SELECT * FROM voters WHERE email = %s"
cursor.execute(query, (email,))

# Even if attacker inputs malicious string, it's treated as literal text
```

**Additional protection:**
```python
def validate_email(email):
    # Strict regex validation
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError("Invalid email format")
    
    # Length check
    if len(email) > 255:
        raise ValueError("Email too long")
    
    # Sanitize input
    email = email.strip().lower()
    
    return email
```

#### Attack Type 6: Cross-Site Scripting (XSS)
**Scenario:** Attacker injects malicious JavaScript code

**Prevention:**
1. **Output encoding:** Escape all user-generated content
2. **Content Security Policy (CSP):** Restrict what scripts can run
3. **Input sanitization:** Remove dangerous characters
4. **Framework protection:** Use frameworks with built-in XSS protection

**Example:**
```javascript
// Vulnerable code
document.getElementById('candidateName').innerHTML = userInput;

// Attacker input: <script>alert('XSS')</script>
// Result: Script executes!

// Secure code
document.getElementById('candidateName').textContent = userInput;
// OR use a framework like React that escapes by default
```

**CSP Header:**
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' https://cdnjs.cloudflare.com; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:;
```

#### Attack Type 7: Denial of Service (DoS)
**Scenario:** Attacker floods system with requests to make it unavailable

**Prevention:**
1. **Rate limiting:** Limit requests per IP address
2. **CAPTCHA:** For registration and sensitive operations
3. **Load balancing:** Distribute traffic across multiple servers
4. **DDoS protection:** Use Cloudflare or similar services

**Rate limiting implementation:**
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route("/register", methods=["POST"])
@limiter.limit("10 per hour")  # Max 10 registrations per hour per IP
def register_voter():
    # Registration logic
    pass

@app.route("/vote", methods=["POST"])
@limiter.limit("5 per hour")  # Max 5 voting attempts per hour
def cast_vote():
    # Voting logic
    pass
```

#### Attack Type 8: Session Hijacking
**Scenario:** Attacker steals session token to impersonate user

**Prevention:**
1. **Secure cookies:** HTTPOnly, Secure, SameSite flags
2. **Session expiration:** Short-lived sessions
3. **Token rotation:** New token after sensitive operations
4. **IP binding:** Tie session to IP address (optional)

**Secure session configuration:**
```python
app.config.update(
    SESSION_COOKIE_SECURE=True,      # HTTPS only
    SESSION_COOKIE_HTTPONLY=True,    # Not accessible via JavaScript
    SESSION_COOKIE_SAMESITE='Lax',   # CSRF protection
    PERMANENT_SESSION_LIFETIME=1800  # 30 minutes
)

# Additional check: Verify user agent
def verify_session(session_token):
    session = get_session(session_token)
    
    if session.user_agent != request.headers.get('User-Agent'):
        # Session hijacking suspected
        invalidate_session(session_token)
        log_security_event("Session hijacking attempt")
        return False
    
    return True
```

### 8.5 Network Security

#### Secure Communication
```
All traffic encrypted with TLS 1.3:
Client ←[HTTPS]→ Load Balancer ←[HTTPS]→ Application Server
                                              ↓ [Encrypted]
                                         Database Server
```

#### Firewall Rules
```
Incoming:
- Port 443 (HTTPS): ALLOW from anywhere
- Port 80 (HTTP): REDIRECT to 443
- Port 22 (SSH): ALLOW from admin IPs only
- Port 3306 (MySQL): ALLOW from app server only
- All other ports: DENY

Outgoing:
- Port 443 (HTTPS): ALLOW (for email, APIs)
- Port 587 (SMTP): ALLOW (for email)
- All other ports: DENY by default
```

#### Database Security
```sql
-- Create dedicated database user with minimal privileges
CREATE USER 'dmi_voting_app'@'localhost' 
IDENTIFIED BY 'strong_password_here';

-- Grant only necessary permissions
GRANT SELECT, INSERT, UPDATE ON dmi_voting.voters TO 'dmi_voting_app'@'localhost';
GRANT SELECT, INSERT ON dmi_voting.votes TO 'dmi_voting_app'@'localhost';
GRANT SELECT ON dmi_voting.candidates TO 'dmi_voting_app'@'localhost';
GRANT SELECT ON dmi_voting.positions TO 'dmi_voting_app'@'localhost';
GRANT INSERT ON dmi_voting.audit_logs TO 'dmi_voting_app'@'localhost';

-- NO DELETE permissions
-- NO DROP permissions
-- NO ALTER permissions

FLUSH PRIVILEGES;
```

### 8.6 Physical Security

#### Polling Station Security
1. **Equipment security:**
   - Devices locked to tables with security cables
   - Devices password-protected
   - No USB ports accessible to voters
   - Cameras monitoring equipment (not screens)

2. **Voucher security:**
   - Printed vouchers stored in locked cabinet
   - Numbered and accounted for like exam papers
   - Distribution logged in physical logbook
   - Unused vouchers collected and destroyed

3. **Personnel security:**
   - All officials wear identification badges
   - Background checks for key personnel (optional)
   - Training on security protocols
   - Supervision by multiple officials

#### Server Security
1. **Physical access:**
   - Server room locked and monitored
   - Access log for entry/exit
   - Limited access to authorized personnel only

2. **Backup security:**
   - Daily backups to encrypted external storage
   - Backup storage in separate physical location
   - Test restores performed weekly

### 8.7 Incident Response Plan

#### Incident Classification

**Level 1: Minor (Green)**
- Single device malfunction
- Individual voter issue
- Temporary internet disruption
- **Response:** On-site resolution by poll workers

**Level 2: Moderate (Yellow)**
- Multiple device failures
- Extended internet outage
- Suspected attempted fraud (unsuccessful)
- **Response:** Supervisor intervention, notify tech team

**Level 3: Serious (Orange)**
- System-wide technical failure
- Confirmed voter fraud
- Data integrity concerns
- **Response:** Election committee convened, possible pause

**Level 4: Critical (Red)**
- Database compromise
- Vote tampering confirmed
- Security breach
- **Response:** Election suspended, full investigation

#### Response Procedures

**For Technical Issues:**
```
1. Document the issue immediately
   - What happened?
   - When did it start?
   - Which systems affected?
   - How many users impacted?

2. Contain the issue
   - Isolate affected systems
   - Switch to backup systems
   - Prevent spread

3. Notify stakeholders
   - Tech team (immediate)
   - Election committee (within 15 minutes)
   - Affected voters (if needed)

4. Implement fix
   - Apply solution
   - Test thoroughly
   - Restore normal operations

5. Post-incident review
   - Document root cause
   - Update procedures
   - Implement preventive measures
```

**For Security Incidents:**
```
1. Immediate actions
   - Lock affected accounts
   - Preserve evidence (don't delete logs)
   - Isolate compromised systems
   - Alert security team

2. Investigation
   - Review audit logs
   - Interview witnesses
   - Assess damage
   - Identify vulnerabilities

3. Remediation
   - Fix security holes
   - Change compromised credentials
   - Restore from clean backups if needed

4. Communication
   - Inform election committee
   - Notify affected users if personal data compromised
   - Public statement if necessary

5. Prevention
   - Update security policies
   - Additional training
   - Enhanced monitoring
```

#### Emergency Contacts
```
╔═══════════════════════════════════════════════════════╗
║  EMERGENCY CONTACT LIST                               ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  Technical Issues:                                    ║
║  DMI Science & Tech Club Lead: +265 XXX XXX XXX      ║
║  System Administrator: +265 XXX XXX XXX              ║
║  Email: voting@dmi.ac.mw                             ║
║                                                       ║
║  Security Incidents:                                  ║
║  Election Committee Chair: +265 XXX XXX XXX          ║
║  University Security: +265 XXX XXX XXX               ║
║                                                       ║
║  Infrastructure Issues:                               ║
║  IT Department: +265 XXX XXX XXX                     ║
║  Facilities Management: +265 XXX XXX XXX             ║
║                                                       ║
║  Medical Emergency:                                   ║
║  Campus Clinic: +265 XXX XXX XXX                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

## 9. Technical Specifications

### 9.1 System Requirements

#### Server Requirements

**Minimum Specifications:**
```
Operating System: Ubuntu 20.04 LTS or later
Processor: 4 cores, 2.5 GHz
RAM: 8 GB
Storage: 100 GB SSD
Network: 100 Mbps connection
```

**Recommended Specifications:**
```
Operating System: Ubuntu 22.04 LTS
Processor: 8 cores, 3.0 GHz
RAM: 16 GB
Storage: 250 GB SSD (with RAID 1)
Network: 1 Gbps connection
Backup: Separate backup server or cloud storage
```

#### Client Requirements (Voting Devices)

**Tablets/Laptops:**
```
Operating System: Windows 10/11, macOS 11+, or Android 9+
Processor: Dual-core, 1.5 GHz minimum
RAM: 4 GB minimum
Storage: 32 GB
Display: 10-inch minimum (for comfortable viewing)
Camera: For QR code scanning
Network: WiFi capability
Battery: Minimum 4 hours (with backup power)
```

**Browsers Supported:**
```
- Google Chrome 90+
- Mozilla Firefox 88+
- Safari 14+
- Microsoft Edge 90+
```

#### Network Requirements
```
Bandwidth Planning:
- Per device: 1-2 Mbps
- 10 devices: 20 Mbps
- 20 devices: 40 Mbps
- Add 50% overhead: 60 Mbps recommended for 20 devices

Latency: < 100ms
Uptime: 99.9% during election hours
Backup: 4G/5G mobile hotspot (50 Mbps minimum)
```

### 9.2 Software Architecture

#### Backend Stack

**Option A: Python/Django**
```
Framework: Django 4.2+
Database: PostgreSQL 14+ or MySQL 8.0+
Web Server: Gunicorn + Nginx
Task Queue: Celery (for email sending)
Message Broker: Redis
Encryption: cryptography library
QR Code: qrcode library
Email: Django email backend + SMTP
```

**Project Structure:**
```
dmi_voting/
├── manage.py
├── requirements.txt
├── dmi_voting/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── registration/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── voting/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
├── authentication/
│   ├── models.py
│   ├── views.py
│   └── utils.py
├── results/
│   ├── models.py
│   ├── views.py
│   └── calculations.py
├── security/
│   ├── encryption.py
│   ├── blockchain.py
│   └── audit.py
└── templates/
    ├── registration/
    ├── voting/
    └── results/
```

**Option B: Node.js/Express**
```
Framework: Express.js 4.18+
Database: PostgreSQL 14+ with Sequelize ORM
Web Server: PM2 + Nginx
Email: Nodemailer
Encryption: crypto (built-in) + bcrypt
QR Code: qrcode npm package
Task Queue: Bull (Redis-based)
```

#### Frontend Stack

**React-based Implementation:**
```
Framework: React 18+
State Management: Redux Toolkit
Routing: React Router 6+
Styling: Tailwind CSS
QR Scanner: html5-qrcode
HTTP Client: Axios
Form Handling: Formik + Yup validation
Charts: Recharts
```

**Component Structure:**
```
src/
├── components/
│   ├── Registration/
│   │   ├── RegistrationForm.jsx
│   │   ├── VoucherDisplay.jsx
│   │   └── RegistrationStats.jsx
│   ├── Voting/
│   │   ├── QRScanner.jsx
│   │   ├── OTPInput.jsx
│   │   ├── Ballot.jsx
│   │   ├── CandidateCard.jsx
│   │   └── ReviewBallot.jsx
│   ├── Results/
│   │   ├── ResultsDisplay.jsx
│   │   ├── PositionResults.jsx
│   │   ├── Charts.jsx
│   │   └── VerificationPortal.jsx
│   └── Admin/
│       ├── Dashboard.jsx
│       ├── Statistics.jsx
│       └── AuditLogs.jsx
├── services/
│   ├── api.js
│   ├── auth.js
│   └── encryption.js
├── store/
│   ├── store.js
│   ├── votingSlice.js
│   └── authSlice.js
└── utils/
    ├── validation.js
    └── helpers.js
```

### 9.3 Database Schema (Complete)

```sql
-- =====================================================
-- DMI VOTING SYSTEM DATABASE SCHEMA
-- Version: 1.0
-- Database: dmi_voting
-- =====================================================

-- Table: voters
CREATE TABLE voters (
    voter_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    id_type VARCHAR(50),
    id_number VARCHAR(100),
    voucher_code VARCHAR(100) UNIQUE NOT NULL,
    qr_hash VARCHAR(256) UNIQUE NOT NULL,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    registration_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registration_location VARCHAR(100),
    has_voted BOOLEAN DEFAULT FALSE,
    voted_timestamp TIMESTAMP NULL,
    status ENUM('active', 'revoked', 'reissued') DEFAULT 'active',
    created_by VARCHAR(50),
    INDEX idx_email (email),
    INDEX idx_voucher (voucher_code),
    INDEX idx_has_voted (has_voted)
);

-- Table: positions
CREATE TABLE positions (
    position_id VARCHAR(50) PRIMARY KEY,
    position_name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: candidates
CREATE TABLE candidates (
    candidate_id VARCHAR(50) PRIMARY KEY,
    position_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(50),
    faculty VARCHAR(100),
    photo_url VARCHAR(500),
    bio TEXT,
    manifesto TEXT,
    display_order INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE CASCADE,
    INDEX idx_position (position_id)
);

-- Table: votes
CREATE TABLE votes (
    vote_id VARCHAR(50) PRIMARY KEY,
    position_id VARCHAR(50) NOT NULL,
    candidate_id VARCHAR(50) NOT NULL,
    encrypted_vote TEXT NOT NULL,
    vote_hash VARCHAR(256) NOT NULL UNIQUE,
    previous_vote_hash VARCHAR(256),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    polling_station VARCHAR(100),
    verification_code VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (position_id) REFERENCES positions(position_id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
    INDEX idx_verification (verification_code),
    INDEX idx_timestamp (timestamp),
    INDEX idx_position_candidate (position_id, candidate_id)
);

-- Table: otp_codes
CREATE TABLE otp_codes (
    otp_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voter_id VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    attempts INT DEFAULT 0,
    ip_address VARCHAR(45),
    FOREIGN KEY (voter_id) REFERENCES voters(voter_id) ON DELETE CASCADE,
    INDEX idx_voter_code (voter_id, code),
    INDEX idx_expires (expires_at)
);

-- Table: audit_logs
CREATE TABLE audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL,
    user_type ENUM('voter', 'admin', 'system') NOT NULL,
    user_id VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('success', 'failure', 'warning') NOT NULL,
    INDEX idx_timestamp (timestamp),
    INDEX idx_event_type (event_type),
    INDEX idx_user (user_id)
);

-- Table: admin_users
CREATE TABLE admin_users (
    admin_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'election_admin', 'poll_worker') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
);

-- Table: sessions
CREATE TABLE sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_type ENUM('voter', 'admin') NOT NULL,
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);

-- Table: system_config
CREATE TABLE system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(50)
);

-- Table: integrity_checks
CREATE TABLE integrity_checks (
    check_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    check_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_type VARCHAR(50) NOT NULL,
    status ENUM('passed', 'failed', 'warning') NOT NULL,
    details TEXT,
    issues_found INT DEFAULT 0,
    INDEX idx_timestamp (check_timestamp),
    INDEX idx_status (status)
);

-- Table: incidents
CREATE TABLE incidents (
    incident_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    incident_type VARCHAR(100) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    description TEXT NOT NULL,
    reported_by VARCHAR(50),
    location VARCHAR(100),
    status ENUM('open', 'investigating', 'resolved', 'closed') DEFAULT 'open',
    resolution TEXT,
    resolved_at TIMESTAMP NULL,
    INDEX idx_severity (severity),
    INDEX idx_status (status)
);

-- Table: voucher_reissues
CREATE TABLE voucher_reissues (
    reissue_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voter_id VARCHAR(50) NOT NULL,
    old_voucher_code VARCHAR(100) NOT NULL,
    new_voucher_code VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(50),
    FOREIGN KEY (voter_id) REFERENCES voters(voter_id),
    INDEX idx_voter (voter_id)
);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert system configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('voting_enabled', 'false', 'Whether voting is currently enabled'),
('registration_enabled', 'true', 'Whether voter registration is enabled'),
('voting_start_time', '2025-09-30 08:00:00', 'When voting begins'),
('voting_end_time', '2025-09-30 17:00:00', 'When voting ends'),
('election_name', 'DMI Student Elections 2025', 'Name of current election'),
('results_published', 'false', 'Whether results have been published');

-- Insert sample positions (EXAMPLE - customize for your election)
INSERT INTO positions (position_id, position_name, description, display_order) VALUES
('POS001', 'Student Union President', 'Chief executive officer of the student union', 1),
('POS002', 'Vice President', 'Deputy to the president', 2),
('POS003', 'Secretary General', 'Responsible for documentation and communication', 3),
('POS004', 'Treasurer', 'Manages student union finances', 4),
('POS005', 'Sports Secretary', 'Coordinates sports and recreation activities', 5),
('POS006', 'Academic Secretary', 'Advocates for academic issues', 6);

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure: Register a new voter
DELIMITER //
CREATE PROCEDURE register_voter(
    IN p_full_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_phone VARCHAR(20),
    IN p_id_type VARCHAR(50),
    IN p_id_number VARCHAR(100),
    IN p_location VARCHAR(100),
    IN p_admin_id VARCHAR(50),
    OUT p_voter_id VARCHAR(50),
    OUT p_voucher_code VARCHAR(100),
    OUT p_serial_number VARCHAR(50)
)
BEGIN
    DECLARE v_voter_id VARCHAR(50);
    DECLARE v_voucher VARCHAR(100);
    DECLARE v_serial VARCHAR(50);
    DECLARE v_qr_hash VARCHAR(256);
    
    -- Generate unique voter ID
    SET v_voter_id = CONCAT('DMI2025-', LPAD(FLOOR(RAND() * 99999), 5, '0'));
    
    -- Generate unique voucher code
    SET v_voucher = CONCAT('VC-', UUID());
    
    -- Generate serial number
    SET v_serial = CONCAT('SN-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
    
    -- Generate QR hash
    SET v_qr_hash = SHA2(CONCAT(v_voucher, v_voter_id, NOW()), 256);
    
    -- Insert voter record
    INSERT INTO voters (
        voter_id, full_name, email, phone, id_type, id_number,
        voucher_code, qr_hash, serial_number, registration_location, created_by
    ) VALUES (
        v_voter_id, p_full_name, p_email, p_phone, p_id_type, p_id_number,
        v_voucher, v_qr_hash, v_serial, p_location, p_admin_id
    );
    
    -- Log the registration
    INSERT INTO audit_logs (event_type, user_type, user_id, action, status)
    VALUES ('VOTER_REGISTRATION', 'admin', p_admin_id, 
            CONCAT('Registered voter: ', v_voter_id), 'success');
    
    -- Return values
    SET p_voter_id = v_voter_id;
    SET p_voucher_code = v_voucher;
    SET p_serial_number = v_serial;
END //
DELIMITER ;

-- Procedure: Cast a vote
DELIMITER //
CREATE PROCEDURE cast_vote(
    IN p_voter_id VARCHAR(50),
    IN p_votes_json JSON,
    IN p_polling_station VARCHAR(100),
    OUT p_verification_code VARCHAR(20),
    OUT p_success BOOLEAN
)
BEGIN
    DECLARE v_verification_code VARCHAR(20);
    DECLARE v_previous_hash VARCHAR(256);
    DECLARE v_vote_id VARCHAR(50);
    DECLARE v_position_id VARCHAR(50);
    DECLARE v_candidate_id VARCHAR(50);
    DECLARE v_encrypted_vote TEXT;
    DECLARE v_vote_hash VARCHAR(256);
    DECLARE v_index INT DEFAULT 0;
    DECLARE v_array_length INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
    END;
    
    START TRANSACTION;
    
    -- Check if voter has already voted
    IF (SELECT has_voted FROM voters WHERE voter_id = p_voter_id) = TRUE THEN
        ROLLBACK;
        SET p_success = FALSE;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Voter has already voted';
    END IF;
    
    -- Generate verification code
    SET v_verification_code = CONCAT('DMI-', 
        SUBSTRING(MD5(RAND()), 1, 4), '-',
        SUBSTRING(MD5(RAND()), 1, 4), '-',
        SUBSTRING(MD5(RAND()), 1, 4));
    
    -- Get the last vote hash for blockchain
    SELECT vote_hash INTO v_previous_hash 
    FROM votes 
    ORDER BY timestamp DESC 
    LIMIT 1;
    
    IF v_previous_hash IS NULL THEN
        SET v_previous_hash = '0';  -- Genesis block
    END IF;
    
    -- Get array length
    SET v_array_length = JSON_LENGTH(p_votes_json);
    
 -- Insert votes for each position
    WHILE v_index < v_array_length DO
        SET v_position_id = JSON_UNQUOTE(JSON_EXTRACT(p_votes_json, CONCAT('$[', v_index, '].position_id')));
        SET v_candidate_id = JSON_UNQUOTE(JSON_EXTRACT(p_votes_json, CONCAT('$[', v_index, '].candidate_id')));
        
        -- Generate unique vote ID
        SET v_vote_id = CONCAT('V-', UUID());
        
        -- Encrypt vote (in production, use proper encryption)
        SET v_encrypted_vote = AES_ENCRYPT(
            JSON_OBJECT('position', v_position_id, 'candidate', v_candidate_id),
            'encryption_key_here'  -- In production, use secure key management
        );
        
        -- Calculate vote hash (blockchain-style)
        SET v_vote_hash = SHA2(CONCAT(v_encrypted_vote, v_previous_hash, NOW()), 256);
        
        -- Insert the vote
        INSERT INTO votes (
            vote_id, position_id, candidate_id, encrypted_vote, 
            vote_hash, previous_vote_hash, polling_station, verification_code
        ) VALUES (
            v_vote_id, v_position_id, v_candidate_id, v_encrypted_vote,
            v_vote_hash, v_previous_hash, p_polling_station, v_verification_code
        );
        
        -- Update previous hash for next iteration
        SET v_previous_hash = v_vote_hash;
        SET v_index = v_index + 1;
    END WHILE;
    
    -- Mark voter as having voted
    UPDATE voters 
    SET has_voted = TRUE, voted_timestamp = NOW() 
    WHERE voter_id = p_voter_id;
    
    -- Log the vote
    INSERT INTO audit_logs (event_type, user_type, user_id, action, status)
    VALUES ('VOTE_CAST', 'voter', p_voter_id, 
            CONCAT('Vote cast at ', p_polling_station), 'success');
    
    COMMIT;
    
    -- Return values
    SET p_verification_code = v_verification_code;
    SET p_success = TRUE;
END //
DELIMITER ;

-- Procedure: Verify vote integrity (blockchain check)
DELIMITER //
CREATE PROCEDURE verify_vote_integrity(
    OUT p_is_valid BOOLEAN,
    OUT p_issues TEXT
)
BEGIN
    DECLARE v_expected_hash VARCHAR(256);
    DECLARE v_actual_hash VARCHAR(256);
    DECLARE v_previous_hash VARCHAR(256);
    DECLARE v_encrypted_vote TEXT;
    DECLARE v_vote_id VARCHAR(50);
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_issues TEXT DEFAULT '';
    DECLARE v_is_valid BOOLEAN DEFAULT TRUE;
    
    DECLARE vote_cursor CURSOR FOR 
        SELECT vote_id, encrypted_vote, vote_hash, previous_vote_hash 
        FROM votes 
        ORDER BY timestamp ASC;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    OPEN vote_cursor;
    
    read_loop: LOOP
        FETCH vote_cursor INTO v_vote_id, v_encrypted_vote, v_actual_hash, v_previous_hash;
        IF v_done THEN
            LEAVE read_loop;
        END IF;
        
        -- Calculate expected hash
        SET v_expected_hash = SHA2(CONCAT(v_encrypted_vote, v_previous_hash), 256);
        
        -- Compare hashes
        IF v_expected_hash != v_actual_hash THEN
            SET v_is_valid = FALSE;
            SET v_issues = CONCAT(v_issues, 'Vote ', v_vote_id, ' has invalid hash; ');
        END IF;
    END LOOP;
    
    CLOSE vote_cursor;
    
    SET p_is_valid = v_is_valid;
    SET p_issues = v_issues;
END //
DELIMITER ;

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View: Current election results
CREATE VIEW election_results AS
SELECT 
    p.position_name,
    p.display_order,
    c.candidate_id,
    c.full_name AS candidate_name,
    c.faculty,
    COUNT(v.vote_id) AS vote_count,
    ROUND(COUNT(v.vote_id) * 100.0 / (
        SELECT COUNT(*) 
        FROM votes v2 
        WHERE v2.position_id = p.position_id
    ), 2) AS vote_percentage
FROM positions p
JOIN candidates c ON p.position_id = c.position_id
LEFT JOIN votes v ON c.candidate_id = v.candidate_id
GROUP BY p.position_id, c.candidate_id
ORDER BY p.display_order, vote_count DESC;

-- View: Voter turnout statistics
CREATE VIEW voter_turnout AS
SELECT 
    COUNT(*) AS total_registered,
    SUM(CASE WHEN has_voted THEN 1 ELSE 0 END) AS total_voted,
    ROUND(SUM(CASE WHEN has_voted THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS turnout_percentage,
    COUNT(CASE WHEN has_voted AND DATE(voted_timestamp) = CURDATE() THEN 1 END) AS voted_today
FROM voters
WHERE status = 'active';

-- View: Hourly voting statistics
CREATE VIEW hourly_voting_stats AS
SELECT 
    DATE(voted_timestamp) AS vote_date,
    HOUR(voted_timestamp) AS vote_hour,
    COUNT(*) AS votes_count
FROM voters
WHERE has_voted = TRUE
GROUP BY DATE(voted_timestamp), HOUR(voted_timestamp)
ORDER BY vote_date, vote_hour;

-- View: Audit log summary
CREATE VIEW audit_summary AS
SELECT 
    DATE(timestamp) AS log_date,
    event_type,
    user_type,
    status,
    COUNT(*) AS event_count
FROM audit_logs
GROUP BY DATE(timestamp), event_type, user_type, status
ORDER BY log_date DESC, event_count DESC;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Prevent vote modification
DELIMITER //
CREATE TRIGGER prevent_vote_update
BEFORE UPDATE ON votes
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Votes cannot be modified after submission';
END //
DELIMITER ;

-- Trigger: Prevent vote deletion
DELIMITER //
CREATE TRIGGER prevent_vote_delete
BEFORE DELETE ON votes
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Votes cannot be deleted';
END //
DELIMITER ;

-- Trigger: Log voter status changes
DELIMITER //
CREATE TRIGGER log_voter_changes
AFTER UPDATE ON voters
FOR EACH ROW
BEGIN
    IF OLD.has_voted != NEW.has_voted THEN
        INSERT INTO audit_logs (event_type, user_type, user_id, action, status)
        VALUES ('VOTER_STATUS_CHANGE', 'system', NEW.voter_id, 
                CONCAT('Voter status changed from ', OLD.has_voted, ' to ', NEW.has_voted), 
                'success');
    END IF;
END //
DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_votes_timestamp ON votes(timestamp);
CREATE INDEX idx_votes_position_candidate ON votes(position_id, candidate_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_event ON audit_logs(event_type, status);
CREATE INDEX idx_voters_voted ON voters(has_voted, voted_timestamp);
```

### 9.4 API Endpoints

#### Authentication Endpoints

**1. Scan Voucher**
```
POST /api/auth/scan-voucher
Request:
{
    "voucher_code": "VC-550e8400-e29b-41d4-a716-446655440000",
    "serial_number": "SN-458921"  // Optional fallback
}

Response (Success):
{
    "success": true,
    "voter_id": "DMI2025-00123",
    "email_masked": "j***n@gmail.com",
    "has_voted": false,
    "message": "Voucher verified. OTP will be sent to your email."
}

Response (Already Voted):
{
    "success": false,
    "error": "ALREADY_VOTED",
    "message": "This voucher has already been used to vote.",
    "voted_at": "2025-09-30T10:23:15Z"
}

Response (Invalid):
{
    "success": false,
    "error": "INVALID_VOUCHER",
    "message": "This voucher is not valid."
}
```

**2. Send OTP**
```
POST /api/auth/send-otp
Request:
{
    "voter_id": "DMI2025-00123"
}

Response:
{
    "success": true,
    "message": "OTP sent to registered email",
    "expires_in": 600  // seconds
}
```

**3. Verify OTP**
```
POST /api/auth/verify-otp
Request:
{
    "voter_id": "DMI2025-00123",
    "otp_code": "847293"
}

Response (Success):
{
    "success": true,
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2025-09-30T11:00:00Z",
    "message": "Authentication successful"
}

Response (Invalid):
{
    "success": false,
    "error": "INVALID_OTP",
    "message": "Incorrect verification code",
    "attempts_remaining": 2
}

Response (Expired):
{
    "success": false,
    "error": "OTP_EXPIRED",
    "message": "Verification code has expired. Request a new one."
}
```

#### Voting Endpoints

**4. Get Ballot**
```
GET /api/voting/ballot
Headers:
{
    "Authorization": "Bearer <session_token>"
}

Response:
{
    "success": true,
    "positions": [
        {
            "position_id": "POS001",
            "position_name": "Student Union President",
            "description": "Chief executive officer of the student union",
            "candidates": [
                {
                    "candidate_id": "CAND001",
                    "full_name": "John Banda",
                    "faculty": "Engineering",
                    "photo_url": "https://cdn.dmi.ac.mw/photos/john_banda.jpg",
                    "bio": "...",
                    "manifesto": "..."
                },
                {
                    "candidate_id": "CAND002",
                    "full_name": "Mary Chirwa",
                    "faculty": "Business",
                    "photo_url": "https://cdn.dmi.ac.mw/photos/mary_chirwa.jpg",
                    "bio": "...",
                    "manifesto": "..."
                }
            ]
        },
        // ... other positions
    ]
}
```

**5. Submit Vote**
```
POST /api/voting/submit
Headers:
{
    "Authorization": "Bearer <session_token>"
}

Request:
{
    "votes": [
        {
            "position_id": "POS001",
            "candidate_id": "CAND001"
        },
        {
            "position_id": "POS002",
            "candidate_id": "CAND045"
        },
        {
            "position_id": "POS003",
            "candidate_id": "ABSTAIN"  // Abstention
        }
        // ... other positions
    ]
}

Response (Success):
{
    "success": true,
    "verification_code": "DMI-8X4K-9P2L",
    "message": "Your vote has been successfully recorded",
    "timestamp": "2025-09-30T10:23:15Z"
}

Response (Error):
{
    "success": false,
    "error": "VALIDATION_ERROR",
    "message": "Missing vote for required position: Vice President"
}
```

#### Results Endpoints

**6. Verify Vote**
```
POST /api/results/verify
Request:
{
    "verification_code": "DMI-8X4K-9P2L"
}

Response (Success):
{
    "success": true,
    "verified": true,
    "vote_timestamp": "2025-09-30T10:23:15Z",
    "polling_station": "Main Campus",
    "positions_voted": 6,
    "message": "Your vote has been counted in the election"
}

Response (Not Found):
{
    "success": false,
    "verified": false,
    "message": "Verification code not found"
}
```

**7. Get Results**
```
GET /api/results/election

Response:
{
    "success": true,
    "election_name": "DMI Student Elections 2025",
    "election_date": "2025-09-30",
    "status": "closed",
    "results_published": true,
    "total_registered": 1247,
    "total_voted": 523,
    "turnout_percentage": 41.93,
    "positions": [
        {
            "position_id": "POS001",
            "position_name": "Student Union President",
            "total_votes": 523,
            "abstentions": 12,
            "candidates": [
                {
                    "candidate_id": "CAND001",
                    "candidate_name": "John Banda",
                    "votes": 245,
                    "percentage": 46.85,
                    "is_winner": true
                },
                {
                    "candidate_id": "CAND002",
                    "candidate_name": "Mary Chirwa",
                    "votes": 178,
                    "percentage": 34.03,
                    "is_winner": false
                },
                {
                    "candidate_id": "CAND003",
                    "candidate_name": "Peter Mwale",
                    "votes": 100,
                    "percentage": 19.12,
                    "is_winner": false
                }
            ]
        }
        // ... other positions
    ]
}
```

#### Admin Endpoints

**8. Get Dashboard Statistics**
```
GET /api/admin/dashboard
Headers:
{
    "Authorization": "Bearer <admin_token>"
}

Response:
{
    "success": true,
    "statistics": {
        "total_registered": 1247,
        "total_voted": 523,
        "currently_voting": 12,
        "turnout_percentage": 41.93,
        "average_voting_time": 3.5,
        "peak_hour": {
            "hour": 10,
            "votes": 145
        },
        "by_polling_station": [
            {
                "station": "Main Campus",
                "votes": 234,
                "status": "online"
            },
            {
                "station": "Science Faculty",
                "votes": 156,
                "status": "online"
            },
            {
                "station": "Student Center",
                "votes": 133,
                "status": "online"
            }
        ],
        "recent_activity": [
            {
                "timestamp": "2025-09-30T10:23:15Z",
                "event": "Vote cast",
                "location": "Main Campus"
            }
            // ... more recent events
        ]
    }
}
```

**9. Get Audit Logs**
```
GET /api/admin/audit-logs?page=1&limit=50&event_type=VOTE_CAST
Headers:
{
    "Authorization": "Bearer <admin_token>"
}

Response:
{
    "success": true,
    "total_records": 1523,
    "page": 1,
    "limit": 50,
    "logs": [
        {
            "log_id": 12345,
            "timestamp": "2025-09-30T10:23:15Z",
            "event_type": "VOTE_CAST",
            "user_type": "voter",
            "user_id": "DMI2025-00123",
            "action": "Vote cast at Main Campus",
            "status": "success",
            "ip_address": "192.168.1.100"
        }
        // ... more logs
    ]
}
```

**10. Run Integrity Check**
```
POST /api/admin/integrity-check
Headers:
{
    "Authorization": "Bearer <admin_token>"
}

Response:
{
    "success": true,
    "check_timestamp": "2025-09-30T11:00:00Z",
    "results": {
        "vote_chain_intact": true,
        "vote_count_match": true,
        "timestamp_validation": true,
        "duplicate_codes": false,
        "issues_found": 0,
        "details": "All integrity checks passed successfully"
    }
}
```

### 9.5 Encryption Implementation

#### Vote Encryption (Python Example)

```python
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
import json
import base64
import os

class VoteEncryption:
    def __init__(self, master_password):
        """Initialize encryption with master password"""
        # Derive key from master password
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'dmi_voting_salt_2025',  # In production, use unique salt per installation
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(master_password.encode()))
        self.cipher = Fernet(key)
    
    def encrypt_vote(self, vote_data):
        """
        Encrypt vote data
        
        Args:
            vote_data: dict with position_id and candidate_id
        
        Returns:
            Encrypted string
        """
        # Convert to JSON
        json_data = json.dumps(vote_data)
        
        # Encrypt
        encrypted = self.cipher.encrypt(json_data.encode())
        
        # Return as string
        return encrypted.decode()
    
    def decrypt_vote(self, encrypted_vote):
        """
        Decrypt vote data (should only be used for counting)
        
        Args:
            encrypted_vote: Encrypted string
        
        Returns:
            Original vote dict
        """
        # Decrypt
        decrypted = self.cipher.decrypt(encrypted_vote.encode())
        
        # Parse JSON
        vote_data = json.loads(decrypted.decode())
        
        return vote_data

# Usage example
encryptor = VoteEncryption("super_secret_master_password_here")

vote = {
    "position_id": "POS001",
    "candidate_id": "CAND001"
}

encrypted = encryptor.encrypt_vote(vote)
print(f"Encrypted: {encrypted}")

decrypted = encryptor.decrypt_vote(encrypted)
print(f"Decrypted: {decrypted}")
```

#### Blockchain-Style Hash Chain (Python Example)

```python
import hashlib
import json
from datetime import datetime

class VoteChain:
    def __init__(self):
        self.chain = []
        self.previous_hash = "0"  # Genesis block
    
    def calculate_hash(self, vote_data, previous_hash, timestamp):
        """Calculate SHA-256 hash of vote"""
        data_string = json.dumps({
            "vote": vote_data,
            "previous_hash": previous_hash,
            "timestamp": timestamp
        }, sort_keys=True)
        
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    def add_vote(self, encrypted_vote):
        """Add a vote to the chain"""
        timestamp = datetime.utcnow().isoformat()
        
        vote_hash = self.calculate_hash(
            encrypted_vote,
            self.previous_hash,
            timestamp
        )
        
        vote_block = {
            "encrypted_vote": encrypted_vote,
            "hash": vote_hash,
            "previous_hash": self.previous_hash,
            "timestamp": timestamp
        }
        
        self.chain.append(vote_block)
        self.previous_hash = vote_hash
        
        return vote_hash
    
    def verify_chain(self):
        """Verify integrity of entire chain"""
        previous_hash = "0"
        
        for block in self.chain:
            # Recalculate hash
            expected_hash = self.calculate_hash(
                block["encrypted_vote"],
                previous_hash,
                block["timestamp"]
            )
            
            # Compare with stored hash
            if expected_hash != block["hash"]:
                return False, f"Block {block['hash']} has been tampered with"
            
            # Check previous hash link
            if block["previous_hash"] != previous_hash:
                return False, f"Chain broken at block {block['hash']}"
            
            previous_hash = block["hash"]
        
        return True, "Chain is intact"

# Usage example
chain = VoteChain()

# Add votes
chain.add_vote("encrypted_vote_1")
chain.add_vote("encrypted_vote_2")
chain.add_vote("encrypted_vote_3")

# Verify integrity
is_valid, message = chain.verify_chain()
print(f"Chain valid: {is_valid}, Message: {message}")

# Attempt tampering
chain.chain[1]["encrypted_vote"] = "tampered_data"

# Verify again
is_valid, message = chain.verify_chain()
print(f"Chain valid: {is_valid}, Message: {message}")
# Output: Chain valid: False, Message: Block ... has been tampered with
```

### 9.6 QR Code Generation

#### Python Implementation

```python
import qrcode
import io
from PIL import Image

class VoucherQRGenerator:
    def __init__(self):
        self.qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
    
    def generate_qr(self, voucher_code, voter_id):
        """
        Generate QR code for voting voucher
        
        Args:
            voucher_code: Unique voucher code
            voter_id: Voter's ID
        
        Returns:
            PIL Image object
        """
        # Create data string
        qr_data = json.dumps({
            "voucher": voucher_code,
            "voter_id": voter_id,
            "system": "DMI_VOTING_2025"
        })
        
        # Generate QR code
        self.qr.clear()
        self.qr.add_data(qr_data)
        self.qr.make(fit=True)
        
        # Create image
        img = self.qr.make_image(fill_color="black", back_color="white")
        
        return img
    
    def generate_voucher_image(self, voter_id, voucher_code, serial_number):
        """
        Generate complete voucher with QR code and text
        
        Returns:
            PIL Image object ready for printing
        """
        # Create blank voucher (A6 size: 1050x1485 pixels at 300 DPI)
        voucher = Image.new('RGB', (1050, 1485), 'white')
        draw = ImageDraw.Draw(voucher)
        
        # Add header
        header_font = ImageFont.truetype("arial.ttf", 60)
        draw.text((525, 100), "DMI VOTING SYSTEM 2025", 
                  font=header_font, fill='black', anchor="mm")
        
        draw.text((525, 180), "OFFICIAL VOTING VOUCHER", 
                  font=ImageFont.truetype("arial.ttf", 40), 
                  fill='black', anchor="mm")
        
        # Generate and add QR code
        qr_img = self.generate_qr(voucher_code, voter_id)
        qr_img = qr_img.resize((600, 600))
        voucher.paste(qr_img, (225, 300))
        
        # Add serial number
        serial_font = ImageFont.truetype("arial.ttf", 36)
        draw.text((525, 950), f"Serial No: {serial_number}", 
                  font=serial_font, fill='black', anchor="mm")
        
        # Add instructions
        instr_font = ImageFont.truetype("arial.ttf", 24)
        instructions = [
            "IMPORTANT INSTRUCTIONS:",
            "1. Keep this voucher secure",
            "2. Bring it on election day",
            "3. One voucher = One vote",
            "4. Check your email for details"
        ]
        
        y_position = 1050
        for line in instructions:
            draw.text((100, y_position), line, font=instr_font, fill='black')
            y_position += 50
        
        # Add voting details
        draw.text((100, 1350), "Voting Date: September 30, 2025", 
                  font=instr_font, fill='black')
        draw.text((100, 1400), "Questions? voting@dmi.ac.mw", 
                  font=instr_font, fill='black')
        
        return voucher

# Usage
generator = VoucherQRGenerator()
voucher_img = generator.generate_voucher_image(
    voter_id="DMI2025-00123",
    voucher_code="VC-550e8400-e29b-41d4-a716-446655440000",
    serial_number="SN-458921"
)

# Save to file
voucher_img.save("voucher_DMI2025-00123.png", "PNG", dpi=(300, 300))

# Or convert to bytes for web delivery
img_bytes = io.BytesIO()
voucher_img.save(img_bytes, format='PNG')
img_bytes = img_bytes.getvalue()
```

### 9.7 Email Templates

#### Registration Confirmation Email (Complete)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #004080;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }
        .info-box {
            background-color: #e8f4f8;
            border-left: 4px solid #004080;
            padding: 15px;
            margin: 15px 0;
        }
        .important {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
        }
        ul {
            padding-left: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #004080;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DMI VOTING SYSTEM 2025</h1>
            <p>Registration Successful</p>
        </div>
        
        <div class="content">
            <p>Dear {{student_name}},</p>
            
            <p>You have successfully registered for the <strong>DMI St John The Baptist University Student Elections 2025</strong>.</p>
            
            <div class="info-box">
                <h3>Registration Details:</h3>
                <ul>
                    <li><strong>Registration Date:</strong> {{registration_date}}</li>
                    <li><strong>Voter ID:</strong> {{voter_id}}</li>
                    <li><strong>Backup Serial Number:</strong> {{serial_number}}</li>
                </ul>
            </div>
            
            <div class="important">
                <h3>⚠️ IMPORTANT REMINDERS:</h3>
                <ul>
                    <li>✓ You have been issued a physical voting voucher - <strong>keep it safe</strong></li>
                    <li>✓ Bring your voucher on election day</li>
                    <li>✓ You will need access to this email to vote</li>
                    <li>✓ You can only vote once per position</li>
                </ul>
            </div>
            
            <h3>Election Details:</h3>
            <ul>
                <li><strong>Date:</strong> {{election_date}}</li>
                <li><strong>Time:</strong> 8:00 AM - 5:00 PM</li>
                <li><strong>Locations:</strong>
                    <ul>
                        <li>Main Campus Polling Station (Library Hall)</li>
                        <li>Faculty of Science Polling Station</li>
                        <li>Student Center Polling Station</li>
                    </ul>
                </li>
            </ul>
            
            <h3>Positions to Vote For:</h3>
            <ol>
                <li>Student Union President</li>
                <li>Vice President</li>
                <li>Secretary General</li>
                <li>Treasurer</li>
                <li>Sports Secretary</li>
                <li>Academic Secretary</li>
            </ol>
            
            <p style="text-align: center;">
                <a href="{{candidates_url}}" class="button">View All Candidates</a>
            </p>
            
            <h3>What to Expect on Election Day:</h3>
            <ol>
                <li>Present your voting voucher at any polling station</li>
                <li>Official will scan your QR code</li>
                <li>You'll receive a verification code via email</li>
                <li>Enter the code to access your ballot</li>
                <li>Vote for your preferred candidates</li>
                <li>Submit and receive a receipt code</li>
            </ol>
            
            <div class="info-box">
                <h4>🔒 Lost Your Voucher?</h4>
                <p>Visit the helpdesk with your original ID to request a reissue.</p>
            </div>
            
            <p><strong>Questions?</strong><br>
            Email: <a href="mailto:voting@dmi.ac.mw">voting@dmi.ac.mw</a><br>
            WhatsApp: +265 XXX XXX XXX</p>
        </div>
        
        <div class="footer">
            <p>Powered by <strong>DMI Science and Tech Club</strong></p>
            <p>For a transparent and secure election</p>
            <p>&copy; 2025 DMI St John The Baptist University</p>
        </div>
    </div>
</body>
</html>
```

#### OTP Email Template

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #004080;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }
        .otp-box {
            background-color: #ffffff;
            border: 3px dashed #004080;
            padding: 30px;
            margin: 20px 0;
            text-align: center;
        }
        .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #004080;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DMI VOTING SYSTEM</h1>
            <p>Your Voting Verification Code</p>
        </div>
        
        <div class="content">
            <p>You are attempting to vote in the DMI Student Elections 2025.</p>
            
            <p>Your voting verification code is:</p>
            
            <div class="otp-box">
                <div class="otp-code">{{otp_code}}</div>
                <p style="margin-top: 10px; font-size: 14px; color: #666;">
                    This code expires in <strong>10 minutes</strong>
                </p>
            </div>
            
            <p style="text-align: center; font-size: 16px;">
                Enter this code at the polling station to access your ballot.
            </p>
            
            <div class="warning">
                <h3>⚠️ SECURITY WARNING</h3>
                <ul>
                    <li><strong>DO NOT share this code with anyone</strong></li>
                    <li>Only enter this code on an official polling station device</li>
                    <li>DMI officials will NEVER ask you for this code</li>
                    <li>If you didn't request this code, please report it immediately</li>
                </ul>
            </div>
            
            <p style="font-size: 12px; color: #666;">
                Request details:<br>
                Time: {{request_time}}<br>
                IP Address: {{ip_address}}<br>
                Location: {{polling_station}}
            </p>
            
            <p><strong>Need help?</strong><br>
            Contact the polling station supervisor or email: 
            <a href="mailto:voting@dmi.ac.mw">voting@dmi.ac.mw</a></p>
        </div>
        
        <div class="footer">
            <p>Powered by <strong>DMI Science and Tech Club</strong></p>
            <p>&copy; 2025 DMI St John The Baptist University</p>
        </div>
    </div>
</body>
</html>
```

#### Vote Confirmation Email

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .success-icon {
            font-size: 64px;
            margin-bottom: 10px;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }
        .verification-box {
            background-color: #ffffff;
            border: 3px solid #28a745;
            padding: 30px;
            margin: 20px 0;
            text-align: center;
        }
        .verification-code {
            font-size: 32px;
            font-weight: bold;
            color: #28a745;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
        }
        .info-box {
            background-color: #e8f4f8;
            border-left: 4px solid #004080;
            padding: 15px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #004080;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✅</div>
            <h1>VOTE SUBMITTED SUCCESSFULLY!</h1>
        </div>
        
        <div class="content">
            <p>Dear Voter,</p>
            
            <p>Your votes have been successfully recorded in the <strong>DMI St John The Baptist University Student Elections 2025</strong>.</p>
            
            <div class="info-box">
                <h3>Vote Details:</h3>
                <ul>
                    <li><strong>Date:</strong> {{vote_date}}</li>
                    <li><strong>Time:</strong> {{vote_time}}</li>
                    <li><strong>Polling Station:</strong> {{polling_station}}</li>
                    <li><strong>Positions Voted:</strong> {{positions_count}}</li>
                </ul>
            </div>
            
            <p style="text-align: center; font-size: 18px; font-weight: bold;">
                Your Verification Code:
            </p>
            
            <div class="verification-box">
                <div class="verification-code">{{verification_code}}</div>
                <p style="margin-top: 10px; font-size: 14px; color: #666;">
                    <strong>SAVE THIS CODE!</strong>
                </p>
            </div>
            
            <div class="info-box">
                <h3>🔍 How to Verify Your Vote Was Counted:</h3>
                <ol>
                    <li>After voting closes, visit: <a href="{{verification_url}}">{{verification_url}}</a></li>
                    <li>Enter your verification code above</li>
                    <li>Confirm your vote is in the system</li>
                </ol>
                <p><strong>Note:</strong> You will NOT be able to see who you voted for (secret ballot), but you can confirm your vote was counted.</p>
            </div>
            
            <p style="text-align: center;">
                <a href="{{results_url}}" class="button">View Results (After Voting Closes)</a>
            </p>
            
            <div class="info-box">
                <h3>📊 Results Announcement:</h3>
                <p>Results will be announced on: <strong>{{results_announcement_date}}</strong></p>
                <p>Live results will be available at: <a href="{{results_url}}">{{results_url}}</a></p>
            </div>
            
            <p style="text-align: center; font-size: 18px; color: #28a745;">
                <strong>Thank you for participating in DMI elections!</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>Powered by <strong>DMI Science and Tech Club</strong></p>
            <p>For a transparent and secure election</p>
            <p>&copy; 2025 DMI St John The Baptist University</p>
        </div>
    </div>
</body>
</html>
```

#### Results Announcement Email

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #004080;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }
        .winner-box {
            background-color: #fff9e6;
            border: 2px solid #ffc107;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .winner-box h4 {
            margin: 0 0 10px 0;
            color: #004080;
        }
        .winner-name {
            font-size: 20px;
            font-weight: bold;
            color: #ffc107;
        }
        .stats-box {
            background-color: #e8f4f8;
            border-left: 4px solid #004080;
            padding: 15px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #004080;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 10px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #004080;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 OFFICIAL ELECTION RESULTS</h1>
            <p>DMI Student Elections 2025</p>
        </div>
        
        <div class="content">
            <p>Dear DMI Students,</p>
            
            <p>The results of the <strong>DMI St John The Baptist University Student Elections 2025</strong> are now official.</p>
            
            <div class="stats-box">
                <h3>📊 Election Statistics:</h3>
                <ul>
                    <li><strong>Election Date:</strong> {{election_date}}</li>
                    <li><strong>Total Registered Voters:</strong> {{total_registered}}</li>
                    <li><strong>Total Votes Cast:</strong> {{total_voted}}</li>
                    <li><strong>Voter Turnout:</strong> {{turnout_percentage}}%</li>
                </ul>
            </div>
            
            <h2 style="text-align: center; color: #004080;">🎉 WINNERS 🎉</h2>
            <hr style="border: 2px solid #ffc107;">
            
            {{#winners}}
            <div class="winner-box">
                <h4>{{position_name}}</h4>
                <div class="winner-name">✅ {{winner_name}}</div>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                    {{vote_count}} votes ({{percentage}}%)
                </p>
            </div>
            {{/winners}}
            
            <h3>Complete Results:</h3>
            
            {{#positions}}
            <h4 style="color: #004080;">{{position_name}}</h4>
            <table>
                <thead>
                    <tr>
                        <th>Candidate</th>
                        <th>Votes</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    {{#candidates}}
                    <tr>
                        <td>{{candidate_name}} {{#if is_winner}}🏆{{/if}}</td>
                        <td>{{votes}}</td>
                        <td>{{percentage}}%</td>
                    </tr>
                    {{/candidates}}
                    <tr>
                        <td colspan="3" style="font-style: italic; color: #666;">
                            Abstentions: {{abstentions}} | Total Votes: {{total_votes}}
                        </td>
                    </tr>
                </tbody>
            </table>
            {{/positions}}
            
            <p style="text-align: center;">
                <a href="{{results_url}}" class="button">View Detailed Results Online</a>
            </p>
            
            <div class="stats-box">
                <h3>🗓️ Inauguration Details:</h3>
                <p>The inauguration ceremony will be held on:</p>
                <ul>
                    <li><strong>Date:</strong> {{inauguration_date}}</li>
                    <li><strong>Time:</strong> {{inauguration_time}}</li>
                    <li><strong>Venue:</strong> {{inauguration_venue}}</li>
                </ul>
                <p>All students are invited to attend.</p>
            </div>
            
            <p style="text-align: center; font-size: 18px;">
                <strong>Thank you to all candidates and voters for participating in this democratic process!</strong>
            </p>
            
            <p style="text-align: center; color: #28a745;">
                <strong>Congratulations to all winners! 🎉</strong>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>DMI Student Union Election Committee</strong></p>
            <p>Powered by <strong>DMI Science and Tech Club</strong></p>
            <p>&copy; 2025 DMI St John The Baptist University</p>
        </div>
    </div>
</body>
</html>
```

---

## 10. Implementation Guide

### 10.1 Pre-Implementation Checklist

**6 Months Before Election:**
- [ ] Form project team (DMI Science and Tech Club)
- [ ] Get approval from university administration
- [ ] Define election scope (positions, timeline)
- [ ] Budget allocation
- [ ] Technology stack selection

**3 Months Before Election:**
- [ ] Begin system development
- [ ] Database design and setup
- [ ] Security protocols implementation
- [ ] UI/UX design
- [ ] Testing environment setup

**2 Months Before Election:**
- [ ] Complete core features
- [ ] Security audit
- [ ] User acceptance testing
- [ ] Train election officials
- [ ] Prepare documentation

**1 Month Before Election:**
- [ ] Production server setup
- [ ] Load testing
- [ ] Candidate registration
- [ ] Promotional materials
- [ ] Backup systems tested

**2 Weeks Before Election:**
- [ ] Voter registration begins
- [ ] Equipment procurement
- [ ] Polling station setup
- [ ] Final system checks
- [ ] Helpdesk training

**1 Week Before Election:**
- [ ] System freeze (no new changes)
- [ ] Final security audit
- [ ] Backup servers ready
- [ ] Print vouchers
- [ ] Communication campaign

**Election Day:**
- [ ] System go-live at 8:00 AM
- [ ] Real-time monitoring
- [ ] Technical support on standby
- [ ] Incident response team ready

### 10.2 Development Phases

#### Phase 1: Foundation (Weeks 1-4)

**Week 1: Project Setup**
```bash
# Create project structure
mkdir dmi-voting-system
cd dmi-voting-system

# Initialize Git repository
git init
git remote add origin https://github.com/dmi-sci-tech/voting-system.git

# Backend setup (Python/Django example)
python3 -m venv venv
source venv/bin/activate
pip install django djangorestframework psycopg2-binary cryptography qrcode pillow

# Create Django project
django-admin startproject dmi_voting .
python manage.py startapp registration
python manage.py startapp voting
python manage.py startapp authentication
python manage.py startapp results

# Frontend setup (React)
npx create-react-app frontend
cd frontend
npm install axios redux react-redux react-router-dom tailwindcss
npm install html5-qrcode recharts formik yup
```

**Week 2: Database Design**
- Implement complete database schema (from section 9.3)
- Create models in Django/ORM
- Set up migrations
- Add indexes and constraints
- Create stored procedures

**Week 3: Core Backend APIs**
- Implement authentication endpoints
- Voter registration API
- Voucher generation system
- OTP generation and verification
- Basic security measures

**Week 4: Testing & Review**
- Unit tests for all APIs
- Integration testing
- Security testing
- Code review
- Documentation

#### Phase 2: Core Features (Weeks 5-8)

**Week 5: Voting System**
- Ballot display API
- Vote submission and encryption
- Blockchain hash chain implementation
- Vote verification system
- Session management

**Week 6: Frontend Development**
- Registration interface
- QR scanner implementation
- Voting booth interface
- Ballot display components
- Review and submission screens

**Week 7: Results System**
- Vote counting algorithms
- Results calculation
- Verification portal
- Results dashboard
- Data export functionality

**Week 8: Admin Dashboard**
- Real-time statistics
- Monitoring interface
- Incident reporting
- Audit log viewer
- System configuration

#### Phase 3: Security & Testing (Weeks 9-10)

**Week 9: Security Hardening**
- Penetration testing
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Session security
- Encryption audit

**Week 10: Comprehensive Testing**
- Load testing (simulate 1000+ concurrent users)
- Stress testing
- Security audit
- User acceptance testing
- Performance optimization
- Bug fixes

#### Phase 4: Deployment & Training (Weeks 11-12)

**Week 11: Production Deployment**
- Server setup and configuration
- Database migration
- SSL certificate installation
- Backup systems
- Monitoring setup
- Documentation finalization

**Week 12: Training & Launch Prep**
- Train election officials
- Train poll workers
- System walkthrough for admins
- Create user guides
- Final system check
- Dry run election

### 10.3 Deployment Steps

#### Server Setup (Ubuntu 22.04 LTS)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3-pip python3-venv postgresql nginx redis-server

# Create application user
sudo adduser dmi_voting
sudo usermod -aG sudo dmi_voting

# Switch to application user
su - dmi_voting

# Clone repository
git clone https://github.com/dmi-sci-tech/voting-system.git
cd voting-system

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE dmi_voting;
CREATE USER dmi_voting_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE dmi_voting TO dmi_voting_user;
\q

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Setup Gunicorn
pip install gunicorn
gunicorn --bind 0.0.0.0:8000 dmi_voting.wsgi

# Setup Nginx
sudo nano /etc/nginx/sites-available/dmi_voting

# Add configuration:
server {
    listen 80;
    server_name voting.dmi.ac.mw;
    
    location /static/ {
        alias /home/dmi_voting/voting-system/staticfiles/;
    }
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/dmi_voting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d voting.dmi.ac.mw

# Setup systemd service
sudo nano /etc/systemd/system/dmi_voting.service

# Add:
[Unit]
Description=DMI Voting System
After=network.target

[Service]
User=dmi_voting
WorkingDirectory=/home/dmi_voting/voting-system
ExecStart=/home/dmi_voting/voting-system/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:8000 dmi_voting.wsgi:application

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable dmi_voting
sudo systemctl start dmi_voting
```

#### Database Backup Setup

```bash
# Create backup script
nano /home/dmi_voting/backup_database.sh

#!/bin/bash
BACKUP_DIR="/home/dmi_voting/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="dmi_voting"
DB_USER="dmi_voting_user"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql.gz"

# Make executable
chmod +x /home/dmi_voting/backup_database.sh

# Setup cron job for daily backups
crontab -e

# Add:
0 2 * * * /home/dmi_voting/backup_database.sh
```

### 10.4 Training Program

#### Training Schedule

**Session 1: Registration Officials (2 hours)**
- System overview
- Registration process walkthrough
- Voucher issuance
- Troubleshooting common issues
- Hands-on practice

**Session 2: Poll Workers (3 hours)**
- Polling station setup
- QR code scanning
- OTP verification process
- Assisting voters
- Handling technical issues
- Emergency procedures
- Hands-on practice

**Session 3: Election Administrators (4 hours)**
- Complete system overview
- Admin dashboard usage
- Real-time monitoring
- Incident response
- Results management
- Security protocols
- Audit procedures

**Session 4: Technical Support Team (6 hours)**
- Deep dive into system architecture
- Database operations
- Troubleshooting guide
- System recovery procedures
- Security incident response
- Code walkthrough
- Emergency scenarios

#### Training Materials

**Registration Official Quick Reference:**
```
DMI VOTING SYSTEM - REGISTRATION QUICK GUIDE
═══════════════════════════════════════════

STEP 1: Verify Student Identity
✓ Check ID document
✓ Verify against enrollment records
✓ Check for duplicate registration

STEP 2: Enter Information
✓ Full name (as per ID)
✓ Email address
✓ Phone number (optional)
✓ ID type and number

STEP 3: Generate Voucher
✓ System creates Voter ID
✓ QR code generated
✓ Print voucher
✓ Hand to student

STEP 4: Confirm
✓ Student acknowledges receipt
✓ Student signs logbook
✓ Voucher number recorded

COMMON ISSUES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email already registered
→ Check if student registered before
→ If yes: Inform student
→ If no: Check for typo

Printer not working
→ Note voucher details manually
→ Print later and email to student
→ Report to supervisor

Student has no ID
→ Check acceptance letter
→ Check fee receipt
→ Last resort: Supervisor approval

EMERGENCY CONTACT: +265 XXX XXX XXX
```

**Poll Worker Quick Reference:**
```
DMI VOTING SYSTEM - POLL WORKER QUICK GUIDE
═══════════════════════════════════════════

VOTER CHECK-IN PROCESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Scan Voucher
✓ Ask student for voucher
✓ Scan QR code with device
✓ If scan fails: Enter serial number manually

STEP 2: Check Status
System shows:
  ✅ Valid - Proceed to Step 3
  ❌ Already Voted - Politely explain, offer helpdesk
  ❌ Invalid - Direct to helpdesk

STEP 3: Send OTP
✓ Confirm masked email with student
✓ Click "Send OTP"
✓ Tell student to check email

STEP 4: Verify OTP
✓ Student provides 6-digit code
✓ Enter code in system
✓ If correct: Direct to voting booth
✓ If incorrect: 2 more attempts allowed

STEP 5: Assign Booth
✓ Tell student booth number
✓ Remind: Review before submitting
✓ Votes cannot be changed after submission

TROUBLESHOOTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QR Won't Scan
→ Clean scanner lens
→ Flatten voucher
→ Use serial number instead

Student Can't Access Email
→ Let them use booth device briefly
→ Or use SMS backup (if available)
→ Last resort: Supervisor override

Student Says They Already Voted (But Didn't)
→ Call supervisor immediately
→ Check audit logs
→ Follow provisional ballot procedure

Internet Down
→ Switch to mobile hotspot
→ If that fails: Use offline mode
→ Notify supervisor

Device Frozen/Crashed
→ Direct voter to another booth
→ Restart device
→ If problem persists: Replace device

REMEMBER:
✓ Be patient and helpful
✓ Protect voter privacy
✓ Never look at ballot screens
✓ Report all incidents immediately

EMERGENCY CONTACT: +265 XXX XXX XXX
SUPERVISOR: [Name] +265 XXX XXX XXX
```

**Voter Instructions Poster:**
```
═══════════════════════════════════════════
   HOW TO VOTE - DMI ELECTIONS 2025
═══════════════════════════════════════════

BEFORE YOU ARRIVE:
1️⃣ Bring your voting voucher
2️⃣ Ensure you can access your email
3️⃣ Know the candidates (view online)

AT THE POLLING STATION:

STEP 1: CHECK-IN
→ Present your voucher to official
→ Official scans your QR code

STEP 2: EMAIL VERIFICATION
→ Check your email for 6-digit code
→ Provide code to official
→ Official verifies and assigns booth

STEP 3: VOTE
→ Go to assigned voting booth
→ Review all candidates carefully
→ Select ONE candidate per position
→ OR choose to abstain
→ Review all your selections

STEP 4: SUBMIT
→ Click "Submit Ballot"
→ Confirm submission
→ ⚠️ CANNOT BE CHANGED AFTER THIS!

STEP 5: RECEIPT
→ Save your verification code
→ Check email for confirmation
→ Optional: Print receipt

IMPORTANT REMINDERS:
✓ You can only vote ONCE
✓ Votes are SECRET - no one can see who you voted for
✓ Take your time - no rush
✓ Ask for help if needed
✓ Keep your verification code safe

VERIFY YOUR VOTE:
After election closes, visit:
voting.dmi.ac.mw/verify
Enter your code to confirm vote was counted

QUESTIONS?
Ask any poll worker or visit the helpdesk

═══════════════════════════════════════════
  Thank you for participating!
  Your voice matters!
═══════════════════════════════════════════
```

---

## 11. User Manuals

### 11.1 Student Voter Manual

#### Before Election Day

**1. Register to Vote**
- Visit any registration desk on campus with your ID
- Provide your personal email address
- Receive your voting voucher
- Keep voucher safe until election day

**2. Research Candidates**
- Visit voting.dmi.ac.mw/candidates
- Read candidate manifestos
- Attend campaign events
- Make informed choices

**3. Ensure Email Access**
- Verify you can access your registered email
- Check spam/junk folders are working
- Have data or WiFi available on election day

#### On Election Day

**1. What to Bring**
- Your voting voucher (REQUIRED)
- Phone or device to check email
- Your ID (backup, in case of issues)

**2. At the Polling Station**
- Join the queue at any polling station
- Wait for your turn
- Follow instructions from poll workers

**3. Voting Process**
- Present voucher → Get OTP → Enter booth → Vote → Submit → Get receipt
- Average time: 5-10 minutes

**4. After Voting**
- Save your verification code
- Optional: Print receipt for your records
- Collect your "I Voted" sticker

#### After Election

**1. Verify Your Vote**
- Wait for voting to close
- Visit voting.dmi.ac.mw/verify
- Enter your verification code
- Confirm your vote was counted

**2. View Results**
- Visit voting.dmi.ac.mw/results
- See live results as they're tallied
- Download detailed reports

### 11.2 Registration Official Manual

#### Setup (Start of Each Day)

```
DAILY SETUP CHECKLIST:
□ Log into registration system
□ Verify printer has paper and ink
□ Test voucher printing (print test voucher)
□ Check internet connection
□ Organize registration forms and logbook
□ Set up queue management
□ Review today's registration targets
□ Brief any assistant officials
```

#### Registration Process

**Step-by-Step:**

1. **Greet the Student**
   - "Good morning/afternoon! Welcome to voter registration."
   - "I'll need to see your ID and get your email address."

2. **Verify Identity**
   - Check ID document carefully
   - Acceptable IDs: National ID, Admission letter, Fee receipt, Passport
   - Verify name spelling
   - For new students: Admission letter is sufficient

3. **Check for Duplicate**
   - Search system by email before starting
   - If already registered: "You're already registered. Your voucher was sent to your email on [date]."
   - If lost voucher: Direct to reissue desk

4. **Collect Information**
   ```
   Required:
   - Full name (as it appears on ID)
   - Personal email address
   - ID type and number
   
   Optional but recommended:
   - Phone number (backup verification)
   - Faculty/Department
   ```

5. **Enter into System**
   - Type carefully (emails are critical!)
   - Double-check spelling
   - System generates Voter ID and voucher code automatically

6. **Print Voucher**
   - System prints voucher with QR code
   - Verify voucher printed correctly
   - Check QR code is clear and readable

7. **Issue Voucher**
   - Hand voucher to student
   - Explain: "This is your voting voucher. Keep it safe."
   - "You'll need it on election day."
   - "Check your email for confirmation and instructions."

8. **Record in Logbook**
   - Student signs physical logbook
   - Record: Voter ID, Name, Date/Time
   - This is your backup if system fails

9. **Confirm**
   - "You're all set! See you on election day!"
   - "If you lose your voucher, come back with your ID."

#### Common Scenarios

**Scenario: Student doesn't have email**
```
Action:
1. Explain email is required for voting
2. Offer to help create free email (Gmail, Outlook)
3. Use office computer to help set up
4. Once created, proceed with registration
5. Write down email and password for student
```

**Scenario: Email already registered**
```
Action:
1. Ask: "Did you register before?"
2. If YES: "You're already registered. Check your email."
3. If NO: "Let me check for a typo..."
4. Verify spelling carefully
5. If truly duplicate: Call supervisor
```

**Scenario: Printer jam or malfunction**
```
Action:
1. Don't panic
2. Write down voucher details manually:
   - Voter ID
   - Serial Number
   - Email
3. Tell student: "We're having printer issues. I've noted
   your details. Check your email for confirmation, and 
   you can collect your printed voucher later today."
4. Email student immediately
5. Print voucher when printer fixed
6. Call supervisor if printer can't be fixed
```

**Scenario: System is slow or down**
```
Action:
1. Apologize for delay
2. If slow: Continue but note wait times
3. If down: Switch to paper registration:
   - Use backup forms
   - Collect all information manually
   - Enter into system when it's back up
4. Notify supervisor immediately
```

#### End of Day

```
CLOSING CHECKLIST:
□ Count total registrations for the day
□ Verify logbook matches system count
□ Secure unused voucher paper
□ Generate daily report from system
□ Back up any paper forms
□ Log out of system
□ Secure equipment
□ Submit report to supervisor
```

### 11.3 Election Administrator Manual

#### Dashboard Overview

**Key Metrics to Monitor:**
- Total registered voters
- Votes cast (live counter)
- Current voting rate (votes/hour)
- Turnout percentage
- Average voting time
- Polling station status
- Active incidents
- System health

#### Daily Monitoring Routine

**Morning (8:00 AM - 12:00 PM):**
```
□ System health check
□ Verify all polling stations online
□ Monitor initial turnout
□ Check for any reported incidents
□ Review overnight integrity checks
□ Ensure helpdesk is staffed
□ Monitor social media for issues
```

**Afternoon (12:00 PM - 5:00 PM):**
```
□ Monitor peak voting hours
□ Track turnout vs. projections
□ Respond to incidents
□ Check equipment battery levels
□ Verify backup systems ready
□ Monitor remaining vouchers
□ Prepare for closing procedures
```

**Closing (5:00 PM onwards):**
```
□ Close voting at exactly 5:00 PM
□ Allow in-progress voters to finish
□ Verify all stations reported final counts
□ Run final integrity check
□ Begin results calculation
□ Prepare for results announcement
```

#### Incident Management

**Severity Levels:**

**Level 1 (Green) - Minor Issues**
- Single device problem
- Individual voter issue
- Response: On-site resolution, no escalation needed
- Document in incident log

**Level 2 (Yellow) - Moderate Issues**
- Multiple device failures
- Internet outage at one station
- Attempted fraud (unsuccessful)
- Response: 
  - Dispatch technical support
  - Implement backup procedures
  - Notify election committee
  - Document thoroughly

**Level 3 (Orange) - Serious Issues**
- System-wide problems
- Multiple station failures
- Confirmed fraud attempt
- Response:
  - Convene emergency meeting
  - Consider pausing voting
  - Implement contingency plans
  - Public communication
  - Full investigation

**Level 4 (Red) - Critical Issues**
- Database compromise
- Confirmed vote tampering
- Security breach
- Response:
  - Immediate voting suspension
  - Lock all systems
  - Preserve evidence
  - Contact university administration
  - Consider election cancellation
  - Full forensic investigation

#### Results Management

**Pre-Announcement Checklist:**
```
□ Voting officially closed
□ All votes synced to main database
□ Integrity check passed
□ Vote count verified
□ No pending incidents
□ Election committee approval
□ Results reviewed for anomalies
□ Communication materials prepared
```

**Announcement Process:**
1. Run final vote tally
2. Generate official results report
3. Review with election committee
4. Get university administration approval
5. Publish to results portal
6. Send email to all voters
7. Post on campus notice boards
8. Social media announcement
9. Archive all data

#### Audit Procedures

**Daily Audits:**
- Verify vote count = voters who voted
- Check for duplicate votes
- Review suspicious activities
- Verify timestamp validity
- Check blockchain integrity

**Post-Election Audit:**
- Complete vote recount
- Full audit log review
- Security incident review
- Performance analysis
- Generate comprehensive report
- Archive all records

### 11.4 Technical Support Manual

#### System Architecture Quick Reference

```
┌─────────────────────────────────────┐
│   Load Balancer (Nginx)             │
├─────────────────────────────────────┤
│   Application Servers (x3)          │
│   - Django/Flask                    │
│   - Gunicorn workers                │
├─────────────────────────────────────┤
│   Database (PostgreSQL)             │
│   - Primary + Replica               │
├─────────────────────────────────────┤
│   Cache (Redis)                     │
│   - Session storage                 │
│   - OTP codes                       │
├─────────────────────────────────────┤
│   File Storage                      │
│   - Voucher images                  │
│   - Audit logs                      │
└─────────────────────────────────────┘
```

#### Common Issues and Solutions

**Issue: Slow System Response**
```
Diagnosis:
1. Check server CPU/RAM usage
   $ top
   $ htop
   
2. Check database connections
   $ sudo -u postgres psql
   SELECT count(*) FROM pg_stat_activity;
   
3. Check Nginx logs
   $ tail -f /var/log/nginx/error.log

Solutions:
- If high CPU: Restart application servers
- If database overloaded: Add read replicas
- If network slow: Check bandwidth usage
- Clear Redis cache if stale
```

**Issue: Database Connection Errors**
```
Diagnosis:
$ sudo systemctl status postgresql
$ sudo -u postgres psql -c "SELECT version();"

Solutions:
1. Restart PostgreSQL
   $ sudo systemctl restart postgresql
   
2. Check connection limits
   $ sudo -u postgres psql
   SHOW max_connections;
   ALTER SYSTEM SET max_connections = 200;
   
3. Verify credentials in settings.py
```

**Issue: Email Not Sending**
```
Diagnosis:
1. Check email service logs
2. Verify SMTP settings
3. Test email manually:
   $ python manage.py shell
   >>> from django.core.mail import send_mail
   >>> send_mail('Test', 'Message', 'from@dmi.ac.mw', ['to@email.com'])

Solutions:
- Check SMTP credentials
- Verify firewall allows port 587
- Check email service quota
- Switch to backup email provider
```

**Issue: Voucher QR Code Not Scanning**
```
Diagnosis:
- Check QR code image quality
- Test with multiple scanners
- Verify QR data format

Solutions:
1. Regenerate QR code with higher error correction
2. Print at higher DPI (300+)
3. Use serial number fallback
4. Clean scanner lens
```

#### Emergency Procedures

**Complete System Failure:**
```
1. Stay Calm
2. Assess situation:
   - Is database accessible?
   - Are backups recent?
   - What caused failure?
   
3. Notify stakeholders:
   - Election committee (immediate)
   - DMI Science & Tech Club lead
   - University IT department
   
4. Recovery steps:
   a. Stop all services
   b. Restore from last backup
   c. Verify data integrity
   d. Run integrity checks
   e. Restart services one by one
   
5. Test thoroughly before resuming
6. Document incident completely
```

**Data Corruption Detected:**
```
1. IMMEDIATELY halt all voting
2. Preserve current state (don't delete anything)
3. Create forensic copy of database
4. Notify election committee
5. Investigation:
   - When did corruption occur?
   - What data is affected?
   - Can it be recovered?
6. Recovery:
   - Restore from last known good backup
   - Re-run votes since backup if possible
   - Verify blockchain integrity
7. Decide: Continue or restart election?
```

#### Monitoring Commands

**Check System Health:**
```bash
# Application status
sudo systemctl status dmi_voting

# Database status
sudo systemctl status postgresql

# Nginx status
sudo systemctl status nginx

# Disk space
df -h

# Memory usage
free -h

# Active connections
netstat -an | grep ESTABLISHED | wc -l

# Recent errors
tail -100 /var/log/dmi_voting/error.log
```

**Database Queries:**
```sql
-- Current voting activity
SELECT COUNT(*) as active_voters 
FROM sessions 
WHERE expires_at > NOW() AND is_active = TRUE;

-- Votes per minute (last 10 minutes)
SELECT 
    DATE_TRUNC('minute', timestamp) as minute,
    COUNT(*) as votes
FROM votes
WHERE timestamp > NOW() - INTERVAL '10 minutes'
GROUP BY minute
ORDER BY minute DESC;

-- Detect anomalies
SELECT 
    polling_station,
    COUNT(*) as votes,
    AVG(EXTRACT(EPOCH FROM (timestamp - LAG(timestamp) OVER (ORDER BY timestamp)))) as avg_time_between_votes
FROM votes
GROUP BY polling_station;
```

---

## 12. Troubleshooting Guide

### 12.1 Registration Phase Issues

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| Cannot register duplicate emails | Email already in system | Search for existing registration; if lost voucher, follow reissue process |
| Printer not responding | Connection issue, paper jam, low ink | Check connections; clear jam; replace ink; use backup printer |
| QR code not generating | Library error, corrupted data | Restart application; regenerate voucher; check qrcode library installation |
| Email not sending | SMTP configuration, network issue | Verify SMTP settings; check network; use alternative email service |
| System slow during registration | Database overload, high traffic | Optimize queries; add database indexes; scale up server resources |

### 12.2 Voting Phase Issues

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| Voucher shows "already voted" | Duplicate usage, database error | Check audit logs; verify timestamp; if error, manual override with supervisor approval |
| OTP not received | Email delivery delay, spam filter | Wait 2-3 minutes; check spam folder; resend OTP; use SMS backup |
| OTP expired | Student took too long | Request new OTP; explain 10-minute limit |
| Cannot submit vote | Network timeout, validation error | Check connection; verify all positions voted; retry submission |
| Ballot not loading | API error, session expired | Refresh session; re-authenticate; check server logs |

### 12.3 Technical Issues

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| Database connection lost | Network issue, database down | Check PostgreSQL status; restart if needed; verify network; use backup database |
| High server load | Too many concurrent users | Scale horizontally; add more app servers; optimize queries; enable caching |
| Disk space full | Large log files, backups | Clean old logs; move backups to external storage; increase disk space |
| SSL certificate expired | Forgotten renewal | Renew with certbot; set up auto-renewal reminder |
| Session timeout errors | Redis down, misconfiguration | Check Redis status; verify session settings; restart Redis |

### 12.4 Voter Issues

| Problem | What Student Says | How to Help |
|---------|------------------|-------------|
| Lost voucher | "I lost my voting paper" | Direct to helpdesk; verify identity; reissue voucher; invalidate old one |
| Can't access email | "I can't open my email" | Offer WiFi; let them use booth device briefly; SMS backup; supervisor override if necessary |
| Clicked submit by accident | "I submitted before reviewing!" | Explain votes cannot be changed (security feature); apologize but firm on policy |
| Chose wrong candidate | "Can I change my vote?" | No - explain it's to prevent coercion; vote is final once submitted |
| Forgot who they voted for | "Who did I vote for?" | Cannot be revealed (secret ballot); can only verify vote was counted with receipt code |

---

## 13. Legal and Compliance

### 13.1 Data Protection and Privacy

**Personal Data Collected:**
- Full name
- Email address
- Phone number (optional)
- ID type and number
- Voting timestamp

**Data Protection Measures:**
- All personal data encrypted at rest
- Access restricted to authorized personnel only
- Data retained only as long as necessary
- Students can request data deletion after election
- Compliance with local data protection laws

**Privacy Policy (Summary):**
```
DMI VOTING SYSTEM - PRIVACY POLICY

1. Data Collection
We collect only necessary information for voter registration and authentication.

2. Data Usage
Your data is used solely for:
- Verifying your identity
- Preventing duplicate voting
- Sending election communications
- Audit and compliance purposes

3. Data Security
All data is encrypted and stored securely. Access is restricted and logged.

4. Vote Anonymity
Your vote is completely anonymous. We cannot see who you voted for, 
even with administrator access.

5. Data Retention
Personal data is retained for [X months/years] for audit purposes, 
then securely deleted.

6. Your Rights
You can:
- Request a copy of your data
- Request correction of incorrect data
- Request deletion after election (subject to legal requirements)
- Withdraw from future elections

7. Contact
For privacy concerns: privacy@dmi.ac.mw
```

### 13.2 Election Integrity Policy

**Zero-Tolerance Policies:**
1. **Vote buying/selling** - Immediate disqualification
2. **Voter intimidation** - University disciplinary action
3. **System tampering** - Criminal prosecution
4. **Fraud** - Election nullification

**Dispute Resolution Process:**
1. Student files complaint with election committee
2. Committee investigates within 48 hours
3. Hearing held if necessary
4. Decision made and communicated
5. Appeal to university administration if needed

**Election Nullification Criteria:**
- Evidence of widespread fraud
- System compromise affecting results
- More than 10% of votes contested
- Violation of fundamental fairness

### 13.3 Accessibility and Inclusion

**Accommodations for Students with Disabilities:**
- Screen reader compatible interfaces
- Large text options
- Audio ballot reading (optional)
- Extended voting time if needed
- Assistance from trusted person (with privacy maintained)
- Accessible polling station locations

**Language Support:**
- English (primary)
- Chichewa (optional translation)
- Clear, simple language throughout
- Visual aids and icons

### 13.4 System Ownership and Intellectual Property

**Copyright:**
```
© 2025 DMI Science and Tech Club
DMI St John The Baptist University
All Rights Reserved

This system was developed by the DMI Science and Tech Club 
for use by DMI St John The Baptist University.

Project Team:
- [List team members]

Open Source Components:
[List any open source libraries used with their licenses]
```

**License for Reuse:**
```
This voting system may be used by other institutions under the following conditions:
1. Credit must be given to DMI Science and Tech Club
2. Cannot be used for commercial purposes
3. Security audits must be performed before deployment
4. Local data protection laws must be followed
5. System must not be modified to reduce security

For licensing inquiries: scitech@dmi.ac.mw
```

---

## 14. Appendices

### Appendix A: Glossary of Terms

**Abstention** - Choosing not to vote for any candidate in a position

**Audit Log** - Comprehensive record of all system activities

**Ballot** - The interface showing all positions and candidates

**Blockchain Chain** - Cryptographic linking of votes to prevent tampering

**Encryption** - Converting data into unreadable format for security

**Hash** - Unique digital fingerprint of data

**OTP (One-Time Password)** - Temporary code sent via email for verification

**Polling Station** - Physical location where voting takes place

**QR Code** - Square barcode containing voucher information

**Serial Number** - Backup identifier if QR code fails

**Session** - Authenticated period where voter can cast ballot

**Turnout** - Percentage of registered voters who voted

**Verification Code** - Code allowing voters to confirm their vote was counted

**Voter ID** - Unique identifier assigned to each registered voter

**Voucher** - Physical document with QR code used to vote

### Appendix B: System Configuration File Example

```python
# settings.py - DMI Voting System Configuration

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['voting.dmi.ac.mw', 'www.voting.dmi.ac.mw']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'registration',
    'voting',
    'authentication',
    'results',
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.postgres',
        'NAME': 'dmi_voting',
        'USER': 'dmi_voting_user',
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD')
DEFAULT_FROM_EMAIL = 'DMI Voting System <voting@dmi.ac.mw>'

# Voting system specific settings
VOTING_SYSTEM = {
    'ELECTION_NAME': 'DMI Student Elections 2025',
    'ELECTION_DATE': '2025-09-30',
    'VOTING_START_TIME': '08:00:00',
    'VOTING_END_TIME': '17:00:00',
    'OTP_EXPIRY_MINUTES': 10,
    'OTP_MAX_ATTEMPTS': 3,
    'SESSION_TIMEOUT_MINUTES': 15,
    'ENCRYPTION_KEY': os.environ.get('ENCRYPTION_KEY'),
    'ENABLE_SMS_BACKUP': False,
    'ENABLE_OFFLINE_MODE': True,
    'MAX_VOTES_PER_HOUR': 200,  # Rate limiting
}

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS settings (for API)
CORS_ALLOWED_ORIGINS = [
    "https://voting.dmi.ac.mw",
]

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/dmi_voting/django.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### Appendix C: API Response Codes

________________________________________________________________________
| Code | Meaning               | Description                            |
|------|-----------------------|----------------------------------------|
| 200  | OK                    | Request successful                     |
| 201  | Created               | Resource created successfully          |
| 400  | Bad Request           | Invalid input or parameters            |
| 401  | Unauthorized          | Authentication required                | 
| 403  | Forbidden             | Not authorized to access               |
| 404  | Not Found             | Resource doesn't exist                 |
| 409  | Conflict              | Duplicate entry (e.g., already voted)  |
| 429  | Too Many Requests     | Rate limit exceeded                    |
| 500  | Internal Server Error | Server-side error                      |
| 503  | Service Unavailable   | System temporarily down                |
_______________________________|_________________________________________

### Appendix D: Contact Information

**DMI Science and Tech Club**
- Email: scitech@dmi.ac.mw
- Phone: +265 XXX XXX XXX
- Office: [Building Name], Room [Number]

**Election Committee**
- Chair: [Name]
- Email: elections@dmi.ac.mw
- Phone: +265 XXX XXX XXX

**Technical Support (Election Day)**
- Hotline: +265 XXX XXX XXX
- Email: voting@dmi.ac.mw
- WhatsApp Support: +265 XXX XXX XXX

**University Administration**
- Dean of Students: [Name]
- Email: deanofstudents@dmi.ac.mw
- Phone: +265 XXX XXX XXX

### Appendix E: Acknowledgments

**Special Thanks To:**
- DMI St John The Baptist University Administration
- DMI Student Union
- All members of DMI Science and Tech Club
- Beta testers and early adopters
- Open source community for tools and libraries

**This project would not have been possible without:**
- [List individual contributors]
- [List organizations that helped]
- [List funding sources if any]

---

## 15. Conclusion

The DMI Voting System represents a comprehensive solution to conducting secure, transparent, and accessible elections at DMI St John The Baptist University. By combining physical security (vouchers) with digital security (encryption, blockchain), the system ensures vote integrity while maintaining voter anonymity.

### Key Achievements:
✅ Inclusive design (works without institutional infrastructure)
✅ Multi-layered security (prevents common attack vectors)
✅ Transparent and auditable (full paper trail)
✅ User-friendly (average voting time: 5 minutes)
✅ Scalable (can handle thousands of voters)
✅ Cost-effective (uses existing devices and free software)

### Future Enhancements (Potential):
- Mobile app for voting
- Biometric verification integration
- AI-powered anomaly detection
- Real-time results visualization
- Multi-language support expansion
- Integration with student information systems
- Blockchain public ledger for results

### Final Note:
This system was built by students, for students. It demonstrates that with dedication, technical knowledge, and attention to security, student-led technology projects can deliver professional-grade solutions.

**For questions, support, or to contribute to future versions:**
Contact DMI Science and Tech Club at scitech@dmi.ac.mw

---

**Document Version:** 1.0  
**Last Updated:** September 30, 2025  
**Next Review:** After election completion  
**Prepared by:** DMI Science and Tech Club  
**Approved by:** [Election Committee Chair Name]

═══════════════════════════════════════════════════════════
END OF DOCUMENTATION
═══════════════════════════════════════════════════════════
