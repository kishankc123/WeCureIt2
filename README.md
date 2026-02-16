# WeCureIt
## Getting Started
#### 1. Generate a good secret
```
openssl rand -base64 32
```
#### 2. Copy and paste the result into your .env like
```env
NEXTAUTH_SECRET=generated_value_here
```
#### 3. Setup database connection in the .env file like 
```env
DATABASE_URL=database_url_here
```
#### 4. Install dependencies 
```
npm install
```
#### 5. Run locally 
```
npm run dev
```

## when update the Prisma model
#### 1. Generate migration
Replace "init" with any name you want for the migration.
```
npx prisma migrate dev --name init
```
#### 2. (Optional) Push without Migration
```
npx prisma db push
```
#### 3. Generate Prisma Client (if needed)
```
npx prisma generate
```


## onDelete: Cascade
@relation(fields: [userId], references: [userId], onDelete: Cascade)
If the referenced user is deleted, this related record will also be deleted.

## configure Git to be case-sensitive locally
```
# Remove all files from Git's index
git rm -r --cached .

## Repository Rules:
- Work on each user story in it's own branch named as `epic_story_developer`. For example: `1_1_Dania`
- When story is complete create a pull request titled with the full story name. For example: `1.1 Hello World Page`. In the description, describe how thw story now meets acceptance criteria and request the verifier of the story to accept the pull request and merge to the main branch.

# Re-add everything with proper case sensitivity
git add .

# Commit and push
git commit -m "Completely reset file casing"
git push origin main
```
