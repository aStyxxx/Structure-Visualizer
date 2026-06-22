# Structure Visualizer (StructVis)

[English](#english-version) | [Українська](#українська-версія)

## English Version

**StructVis** is an interactive data structure visualizer designed to help understand how fundamental data structures (linked lists, graphs, trees, etc.) and algorithms work "under the hood".

The project features:
- Interactive visual tracing of operations in real-time.
- Code snippets for each data structure in multiple languages (C++, Python, Java, JavaScript).
- Block-based script building for visual algorithm creation.
- Bilingual support (English and Ukrainian).

### 🛠 Tech Stack

The project is built as a static web application using core web technologies and configured for deployment via Cloudflare Pages:
- **Frontend:** HTML5, Vanilla JavaScript (`script.js`), CSS3 (`style.css`).
- **Fonts:** Google Fonts (Inter, Fira Code).
- **Deployment and Infrastructure:** [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/) (`wrangler.jsonc`).

### 🚀 Local Installation and Setup

Since this is a static web application, there are two main ways to run it: simple (via browser) and using the Cloudflare development environment.

#### Option 1: Simple Run (No Dependencies)
1. Clone the repository to your local machine:
   ```bash
   git clone <your-repository-url>
   cd Structure-Visualizer
   ```
2. Simply open the `index.html` file in any modern web browser (Chrome, Firefox, Safari, etc.).

#### Option 2: Run via Cloudflare Wrangler (Recommended for Development)
If you plan to deploy the project to Cloudflare Pages or want to test it with a local server:
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Install Cloudflare Wrangler globally:
   ```bash
   npm install -g wrangler
   ```
3. Navigate to the project directory:
   ```bash
   cd Structure-Visualizer
   ```

### 💻 Commands to Run the Project

If you are using **Wrangler**, start the local development server with the command:
```bash
wrangler pages dev .
```
After executing this command, the terminal will display a local address (usually `http://localhost:8788`) where you can open the application.

### 📂 Project Structure

Since the project is highly compact, the core logic is divided into a few key files in the root directory:

- `index.html` — main markup file. Contains the structure of the home page, main visualizer, sidebar, blocks panel, and modals.
- `style.css` — application styles. Uses a modern design with "glassmorphism" effects, dark themes, and a responsive layout.
- `script.js` — core of the project. Contains all business logic: UI management, Canvas rendering, algorithm logic, block-script support, and language switching.
- `wrangler.jsonc` — Cloudflare Wrangler configuration file that specifies the current directory as the assets folder for deployment and includes basic settings (e.g., Node.js compatibility).
- `LICENSE` — the license under which this project is distributed.

---

## Українська версія

**StructVis** — це інтерактивний візуалізатор структур даних, створений для допомоги у розумінні того, як фундаментальні структури даних (зв'язні списки, графи, дерева тощо) та алгоритми працюють. 

Проект пропонує:
- Інтерактивне візуальне відстеження операцій у реальному часі.
- Перегляд прикладів коду для кожної структури даних на кількох мовах (C++, Python, Java, JavaScript).
- Блокову побудову скриптів для наочного створення алгоритмів.
- Підтримку двомовності (Англійська та Українська мови).

### 🛠 Стек технологій

Проект побудований як статичний веб-додаток з використанням базових веб-технологій та налаштований для розгортання через Cloudflare Pages:
- **Frontend:** HTML5, Vanilla JavaScript (`script.js`), CSS3 (`style.css`).
- **Шрифти:** Google Fonts (Inter, Fira Code).
- **Розгортання та інфраструктура:** [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/) (`wrangler.jsonc`).

### 🚀 Інструкції з локального встановлення та налаштування

Оскільки це статичний веб-додаток, є два основних способи запуску: простий (через браузер) та за допомогою середовища розробки Cloudflare.

#### Варіант 1: Простий запуск (без встановлення залежностей)
1. Склонуйте репозиторій на свій комп'ютер:
   ```bash
   git clone <url-вашого-репозиторію>
   cd Structure-Visualizer
   ```
2. Просто відкрийте файл `index.html` у будь-якому сучасному веб-браузері (Chrome, Firefox, Safari тощо).

#### Варіант 2: Запуск через Cloudflare Wrangler (Рекомендовано для розробки)
Якщо ви плануєте розгортати проект на Cloudflare Pages або бажаєте тестувати його з локальним сервером:
1. Переконайтеся, що у вас встановлено [Node.js](https://nodejs.org/).
2. Встановіть Cloudflare Wrangler глобально:
   ```bash
   npm install -g wrangler
   ```
3. Перейдіть до директорії проекту:
   ```bash
   cd Structure-Visualizer
   ```

### 💻 Команди для запуску проекту

Якщо ви використовуєте **Wrangler**, запустіть локальний сервер розробки за допомогою команди:
```bash
wrangler pages dev .
```
Після виконання цієї команди термінал покаже локальну адресу (зазвичай `http://localhost:8788`), за якою ви зможете відкрити додаток.

### 📂 Структура проекту

Оскільки проект максимально компактний, основна логіка розділена на кілька ключових файлів у кореневій директорії:

- `index.html` — головний файл розмітки. Містить структуру домашньої сторінки, головного візуалізатора, бічної панелі, панелі блоків та модальних вікон.
- `style.css` — стилі додатку. Використовує сучасний дизайн з ефектами "glassmorphism", темними темами та адаптивним макетом.
- `script.js` — ядро проекту. Містить усю бізнес-логіку: керування UI, рендеринг візуалізацій на Canvas, логіку алгоритмів, підтримку блокових скриптів та перемикання мов.
- `wrangler.jsonc` — файл конфігурації Cloudflare Wrangler, який визначає поточну директорію як папку з ассетами для розгортання та включає базові налаштування (наприклад, сумісність з Node.js).
- `LICENSE` — ліцензія, за якою розповсюджується даний проект.
