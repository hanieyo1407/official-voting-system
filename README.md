
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
│  ├─ dist
│  │  ├─ config
│  │  │  └─ cloudinary.config.js
│  │  ├─ controllers
│  │  │  ├─ admin.controller.js
│  │  │  ├─ app.controller.js
│  │  │  ├─ audit.controller.js
│  │  │  ├─ election.controller.js
│  │  │  ├─ runoff.controller.js
│  │  │  └─ stats.controller.js
│  │  ├─ db
│  │  │  └─ config.js
│  │  ├─ docs
│  │  │  └─ swagger.js
│  │  ├─ index.js
│  │  ├─ middleware
│  │  │  ├─ admin.middleware.js
│  │  │  ├─ auth.middleware.js
│  │  │  └─ rateLimit.middleware.js
│  │  ├─ routes
│  │  │  ├─ admin.route.js
│  │  │  ├─ app.route.js
│  │  │  ├─ audit.route.js
│  │  │  ├─ election.route.js
│  │  │  ├─ runoff.route.js
│  │  │  └─ stats.route.js
│  │  ├─ server.js
│  │  ├─ services
│  │  │  ├─ admin.service.js
│  │  │  ├─ app.service.js
│  │  │  ├─ audit.service.js
│  │  │  ├─ cache.service.js
│  │  │  ├─ election.service.js
│  │  │  ├─ logging.service.js
│  │  │  ├─ runoff.service.js
│  │  │  └─ stats.service.js
│  │  └─ tests
│  │     ├─ integration
│  │     │  └─ routes
│  │     │     └─ app.route.test.js
│  │     ├─ setup.js
│  │     ├─ unit
│  │     │  └─ services
│  │     │     ├─ admin.service.test.js
│  │     │     └─ cache.service.test.js
│  │     └─ utils
│  │        └─ test-helpers.js
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
│  │  ├─ voting-2025-10-20.log
│  │  ├─ voting-2025-10-21.log
│  │  ├─ voting-2025-10-22.log
│  │  ├─ voting-2025-10-23.log
│  │  ├─ voting-2025-10-24.log
│  │  ├─ voting-2025-10-25.log
│  │  ├─ voting-2025-10-26.log
│  │  ├─ voting-2025-10-28.log
│  │  ├─ voting-2025-10-29.log
│  │  ├─ voting-2025-10-30.log
│  │  ├─ voting-2025-10-31.log
│  │  ├─ voting-2025-11-01.log
│  │  ├─ voting-2025-11-02.log
│  │  ├─ voting-2025-11-07.log
│  │  ├─ voting-2025-11-08.log
│  │  ├─ voting-2025-11-09.log
│  │  ├─ voting-2025-11-10.log
│  │  ├─ voting-2025-11-11.log
│  │  ├─ voting-2025-11-12.log
│  │  └─ voting-2025-11-13.log
│  ├─ logs\.477b1ee574ca8bf1a46c7e75ad6a78d6cc973473-audit.json
│  ├─ nodemon
│  ├─ nodemon.json
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ test.html
│  │  ├─ test2.html
│  │  └─ test3.html
│  ├─ sjbu-voting@1.0.0
│  ├─ src
│  │  ├─ config
│  │  │  └─ cloudinary.config.ts
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
├─ connect.py
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
   ├─ dist
   │  ├─ assets
   │  │  └─ index-Djoc84in.js
   │  └─ index.html
   ├─ hooks
   │  ├─ useAdminUsers.ts
   │  ├─ useAllPositions.ts
   │  ├─ useAuditLogs.ts
   │  ├─ useLiveStatsPolling.ts
   │  ├─ useOverallStats.ts
   │  ├─ usePermissions.ts
   │  ├─ useResultsStats.ts
   │  ├─ useVotingData.ts
   │  └─ useVotingTrends.ts
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
   │  ├─ api
   │  │  └─ sjbuApi.ts
   │  ├─ contexts
   │  │  └─ AuthContext.tsx
   │  └─ utils
   │     └─ refreshSession.ts
   ├─ tsconfig.json
   ├─ types.ts
   └─ vite.config.ts

```