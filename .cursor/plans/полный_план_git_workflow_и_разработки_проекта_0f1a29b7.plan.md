---
name: Полный план Git Workflow и разработки проекта
overview: "Объединенный план: инициализация Git, настройка CI/CD, разделение всего кода на 5 feature веток с детальной хронологией всех коммитов, merge в develop и релиз в master."
todos:
  - id: init-master
    content: Инициализировать Git, создать master с initial commit и .gitignore
    status: pending
  - id: create-develop
    content: Создать ветку develop от master
    status: pending
  - id: ci-cd-setup
    content: Создать feature/ci-cd-setup, сделать 10 коммитов с CI/CD, настроить защиту веток, PR и merge
    status: pending
  - id: backend-branch
    content: Создать feature/backend-api, подтянуть develop, сделать 26 коммитов, создать PR и merge в develop
    status: pending
  - id: frontend-core-branch
    content: Создать feature/frontend-core, подтянуть develop, сделать 33 коммита, PR и merge
    status: pending
  - id: canvas-branch
    content: Создать feature/canvas-drawing, подтянуть develop, сделать 34 коммита, PR и merge
    status: pending
  - id: tree-branch
    content: Создать feature/tree-animation, подтянуть develop, сделать 27 коммитов, PR и merge
    status: pending
  - id: integration-branch
    content: Создать feature/integration-polish, подтянуть develop, сделать 22 коммита, PR и merge
    status: pending
  - id: release-master
    content: Создать PR develop → master, code review, merge и автодеплой
    status: pending
---

# Полный план Git Workflow и разработки проекта DrawASnowflake

## Цель

Создать полную историю разработки проекта с правильным Git workflow, CI/CD и логическим разделением на feature ветки с множеством коммитов.

## Структура веток

- **master** - production-ready код (защищена, автодеплой)
- **develop** - интеграционная ветка (защищена)
- **feature/ci-cd-setup** - CI/CD и Git Workflow (10 коммитов)
- **feature/backend-api** - Backend API (26 коммитов)
- **feature/frontend-core** - Frontend Core (33 коммита)
- **feature/canvas-drawing** - Canvas Drawing (34 коммита)
- **feature/tree-animation** - Tree Animation (27 коммитов)
- **feature/integration-polish** - Integration & Polish (22 коммита)

## Детальная хронология разработки

### Этап 1: Инициализация проекта

**master:**

1. "Initial commit: Add project structure and .gitignore"

- Создать `.gitignore` (исключить `task.md`, `commit_time.md`, `scripts/`, `*.sh`)
- Создать базовую структуру папок

**develop:**

2. "Create develop branch from master"

---

### Этап 2: Настройка Git Workflow и CI/CD

**feature/ci-cd-setup:**

3. "Create feature/ci-cd-setup branch from develop"
4. "Add GitHub Actions CI workflow structure"
5. "Add lint and format checks to CI workflow"
6. "Add unit tests job to CI workflow"
7. "Add test coverage check (>= 80%) to CI"
8. "Add E2E tests job to CI workflow"
9. "Add build verification to CI workflow"
10. "Add deploy workflow for master branch"
11. "Add PR template"
12. "Update .gitignore with CI/CD exclusions"

**PR feature/ci-cd-setup → develop:**

13. "Create PR: CI/CD setup and GitHub Actions workflows"
14. "Merge feature/ci-cd-setup into develop"

**develop:**

15. "Configure GitHub branch protection for develop"
16. "Configure required status checks for develop"

**master:**

17. "Configure GitHub branch protection for master"
18. "Configure required status checks for master"
19. "Configure required PR reviews for master"

---

### Этап 3: Backend разработка (feature/backend-api)

**feature/backend-api:**

20. "Create feature/backend-api branch from develop"
21. "Pull latest changes from develop"
22. "Add backend package.json with Express and dependencies"
23. "Add TypeScript configuration for backend"
24. "Add backend ESLint configuration"
25. "Add backend Prettier configuration"
26. "Add Prisma schema for Snowflake model"
27. "Add Prisma client generation setup"
28. "Add Express server with basic setup"
29. "Add CORS middleware configuration"
30. "Add Helmet security middleware"
31. "Add rate limiting middleware"
32. "Add health check route"
33. "Add health route unit tests"
34. "Add snowflake controller with getAll method"
35. "Add snowflake controller with create method"
36. "Add snowflake controller with getById method"
37. "Add snowflake controller with update and delete methods"
38. "Add snowflake controller unit tests"
39. "Add snowflake routes"
40. "Add snowflake routes unit tests"
41. "Add error handling middleware"
42. "Add Sentry integration for error tracking"
43. "Add Sentry utils unit tests"
44. "Add rate limiter unit tests"
45. "Add backend Jest configuration"
46. "Update Makefile with backend commands"

**PR feature/backend-api → develop:**

