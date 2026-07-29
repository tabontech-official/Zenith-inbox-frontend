# Zenith Inbox & Automation Engine — Frontend

A modern, high-performance web application for lead routing, automated email communications, interactive scenario builder workflows, and service templates management.

---

## 🚀 Features

- **Interactive Scenario Canvas Builder**: Visual flow builder powered by `@xyflow/react` / `reactflow` for configuring leads, filters, condition nodes, delays, and automated email responses.
- **Unified Email Inbox**: Manage incoming lead inquiries, direct customer replies, attachment rendering, manual/automated email responses, and thread tracking.
- **Service & Custom Templates**: Rich WYSIWYG editor (ReactQuill) with variable dynamic tag chips (`{{FullName}}`, `{{StoreURL}}`, etc.), status toggles, and service filters.
- **Multi-Provider Connections**: Seamless integration setup wizard for Gmail OAuth2, Microsoft Outlook OAuth2, and custom SMTP / IMAP / Mailhook accounts.
- **Webhook & Router Engine**: Configure webhook endpoints and branch routing based on subject lines, body contents, and customer service criteria.
- **Admin Management Portal**: Administrative tools for system metrics, user oversight, active connections, scenarios list, and product management.
- **Design & UI**: Custom design system using soft warm backgrounds (`#FAF8F5`), dark top header bars (`#111110`), rounded cards, and responsive sidebar navigation.

---

## 🛠️ Technology Stack

- **Core**: React 18, JavaScript (ES6+), React Router v6
- **Workflow & Flow Visualizer**: `@xyflow/react`, `reactflow`, `@dnd-kit/core`
- **Styling & Icons**: Tailwind CSS, Lucide React, React Icons (`fi`), FontAwesome
- **Rich Text Editor**: `react-quill`, `@tiptap/react`
- **HTTP Client & State**: Axios, React Context API (`UserContext`), React Hot Toast
- **Build Tools**: `react-app-rewired`, `babel`

---

## 📁 Directory Structure

```
Zenith-inbox-frontend/
├── public/                  # Static assets and index.html
├── src/
│   ├── assets/              # Logos and graphics
│   ├── component/           # Reusable UI components
│   │   ├── ConnectionModal.js
│   │   ├── MailhookConnectionModal.js
│   │   ├── OutlookConnectionModal.js
│   │   ├── Sidebar.js
│   │   └── WebhookModal.js
│   ├── nodes/               # Flow builder custom nodes
│   │   ├── RouterNode.jsx
│   │   └── conditionNode.jsx
│   ├── pages/               # Top-level routes & application views
│   │   ├── AllScenario.js
│   │   ├── BuildScenario.js
│   │   ├── Connection.js
│   │   ├── CustomTemplate.js
│   │   ├── Inbox.js
│   │   ├── OtherScenario.js
│   │   ├── ShopifyScenario.js
│   │   └── Template.js
│   ├── App.js               # Main routing & app configuration
│   └── index.js             # Entry point
├── package.json
└── README.md
```

---

## 💻 Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Zenith-inbox-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   The application will run on `http://localhost:3006`.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🔗 Key Navigation Routes

| Route | Component | Description |
|---|---|---|
| `/dashboard` | `BuildScenario` | Main Dashboard & Quick Scenario Setup |
| `/scenarios/all` | `AllScenario` | Scenarios Overview Table |
| `/scenarios/shopify` | `ShopifyScenario` | Shopify Partner Directory Automation Flow |
| `/scenarios/others` | `OtherScenario` | Custom Automation Flow Builder |
| `/templates` | `Template` | Shopify Service Templates Page |
| `/templates/general` | `CustomTemplate` | Custom Response Templates Page |
| `/inbox` | `Inbox` | Unified Lead & Email Inbox |
| `/connection` | `Connection` | Email & Webhook Connections Setup |

---

## 📜 License

This project is licensed under the MIT License.
