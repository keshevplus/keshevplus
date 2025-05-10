@echo off
echo Updating database configuration...
echo DB_USER=postgres> temp_env.txt
echo DB_HOST=localhost>> temp_env.txt
echo DB_NAME=keshevplus>> temp_env.txt
echo DB_PASSWORD=jtg3C40nG4>> temp_env.txt
echo DB_PORT=5432>> temp_env.txt
echoDATABASE_URL=postgresql://keshevplus_owner:npg_cAU7Ctf3OmKz@ep-still-hat-a4dtitql-pooler.us-east-1.aws.neon.tech/keshevplus?sslmode=require> temp_env.txt

type .env | findstr /v "DB_USER DB_HOST DB_NAME DB_PASSWORD DB_PORT NEON_DATABASE_URL" >> temp_env.txt

move /y temp_env.txt .env

echo Database configuration updated successfully!
