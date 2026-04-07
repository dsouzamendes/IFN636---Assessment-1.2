
**Assessment 1.2 (Total Marks **20**)**

Assignment: **Software requirements analysis and design (**Full-Stack CRUD Application Development with DevOps Practices**)**

Instance ID: i-04f4070b30ab93957 
Instance Name: 1.2 Daniel Souza Mendes

---

# Personal Diary App

A full-stack Personal Diary application built with the MERN stack (MongoDB, Express, React, Node.js).

---

## Project Setup Instructions

1. Start the EC2 instance from the AWS Console if it is stopped
2. SSH into the instance:
   ```
   Host: 3.106.200.137
   User: ubuntu
   Password: 123456
   ```
   ## IMPORTANT If instance was stopped, upon restart the public ip changes !
3. Get the current public IP:
   ```bash
   curl ifconfig.me
   ```
   OR in EC2 AWS portal

4. Update `frontend/src/axiosConfig.jsx` with the current public IP:
   ```javascript
   baseURL: 'http://YOUR_CURRENT_PUBLIC_IP',
   ```
5. Commit and push to `main`:
   ```bash
   git add frontend/src/axiosConfig.jsx
   git commit -m "update EC2 IP"
   git push origin main
   ```
6. The CI/CD pipeline will automatically rebuild and redeploy the app
7. Access the app at `http://YOUR_CURRENT_PUBLIC_IP`

---

## Current Public URL

**http://3.106.200.137**

---

## Admin Access

| Field | Value |
|-------|-------|
| Email | admin@email.com |
| Password | 123456 |

Feel free to create new entries, edit entries, delete entries and in the admin dashboard delete existing users.
You can also create a general user account and navigate.
 
---

**GitHub link of the starter project: **[https://github.com/nahaQUT/sampleapp_IFQ636.git](https://github.com/nahaQUT/sampleapp_IFQ636.git)

---