47. "Create PR: Backend API implementation"
48. "Merge feature/backend-api into develop"

---

### Этап 4: Frontend Core разработка (feature/frontend-core)

**feature/frontend-core:**

31. "Create feature/frontend-core branch from develop"
32. "Pull latest changes from develop"
33. "Add frontend package.json with React and dependencies"
34. "Add TypeScript configuration for frontend"
35. "Add TypeScript node configuration"
36. "Add Vite build configuration"
37. "Add frontend ESLint configuration"
38. "Add frontend Prettier configuration"
39. "Add frontend Stylelint configuration"
40. "Add frontend Jest configuration"
41. "Add Playwright E2E test configuration"
42. "Add Redux store setup"
43. "Add drawing slice for canvas tools state"
44. "Add drawing slice unit tests"
45. "Add history slice for undo/redo functionality"
46. "Add history slice unit tests"
47. "Add snowflake slice for snowflakes state management"
48. "Add snowflake slice unit tests"
49. "Add custom Redux hooks (useAppDispatch, useAppSelector)"
50. "Add Redux hooks unit tests"
51. "Add React Router setup"
52. "Add App component with routing"
53. "Add App component unit tests"
54. "Add theme configuration with Material-UI"
55. "Add theme unit tests"
56. "Add global CSS styles"
57. "Add constants configuration file"
58. "Add API service for backend communication"
59. "Add API service unit tests"
60. "Add setupTests for Jest"
61. "Add unit tests for Redux store"
62. "Add index.html entry point"
63. "Add main.tsx with app initialization"

**PR feature/frontend-core → develop:**

82. "Create PR: Frontend core infrastructure"
83. "Merge feature/frontend-core into develop"

---

### Этап 5: Canvas Drawing разработка (feature/canvas-drawing)

**feature/canvas-drawing:**

84. "Create feature/canvas-drawing branch from develop"
85. "Pull latest changes from develop"
86. "Add Canvas component with basic structure"
87. "Add canvas drawing state management"
88. "Add pencil tool implementation"
89. "Add eraser tool implementation"
90. "Add brush size control"
91. "Add zoom functionality to canvas"
92. "Add offscreen canvas for performance optimization"
93. "Add stroke history tracking integration"
94. "Add canvas clear functionality"
95. "Add image data extraction from canvas"
96. "Add ColorPicker component"
97. "Add ColorPicker component unit tests"
98. "Add canvas export utilities"
99. "Add export utilities unit tests"
100. "Add clipboard copy functionality"
101. "Add local storage utilities"
102. "Add storage utilities unit tests"
103. "Add snowflake analysis utility"
104. "Add snowflake analysis unit tests"
105. "Add Header component"
106. "Add Header component unit tests"
107. "Add Toolbar component with drawing tools"
108. "Add Toolbar component unit tests"
109. "Add DrawPage component"
110. "Add similarity analysis display"
111. "Add integration with Redux for drawing state"
112. "Add Canvas component unit tests"
113. "Add Canvas integration tests"
114. "Add DrawPage unit tests"
115. "Add DrawPage integration tests"
116. "Add E2E tests for drawing functionality"
117. "Add E2E tests for navigation"

**PR feature/canvas-drawing → develop:**

100. "Create PR: Canvas drawing functionality"
101. "Merge feature/canvas-drawing into develop"

---

### Этап 6: Tree Animation разработка (feature/tree-animation)

**feature/tree-animation:**

102. "Create feature/tree-animation branch from develop"
103. "Pull latest changes from develop"
104. "Add Tree component structure"
105. "Add TreeCanvas component"
106. "Add canvas rendering for tree background"
107. "Add snowflake rendering logic"
108. "Add snowflake falling animation"
109. "Add snowflake rotation animation"
110. "Add snowflake drift animation"
111. "Add requestAnimationFrame animation loop"
112. "Add snowflake spawn logic"
113. "Add snowflake reset logic when off-screen"
114. "Add animation speed control"
115. "Add animation pause/resume functionality"
116. "Add TreePage component"
117. "Add integration with Redux for snowflakes state"
118. "Add server snowflakes loading"
119. "Add snowflake position clamping"
120. "Add toolbar for tree page"
121. "Add export functionality for tree"
122. "Add copy to clipboard for tree"
123. "Add Tree component unit tests"
124. "Add TreeCanvas component unit tests"
125. "Add TreePage unit tests"
126. "Add Tree integration tests"
127. "Add E2E tests for tree page"
128. "Add E2E tests for tree animation"

**PR feature/tree-animation → develop:**

147. "Create PR: Tree and animation functionality"
148. "Merge feature/tree-animation into develop"

---

### Этап 7: Integration & Polish (feature/integration-polish)

**feature/integration-polish:**

