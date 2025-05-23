25-05-06 각 tab별 branch 추가함. main branch 제외 나머지 branch에서는 변경 사항만 push하기!  

25-04-25 main(master) commit log
assets 추가, package.json, package-lock.json 수정됨. 정상 작동 확인함.

25-04-11 Community commit log
App.js 수정됨. CommunityPage에 의존성 있어서 기존 branch에 App.js만 따로 올리진 않고 Community branch에 한꺼번에 commit 했어.

---

**상대방이 먼저 push한 변경사항이 있는데, 너는 pull 안 하고 작업을 시작한 상태**인 경우? 이럴 땐 **로컬 변경사항을 보존하면서 상대방 변경사항을 가져오는 게 중요**해.

아래 순서대로 처리하면 돼:

---

**✅ 1. 현재 상태 확인**

```
git status
```

로컬에서 수정한 파일이 있는지 확인. **커밋하지 않은 변경사항이 있다면**, 먼저 커밋하거나 stash 해두자.

---

**✅ 2. 로컬 변경사항 임시 저장 (옵션)**

변경사항이 커밋되지 않았다면:

```
git stash
```

로컬 변경사항을 임시로 숨겨두는 명령이야.

---

**✅ 3. 상대방의 변경사항 가져오기**

```
git pull --rebase
```

> --rebase 옵션을 쓰면 로컬 커밋을 상대방 변경사항 뒤에 깔끔하게 이어 붙여서 **히스토리가 더 정돈**돼.

---

**✅ 4. stash 복원 (stash 했을 경우)**

```
git stash pop
```

---

**✅ 5. 충돌 해결 (있을 경우)**

만약 충돌이 생기면 Git이 알려줘. 그 파일들을 직접 열어서 수동으로 충돌을 해결한 뒤에:

```
git add <충돌해결한파일>
git rebase --continue
```

---

**✅ 6. 최종 push**

```
git push
```

---

**한 줄 요약**

```
git stash
git pull --rebase
git stash pop
# 충돌 있을 경우:
# git add .
# git rebase --continue
git push
```

---

필요하면 상황에 맞춰 내가 도와줄게! 지금 구체적인 상태 알려줘도 되고. 😎
