# Database Migration Plan: Supabase → Local PostgreSQL

## Project Context
- **Current DB**: Supabase (PostgreSQL-based)
- **Target DB**: Local PostgreSQL via pgAdmin
- **App**: Next.js auction platform
- **Current Setup**: Uses `pg` package, schema already defined in `scripts/schema.sql`
- **Migration Type**: Start fresh (no data export needed)

## Summary
Migrate from cloud-based Supabase to a local PostgreSQL database managed through pgAdmin. This includes: (1) installing PostgreSQL locally, (2) setting up pgAdmin, (3) creating database and schema, (4) updating environment variables, and (5) testing connections.

### Key Discovery Findings
- Code is already PostgreSQL-ready (uses `pg` package)
- Schema is well-organized in `scripts/schema.sql` with triggers and indexes
- Database connection pooling already configured in `src/lib/database.ts`
- Setup script exists: `scripts/setup-db.js`
- Environment variables in `.env.local`

---

## Detailed Steps

### Phase 1: Local PostgreSQL Setup

**Step 1.1: Install PostgreSQL via Homebrew**
```bash
brew install postgresql@15
```
- Creates a default `postgres` user with no password (local connection)
- Initializes data directory at `/usr/local/var/postgres`
- Version 15 is stable and compatible with your schema

**Step 1.2: Start PostgreSQL Service**
```bash
# Start PostgreSQL immediately
brew services start postgresql@15

# Verify it's running
psql -U postgres -c "SELECT version();"
```
Expected output shows PostgreSQL 15.x version info.

**Step 1.3: Create AuctioHub Database and User**
```bash
# Connect as default postgres user
psql -U postgres

# Inside psql:
CREATE USER auctiohub_user WITH PASSWORD 'YourSecurePassword123';
CREATE DATABASE auctiohub_db OWNER auctiohub_user;
GRANT ALL PRIVILEGES ON DATABASE auctiohub_db TO auctiohub_user;
\q
```
Replace `YourSecurePassword123` with a strong password. You'll need this for the connection string.

---

### Phase 2: pgAdmin Installation & Configuration

