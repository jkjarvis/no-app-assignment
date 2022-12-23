# no-app-assignment

# How To Run
1. `npm install`
2. `node main.js`

# For Creating User

`curl --location --request POST 'http://localhost:3000/create-user' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "USERNAME",
    "password": "PASSWORD"
}'`

# For Login

`curl --location --request POST 'http://localhost:3000/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "USERNAME",
    "password": "PASSWORD"
}'`

# For Uploading Contacts.csv

`curl --location --request POST 'http://localhost:3000/upload-contacts' \
--header 'x-access-token: TOKEN_HERE' \
--form 'contacts=@"/home/jkjarvis/Desktop/test.csv"'`
