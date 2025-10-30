
```
DMI VOTING SYSTEM
├─ JSON Prompt.md
├─ Prompt.md
├─ README.md
├─ SJBU Voting System API Documentation.pdf
├─ api
│  ├─ .dockerignore
│  ├─ .env
│  ├─ API_ROUTES.md
│  ├─ API_USER_MANUAL.md
│  ├─ DATABASE_SETUP_README.md
│  ├─ DOCKER_README.md
│  ├─ Dockerfile
│  ├─ VOTING_SYSTEM_GUIDE.md
│  ├─ docker
│  │  ├─ Dockerfile.postgres
│  │  └─ nginx.conf
│  ├─ docker-compose.prod.yml
│  ├─ docker-compose.yml
│  ├─ jest.config.js
│  ├─ logs
│  │  ├─ .477b1ee574ca8bf1a46c7e75ad6a78d6cc973473-audit.json
│  │  ├─ exceptions.log
│  │  ├─ rejections.log
│  │  ├─ voting-2025-10-16.log
│  │  ├─ voting-2025-10-17.log
│  │  ├─ voting-2025-10-18.log
│  │  ├─ voting-2025-10-19.log
│  │  └─ voting-2025-10-20.log
│  ├─ nodemon.json
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ test.html
│  │  ├─ test2.html
│  │  └─ test3.html
│  ├─ sjbu-voting-main.zip
│  ├─ src
│  │  ├─ controllers
│  │  │  ├─ admin.controller.ts
│  │  │  ├─ app.controller.ts
│  │  │  ├─ audit.controller.ts
│  │  │  ├─ election.controller.ts
│  │  │  ├─ runoff.controller.ts
│  │  │  └─ stats.controller.ts
│  │  ├─ db
│  │  │  ├─ backup
│  │  │  │  ├─ README.md
│  │  │  │  ├─ automated_backup.py
│  │  │  │  ├─ create_backup_directory.js
│  │  │  │  └─ restore_backup.py
│  │  │  ├─ config.ts
│  │  │  ├─ init.js
│  │  │  ├─ migrate.js
│  │  │  ├─ migration-runner.js
│  │  │  ├─ migrations
│  │  │  │  ├─ 001_initial_schema.sql
│  │  │  │  └─ 004_add_election_management_tables.sql
│  │  │  ├─ python_migrations
│  │  │  │  ├─ 001_initial_schema.sql
│  │  │  │  ├─ 004_add_election_management_tables.py
│  │  │  │  ├─ README.md
│  │  │  │  ├─ add_user_created_at_column.py
│  │  │  │  ├─ create_sample_candidates.py
│  │  │  │  ├─ migrate.py
│  │  │  │  ├─ requirements.txt
│  │  │  │  ├─ run_migrations.sh
│  │  │  │  ├─ setup_president_vice_president.py
│  │  │  │  └─ verify_migrations.py
│  │  │  └─ setup.sql
│  │  ├─ docs
│  │  │  └─ swagger.ts
│  │  ├─ index.ts
│  │  ├─ middleware
│  │  │  ├─ admin.middleware.ts
│  │  │  ├─ auth.middleware.ts
│  │  │  └─ rateLimit.middleware.ts
│  │  ├─ routes
│  │  │  ├─ admin.route.ts
│  │  │  ├─ app.route.ts
│  │  │  ├─ audit.route.ts
│  │  │  ├─ election.route.ts
│  │  │  ├─ runoff.route.ts
│  │  │  └─ stats.route.ts
│  │  ├─ server.ts
│  │  ├─ services
│  │  │  ├─ admin.service.ts
│  │  │  ├─ app.service.ts
│  │  │  ├─ audit.service.ts
│  │  │  ├─ cache.service.ts
│  │  │  ├─ election.service.ts
│  │  │  ├─ logging.service.ts
│  │  │  ├─ runoff.service.ts
│  │  │  └─ stats.service.ts
│  │  └─ tests
│  │     ├─ .env.test
│  │     ├─ README.md
│  │     ├─ integration
│  │     │  └─ routes
│  │     │     └─ app.route.test.ts
│  │     ├─ setup.ts
│  │     ├─ types
│  │     │  └─ jest.d.ts
│  │     ├─ unit
│  │     │  └─ services
│  │     │     ├─ admin.service.test.ts
│  │     │     └─ cache.service.test.ts
│  │     └─ utils
│  │        └─ test-helpers.ts
│  ├─ test.ts
│  └─ tsconfig.json
├─ dmi-voting-system.zip
├─ dmi_voting_system_doc.md
└─ web
   ├─ .env.local
   ├─ App.tsx
   ├─ README.md
   ├─ components
   │  ├─ Button.tsx
   │  ├─ Card.tsx
   │  ├─ CountdownTimer.tsx
   │  ├─ Footer.tsx
   │  ├─ Header.tsx
   │  ├─ ImageUploader.tsx
   │  ├─ Modal.tsx
   │  └─ Spinner.tsx
   ├─ constants.tsx
   ├─ hooks
   │  ├─ useAdminUsers.ts
   │  ├─ useAuditLogs.ts
   │  ├─ useLiveStatsPolling.ts
   │  ├─ useOverallStats.ts
   │  ├─ usePermissions.ts
   │  └─ useVotingData.ts
   ├─ index.html
   ├─ index.tsx
   ├─ metadata.json
   ├─ package-lock.json
   ├─ package.json
   ├─ pages
   │  ├─ AdminDashboard.tsx
   │  ├─ AdminLoginPage.tsx
   │  ├─ AuthenticationPage.tsx
   │  ├─ HomePage.tsx
   │  ├─ IntroPage.tsx
   │  ├─ LiveResultsPage.tsx
   │  ├─ OfficialResultsPage.tsx
   │  ├─ ResultsPage.tsx
   │  ├─ VerificationPage.tsx
   │  ├─ VoteSuccessPage.tsx
   │  ├─ VotingPage.tsx
   │  └─ WinnersPage.tsx
   ├─ sjbu-voting-system.zip
   ├─ src
   │  └─ api
   │     └─ sjbuApi.ts
   ├─ tsconfig.json
   ├─ types.ts
   └─ vite.config.ts

```