**Step 2.1: Install pgAdmin 4 (Desktop)**
Download from [pgadmin.org](https://www.pgadmin.org/download/pgadmin-4-macos/) and install like a normal macOS app.

Alternatively, via Homebrew:
```bash
brew install pgadmin4
```

**Step 2.2: Launch pgAdmin**
- Open pgAdmin 4 from Applications or run: `pgadmin4`
- A web browser will open at `http://localhost` (default port 5050)
- Create a master password on first launch

**Step 2.3: Register Local PostgreSQL Connection in pgAdmin**
1. In pgAdmin left panel, right-click **Servers** → **Create** → **Server**
2. Fill in:
   - **Name**: `AuctioHub Local`
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Username**: `auctiohub_user`
   - **Password**: The password from Step 1.3
   - **Save password**: ✓ (for convenience)
3. Click **Save**
4. You should now see `AuctioHub Local` in the Servers list

---

### Phase 3: Database Schema & Data

**Step 3.1: Import Schema via pgAdmin**
1. In pgAdmin, expand `AuctioHub Local` → **Databases** → `auctiohub_db`
2. Right-click `auctiohub_db` → **Query Tool**
3. Open file: `scripts/schema.sql` from your project
4. Copy all content and paste into the Query Tool
5. Click the **Execute** button (or press F5)

Expected result:
- No errors appear
- Status shows: "Query executed successfully"
- In the left panel, expand `auctiohub_db` → **Schemas** → **public** → **Tables**
- You should see 7 tables:
  - `users`
  - `carousel_images`
  - `new_arrivals`
  - `admin_settings`
  - `products`
  - `bids`
  - `chat_messages`

**Step 3.2: Verify Triggers and Indexes**
In pgAdmin Query Tool, run:
```sql
-- Check all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check all indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- Check triggers
SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';
```
All should return results matching your schema.

---

### Phase 4: Update Application Configuration

**Step 4.1: Update `.env.local`**
Edit the file: `.env.local`

Change:
```
# OLD (Supabase):
DATABASE_URL="postgresql://postgres.jopmcirzstspdplvpimv:Auctiohub123@@@@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"

# NEW (Local PostgreSQL):
DATABASE_URL="postgresql://auctiohub_user:YourSecurePassword123@localhost:5432/auctiohub_db"
```

Replace `YourSecurePassword123` with the password you set in Step 1.3.

**Step 4.2: Verify No Other Changes Needed**
Your codebase is already PostgreSQL-compatible:
- `src/lib/database.ts` — Connection pool already configured ✓
- `scripts/setup-db.js` — Can be used as alternative to manual setup ✓
- `src/lib/auth.ts` — Uses your database connection ✓
- All models (`src/lib/models.ts`) — Already using PostgreSQL queries ✓

No code changes required.

---

### Phase 5: Verification & Testing

**Step 5.1: Test Database Connection Locally**
```bash
# From project root, test connection:
psql postgresql://auctiohub_user:YourSecurePassword123@localhost:5432/auctiohub_db -c "SELECT COUNT(*) FROM users;"
```
Should return: `count: 0` (empty users table, expected)

**Step 5.2: Start Your Next.js Application**
```bash
# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```
Check terminal output for:
```
PostgreSQL connected successfully
```

If you see this, your app is connected to the local database.

**Step 5.3: Test Authentication**
1. Open browser: `http://localhost:3000`
2. Click **Sign In** and authenticate via Google
3. In pgAdmin, run:
   ```sql
   SELECT * FROM users;
   ```
4. You should see a new row with your Google account email ✓

**Step 5.4: Test API Endpoints**
- Visit `/api/products` endpoint (via Postman or browser)
- Should return empty array `[]` (no products yet, expected)
- Create a product via UI and verify it appears in pgAdmin:
  ```sql
  SELECT * FROM products;
  ```

---

## Troubleshooting

### PostgreSQL Won't Start
```bash
# Check if already running
brew services list

# If stuck, force restart
brew services stop postgresql@15
brew services start postgresql@15
```

### Connection Refused When App Starts
- Verify PostgreSQL is running: `brew services list`
- Check `.env.local` DATABASE_URL is correct
- Verify password matches Step 1.3

### "Database does not exist" Error
- Confirm database was created in Step 1.3
- In pgAdmin, expand `Databases` and look for `auctiohub_db`
- Re-run creation SQL if missing

### Schema Not Imported
- Check pgAdmin Query Tool shows "Query executed successfully"
- Verify you're in the correct database (`auctiohub_db`, not `postgres`)
- Check for any error messages in red text

### Can't Connect via pgAdmin
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1;"`
- Check Host is `localhost` and Port is `5432`
- Verify username/password from Step 1.3

---

## Verification Checklist

- [ ] PostgreSQL installed and running (`brew services list` shows `postgresql@15` started)
- [ ] Local database and user created (`auctiohub_db`, `auctiohub_user`)
- [ ] pgAdmin installed and accessible (`http://localhost:5050`)
- [ ] pgAdmin connection to `AuctioHub Local` server established
- [ ] Schema imported successfully (7 tables visible in pgAdmin)
- [ ] `.env.local` DATABASE_URL updated with local connection string
- [ ] App starts with "PostgreSQL connected successfully" message
- [ ] Google authentication works and creates user in `users` table
- [ ] API endpoints return data from local database

---

## Next Steps (After Migration)

1. **Backup Supabase Data** (Optional)
   - Export data from Supabase console before closing account
   - Keep backup in case you need it later

2. **Production Deployment** (When Ready)
   - Deploy app to cloud (Vercel, AWS, etc.)
   - Use cloud PostgreSQL (Render, Railway, AWS RDS)
   - Update `.env` for production with cloud connection string

3. **Continuous Development**
   - Local dev: Use this local PostgreSQL setup
   - Production: Use separate cloud database
   - Use different `.env` files for each environment

---

## Migration Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Database** | Supabase (cloud) | PostgreSQL 15 (local) |
| **Management** | Supabase console | pgAdmin 4 (web UI) |
| **Connection** | Over internet | localhost:5432 |
| **Cost** | Supabase pricing | Free (local) |
| **Downtime** | None (parallel switch) | ~10 minutes |
| **Code Changes** | None | Update `.env.local` only |
| **Backup** | Supabase automatic | Manual (recommended) |

---

## Important Notes

- **Local development only**: This setup is for development. For production, use cloud PostgreSQL.
- **No data loss risk**: Starting fresh, no existing data to worry about.
- **SSL not needed**: Local connections don't need SSL; already configured in code.
- **Password security**: Change `YourSecurePassword123` to something unique; don't share.
- **Revert easily**: Keep `.env.local` backup; switch back to Supabase by reverting connection string.