149. "Create feature/integration-polish branch from develop"
150. "Pull latest changes from develop"
151. "Add i18n infrastructure"
152. "Add English locale translations"
153. "Add Russian locale translations"
154. "Replace hardcoded strings in Header with i18n"
155. "Replace hardcoded strings in Toolbar with i18n"
156. "Replace hardcoded strings in DrawPage with i18n"
157. "Add analytics integration (Google Analytics)"
158. "Add analytics unit tests"
159. "Add Sentry integration for frontend"
160. "Add Sentry utils unit tests for frontend"
161. "Add E2E tests for API integration"
162. "Add E2E tests for responsive design"
163. "Add extended tests for Canvas component"
164. "Add extended tests for DrawPage"
165. "Add extended tests for TreePage"
166. "Add extended tests for Toolbar"
167. "Add integration tests for DrawPage"
168. "Add integration tests for Toolbar"
169. "Add GitHub Actions CI workflow"
170. "Add lint and format checks to CI"
171. "Add unit tests with coverage check to CI"
172. "Add E2E tests to CI"
173. "Add build verification to CI"
174. "Add deploy workflow for master branch"
175. "Add PR template"
176. "Update Makefile with all commands"
177. "Update .gitignore with final exclusions"

**PR feature/integration-polish → develop:**

160. "Create PR: Integration, i18n, testing and CI/CD"
161. "Merge feature/integration-polish into develop"

---

### Этап 7: Настройка защиты веток и CI/CD

**develop:**

162. "Configure GitHub branch protection for develop"
163. "Configure required status checks for develop"

**master:**

164. "Configure GitHub branch protection for master"
165. "Configure required status checks for master"
166. "Configure required PR reviews for master"

---

### Этап 8: Release в master

**PR develop → master:**

167. "Create PR: Release v1.0.0 - Complete DrawASnowflake application"
168. "Code review and approval"
169. "Merge develop into master"

**master (автоматически через CI/CD):**

170. "Auto-deploy: Build and deploy application"
171. "Auto-deploy: Run production health checks"

---

## Итого коммитов по веткам

- **master**: 1 коммит (initial)
- **develop**: 1 коммит (branch creation)
- **feature/ci-cd-setup**: 10 коммитов (3-12) + merge
- **Настройка защиты веток**: 3 коммита (15-19)
- **feature/backend-api**: 26 коммитов (20-46) + merge
- **feature/frontend-core**: 33 коммита (49-81) + merge
- **feature/canvas-drawing**: 34 коммита (84-117) + merge
- **feature/tree-animation**: 27 коммитов (120-146) + merge
- **feature/integration-polish**: 22 коммита (149-170) + merge
- **PR и merge коммиты**: 12 коммитов
- **Release в master**: 3 коммита (173-175)
- **Auto-deploy**: 2 коммита (176-177)

**Всего: ~177 коммитов**

## Важные детали

### Порядок работы с ветками

1. **feature/ci-cd-setup** создается первой для настройки CI/CD и защиты веток
2. **feature/backend-api** создается после настройки CI/CD, так как backend - основа
3. **feature/frontend-core** создается после merge backend, так как нужен API
4. **feature/canvas-drawing** создается после frontend-core, использует Redux store
5. **feature/tree-animation** создается параллельно или после canvas-drawing
6. **feature/integration-polish** создается последней, так как интегрирует все части

### Pull и обновление веток

- Каждая новая feature ветка должна делать `git pull origin develop` после создания
- Перед созданием PR ветка должна быть обновлена из develop
- Конфликты решаются в feature ветках перед merge

### PR процесс

1. Создать PR через GitHub
2. Дождаться прохождения всех CI checks
3. Code review (если требуется)
4. Merge через GitHub (squash или merge commit)
5. Удалить feature ветку после merge

### CI/CD требования

- Все PR должны проходить CI checks
- Coverage должен быть >= 80%
- Все тесты должны проходить
- Линтеры должны проходить
- Build должен быть успешным

## Файлы которые НИКОГДА не коммитить

- `task.md`
- `commit_time.md`
- `scripts/*.sh`
- Любые временные скрипты для работы с Git
- `.env` файлы
- `node_modules/`

## GitHub Actions Workflows

### `.github/workflows/ci.yml`

- Создается в **feature/ci-cd-setup** (коммиты 4-9)
- Триггер: `pull_request`, `push` в `develop`/`master`
- Jobs: lint, format, unit-tests, e2e-tests, build
- Status checks для защиты веток
- Проверка coverage >= 80%

### `.github/workflows/deploy.yml`

- Создается в **feature/ci-cd-setup** (коммит 10)
- Триггер: `push` в `master`
- Jobs: build, deploy
- Использование secrets для credentials

## Защита веток

### develop

- Require pull request reviews (1 reviewer)
- Require status checks to pass
- Require branches to be up to date
- Allow force pushes: false

### master

- Require pull request reviews (1 reviewer)