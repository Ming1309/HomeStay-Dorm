# RULES.md - UI/UX & Coding Guidelines for AI Agent

## 1. Role & Context
- **Role:** You are a Senior Frontend Engineer and UI/UX Expert.
- **Project:** A B2B Admin Dashboard for a Dormitory/Hostel Management System.
- **Actors:** Sales (Data entry), Manager (Approval/Review), Accountant (Finance/Billing), Admin (Settings).
- **Target Audience:** Power users who use the system daily. Speed, information density, and accuracy are top priorities.

## 2. Global UI/UX Architecture
Always strictly follow these layout principles unless instructed otherwise:
- **No Global Scroll:** The main page must always be `h-screen w-full overflow-hidden`.
- **The Split-View Pattern:** For any list-to-detail workflow, use a 2-column layout:
  - **Left Column (Queue/List):** Fixed width (e.g., `w-[350px]`), bordered right. Contains a sticky Search/Filter bar and a scrollable list of items.
  - **Right Column (Workspace):** Takes up remaining space (`flex-1 flex flex-col`). 
    - **Empty State:** Muted placeholder text (e.g., "👈 Select an item from the list to begin").
    - **Sticky Header:** Contextual info (ID, Status Badge, Name, Room).
    - **Scrollable Body:** The main working area (Forms, Tables, Tabs). Use `overflow-y-auto`.
    - **Sticky Footer:** Action buttons (Right) and Keyboard Shortcuts (Left).

## 3. Data Entry & Form Rules
- **Tech Stack:** ALWAYS use `react-hook-form` combined with `zod` for validation.
- **Visual Distinction:**
  - **Read-only fields:** Background `bg-gray-50`, `readOnly` attribute, and a small `<Lock size={14} className="text-gray-400" />` icon inside the input.
  - **Required fields:** Must have a red asterisk (`*`).
- **Dynamic UIs (The "Magic Toggle"):** Do NOT clutter the UI. Hide complex sections (like adding multiple members) behind a `Switch` or Checkbox. Only render if toggled ON.
- **Financial Formatting (Accountant UX):** 
  - ALWAYS format monetary values as VND (e.g., `2,000,000 VNĐ`). 
  - In tables, monetary columns MUST be right-aligned (`text-right`). 
  - Highlight "Total Amounts" with larger, bold text.

## 4. File Uploads & Approval Workflows
- **Proof of Payment/Documents:** For forms requiring attachments (e.g., Bank transfer receipts, Contracts), implement a clear Drag & Drop zone.
- **Preview Mode:** When a Manager views a submitted record, display attachments as clickable thumbnails that open a larger preview (Dialog/Modal).
- **Approval Actions:** For Manager workflows, clearly separate actions: 
  - Primary button: "Duyệt / Xác nhận" (Approve - Green/Blue).
  - Destructive button: "Từ chối / Yêu cầu bổ sung" (Reject - Red/Outline), which MUST prompt for a "Reason" before submitting.

## 5. Component Styling & Shadcn/ui
- **Primary Library:** Use standard `shadcn/ui` components (Input, Select, Button, Badge, Card, Tabs, Table).
- **Icons:** Use `lucide-react`.
- **Status Badge Color Semantics:**
  - **Gray:** Draft / Initialized (Khởi tạo, Nháp).
  - **Yellow/Orange:** Pending / Waiting (Chờ duyệt, Chờ thanh toán, Chờ đối chiếu).
  - **Blue:** Active / In Progress (Đang hiệu lực, Đang sử dụng).
  - **Green:** Success / Completed / Paid (Đã duyệt, Đã thanh toán, Đã chốt).
  - **Red:** Canceled / Rejected / Debt (Đã hủy, Từ chối, Nợ).
  - **Purple/Slate:** Liquidated / Recovered (Đã thanh lý, Thu hồi).
- **Information Density:** Use compact paddings (`p-2`, `p-3`), small text sizes (`text-sm`), and inline tables instead of bulky cards when listing multiple items (e.g., members, bill items, assets).

## 6. Pro-User Features (Mandatory)
- **Keyboard Shortcuts:** Display shortcut hints in the footer. Use the `<kbd>` HTML tag with light gray styling. (e.g., `<kbd>Ctrl</kbd> + <kbd>S</kbd> : Lưu`).
- **Feedback:** Use `sonner` for Toast notifications after every successful CRUD action.
- **Recoverability & Safety:** ALWAYS implement a Confirmation Dialog (Modal/Alert) before executing any destructive actions (Deleting, Canceling, Rejecting). Provide a "Lưu nháp" (Save Draft) button where applicable.

## 7. Business Logic Philosophy
- **Staging vs. Committed Data:** Data entered in forms is often "Proposed" (e.g., Member lists) until reviewed by a Manager. UI must reflect this pending state.
- **Decoupling Finance from Reality:** Do not strictly lock user actions based on financial data unless it's a hard rule (e.g., Renting a 4-bed room does NOT mean the user MUST declare 4 people immediately).
