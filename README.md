# K-Kitchen Deployment Guide

This guide provides the steps to deploy the K-Kitchen application to Firebase.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Authenticated with a Google account that has access to the Firebase project.

## Deployment Steps

Follow these steps in your terminal at the project root:

```shell
# 1. Firebase 로그인 (Log in to Firebase)
# If you are not already logged in, this will open a browser window for authentication.
firebase login

# 2. 프로젝트 설정 (Set the project)
# Replace 'your-project-id' with your actual Firebase project ID.
firebase use your-project-id

# 3. 호스팅 및 기능 일괄 배포 (Deploy Hosting & Functions)
# This command deploys the web hosting content and all associated cloud functions.
firebase deploy --only hosting,functions

# 4. 확인 (Confirmation)
# Upon successful deployment, the CLI will output:
# ✔ Deploy complete!
```

---

### 간단 배포 가이드 (Simple Deployment Guide)

1.  **터미널 열기 → 위 firebase 명령어 복사 → Enter!**  
    Open your terminal, copy the commands from the block above, and press Enter.

2.  **배포 완료시 "✔ Deploy complete!" 출력 → 내일부터 돈 들어옴**  
    When you see "✔ Deploy complete!", the deployment is finished. You are ready to start receiving payments from tomorrow.

3.  **문제시 "firebase deploy" 스크린샷 보내주세요!**  
    If you encounter any issues, please take a screenshot of the `firebase deploy` command and its output and send it over for support.
