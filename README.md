# Quản lý Nhân sự & Công việc — Trung Tâm Truyền Thông - Tổ Chức Sự Kiện

> 🔗 **Bản demo (GitHub Pages):** https://minhphus2912-lab.github.io/comms-task-manager/
> Đăng nhập demo: mã `TP01` · `PP01` · `TT01` … — PIN `123456`.
> ⚠️ Đây là **bản demo chạy độc lập**: dữ liệu chỉ lưu trong trình duyệt của bạn (localStorage), **không đồng bộ nhiều người**, trợ lý AI tắt. Bản chạy thật (nhiều người dùng, dữ liệu chung) được triển khai trên **Google Apps Script + Google Sheets** — xem mục "Triển khai" bên dưới.

Web app quản lý công việc nội bộ cho Trung Tâm Truyền Thông - Tổ Chức Sự Kiện. Chạy bằng
**Google Apps Script (Web App)** + lưu dữ liệu trên **Google Sheets**, có thể nhúng vào
**Google Sites**.

- 🎨 Giao diện **glassmorphism iOS 26**, 3 màu chính phối xen kẽ: **Cam `#EE6823`** · **Xanh nhạt `#17479D`** · **Xanh đậm `#21217D`**; hover nhấc nhẹ (không lắc lư), icon xoay ngang.
- 🔐 Đăng nhập **tự quản lý**: chọn tên + nhập **mã PIN cá nhân** — không cần tài khoản Google riêng.
- 👥 7 vai trò: **Trưởng phòng**, **Phó phòng**, **Chuyên viên** + 4 vai trò Production Crew (**Lead Production**, **Sub-Lead Quay**, **Sub-Lead Chụp**, **Thành viên**). Lead/Sub-Lead là quản lý crew; **Thành viên** là vai trò crew cơ bản (chỉ làm việc của mình).
- 🚀 Quản lý **Dự án (Projects)** song song với **công việc daily**, mỗi nhánh có cách tính KPI riêng.
- 🎬 Mục **Production Crew** đặc quyền (Dashboard · Công việc · Nhân sự · Thống kê) cho đội quay/chụp/dựng.
- 📅 **Lịch cá nhân** (mọi người): xem công việc của mình theo **Tuần / Tháng / Năm**, đặt theo **hạn chót (deadline)** vào đúng ô ngày; bấm tháng ở chế độ Năm để xem chi tiết.
- 🖼️ **Ảnh đại diện**: bấm vào tên mình ở thanh bên để đổi avatar (ảnh tự thu nhỏ về 256px, nén JPEG, lưu kèm hồ sơ).
- 🔒 Quy trình task (bắt đầu/tạm hoãn/.../ghi chú) **chỉ chính người được giao** thao tác được — kể cả Trưởng/Phó phòng cũng không thao tác hộ.
- 🛡️ **Phân quyền hiển thị theo cấp:** vai trò thấp **không xem được** thông tin (việc/KPI/nhân sự) của vai trò cao hơn (Phó phòng không thấy Trưởng phòng…).
- 🚫 **Production Crew tách biệt hoàn toàn** với Phòng: thành viên crew không thấy bất kỳ việc/dự án/nhân sự nào của Phòng (một chiều — Trưởng/Phó phòng vẫn giám sát được crew). Đăng nhập bằng **gõ mã + PIN** (không liệt kê danh sách nhân sự).
- ✨ Trợ lý **AI (Gemini)** viết brief công việc & gợi ý hướng xử lý (tùy chọn, proxy server-side).
- ⚡ Giao diện **iOS 26 "Liquid Glass"** trong suốt, blur nhẹ tối ưu hiệu năng; khung hover nhấc nhẹ tĩnh (đã bỏ animation lắc lư lặp), chỉ icon xoay ngang.

> **Một codebase, hai chế độ chạy** — `JsClient.html` tự dò môi trường: có `google.script.run`
> ⇒ gọi **server thật (Google Sheets)**; không có ⇒ chạy **bản preview** bằng dữ liệu mẫu trong
> trình duyệt (localStorage). File `Quanly.html` ở `~/Downloads` là bản standalone tương đương.

---

## 1. Tính năng

| Nhóm | Mô tả |
|---|---|
| **Nhân sự** | **Trưởng phòng & Phó phòng** tạo/sửa tài khoản, gán **chức danh** & **mã thành viên**, đặt PIN, vô hiệu hóa. Mã thành viên **không được trùng** và **có thể sửa** — đổi mã sẽ **tự cập nhật** ở mọi nơi (task, dự án, KPI). |
| **Công việc daily** | Trưởng/Phó phòng giao việc cho bất kỳ ai; **Chuyên viên tự thêm việc của chính mình** (daily & trong dự án mình thuộc). Thành viên Production Crew không tự thêm. Mã tự sinh `yyyymmdd-STT-MãNV` (STT đếm từ 0h00, reset mỗi ngày). |
| **Dự án (Projects)** | Tạo chiến dịch/sự kiện, gán Lead + thành viên, giao task vào dự án; có **KPI % đóng góp** riêng. |
| **Luồng trạng thái** | `Chưa bắt đầu → Đang chạy → (Tạm dừng) → Đã gửi → Hoàn thành`. Link báo cáo **tùy chọn**. |
| **Ưu tiên & hệ số KPI** | Thấp / Bình thường / Cao / Khẩn cấp. **Khẩn cấp + Nâng cao/Khó ⇒ ×1.5 KPI**. |
| **Dashboard** | KPI đã làm / được giao, tỉ lệ hoàn thành, thời gian TB làm việc, số dự án đang chạy. |
| **Phân KPI chung** | Trưởng phòng đặt **mục tiêu KPI** từng người, theo dõi % đạt theo Tuần/Tháng/Năm. |
| **Production Crew** | Mục đặc quyền cho Trưởng/Phó phòng + Lead/Sub-Lead (và bất kỳ ai **được cấp quyền** MANAGE_CREW). Sao chép 100% workflow Phòng: Dashboard, giao task crew, quản lý thành viên crew (thêm/đổi vai trò/xoá), thống kê KPI — tách biệt task daily/dự án. Người quản lý crew thấy & điều phối **toàn bộ** task crew. Vai trò **Thành viên** là crew cơ bản: chỉ thấy & làm việc crew của chính mình, không quản lý. |
| **Phân quyền (🔑)** | Mục riêng cho Trưởng/Phó phòng: cấp/thu hồi quyền **Quản lý Production Crew** (MANAGE_CREW) cho bất kỳ Chuyên viên Phòng hoặc Thành viên crew. Cấp quyền → người đó hiện thêm khu Production Crew và quản lý được toàn bộ crew; thu hồi → mất quyền ngay. |
| **Xuất Excel (⬇️)** | Trưởng/Phó phòng xuất báo cáo `.xlsx` (3 sheet: Công việc · Nhân sự · Mục tiêu KPI) đúng phạm vi dữ liệu mình xem được. Không chứa thông tin liên hệ nhạy cảm. |
| **Lịch cá nhân (📅)** | Mọi vai trò đều có. Hiển thị công việc của **chính mình** theo **Tuần / Tháng / Năm**, đặt vào ô ngày theo **hạn chót (deadline)**; chip tô màu theo trạng thái, bấm chip mở ghi chú task. Chế độ Năm đếm việc theo tháng, bấm để xem chi tiết tháng. Việc **chưa đặt hạn** gom vào khay riêng. |
| **Ảnh đại diện (🖼️)** | Bấm vào tên mình ở thanh bên → đổi avatar. Ảnh được **thu nhỏ về tối đa 256px + nén JPEG** ngay tại trình duyệt (base64 ≲150KB), lưu kèm hồ sơ nhân sự; hiện thành vòng tròn ở thanh bên, có thể xoá. Chỉ tự đổi ảnh của mình. |
| **Quyền thao tác task** | Bắt đầu/Tạm dừng/Tiếp tục/Gửi/Hoàn thành/Ghi chú **chỉ người được giao** làm được (server + client cùng chặn). Trưởng/Phó phòng chỉ *giao* việc, không thao tác hộ. |
| **Sửa / Xoá (menu ⋮)** | Mỗi task có menu **3 chấm** → ✏️ Sửa · 🗑️ Xoá. Dự án cũng có ⋮ → Sửa/Xoá. Quyền: task crew = quản lý crew, task thường/dự án = Trưởng/Phó phòng. **Xoá dự án sẽ xoá luôn các task thuộc dự án** (cascade). |
| **Đổi PIN** | Mỗi người tự đổi mã PIN trong trang Cài đặt. |
| **Trợ lý AI** | Nút "✨ AI Viết" (brief) & "✨ AI Gợi ý". Cần khóa Gemini đặt trong Script Properties. |

**Cách tính KPI** (mặc định, đổi trong sheet `Config`): Dễ = 1 · Bình thường = 2 · Nâng cao = 3 · Khó = 4.

> *KPI được giao* = tổng điểm việc **được giao** trong kỳ (theo ngày tạo).
> *KPI đã làm* = tổng điểm việc **Hoàn thành** trong kỳ (theo ngày hoàn thành) × hệ số ưu tiên.

---

## 2. Xem trước trên máy (không cần Google)

```bash
cd comms-task-manager
./build-preview.sh                 # dựng preview/index.html từ chính file Apps Script
python3 -m http.server 4599 --directory preview
# Mở http://localhost:4599
```

Tài khoản thử (PIN tất cả là **`123456`**): **TP01** Trưởng phòng · **PP01** Phó phòng ·
**TT01 / TT02 / TT03** chuyên viên.

> `build-preview.sh` ghép `apps-script/Styles.html` + `apps-script/JsClient.html` thành 1 file
> tĩnh ⇒ preview luôn **đồng nhất** với bản deploy. (Bản preview dùng localStorage, AI tắt.)

---

## 3. Triển khai lên Google (cách thủ công — luôn chạy được)

### Bước 1 — Tạo Google Sheet & mở Apps Script
1. Tạo một **Google Sheet** mới (đây là database). **File → Settings → Time zone = (GMT+07:00) Bangkok/Hanoi**.
2. **Extensions → Apps Script**. Một project script gắn với Sheet sẽ mở ra.

### Bước 2 — Dán code
Trong editor, tạo đủ các file sau (nút **＋ → Script / HTML**), dán nội dung tương ứng từ `apps-script/`:

| File trong editor | Loại | Nội dung từ |
|---|---|---|
| `Code.gs` | Script | `apps-script/Code.gs` |
| `Setup.gs` | Script | `apps-script/Setup.gs` |
| `Index.html` | HTML | `apps-script/Index.html` |
| `Styles.html` | HTML | `apps-script/Styles.html` |
| `JsClient.html` | HTML | `apps-script/JsClient.html` |

Mở **Project Settings → tick "Show appsscript.json manifest file"**, rồi mở file `appsscript.json`
vừa hiện và dán nội dung từ `apps-script/appsscript.json`.

### Bước 3 — Khởi tạo dữ liệu (chạy 1 lần)
1. Trên thanh công cụ chọn hàm **`runSetupWithDemo`** → **Run**. Lần đầu Google hỏi cấp quyền → **Review permissions → chọn tài khoản → Advanced → Go to … (unsafe) → Allow**.
   - Tạo 5 sheet: `Members`, `Tasks`, `Projects`, `KpiTargets`, `Config`.
   - Nạp KPI mặc định + **dữ liệu mẫu** (5 nhân sự, 1 dự án, các task) + Trưởng phòng **TP01 / PIN `123456`**.
   - Không muốn dữ liệu mẫu: chạy **`runSetup`** thay vì `runSetupWithDemo`.
2. **Đăng nhập xong hãy đổi PIN ngay** (trang Cài đặt → Đổi mã PIN).

### Bước 4 — Deploy Web App
**Deploy → New deployment → ⚙ (Select type) → Web app**:
- **Execute as**: **Me** *(bắt buộc — để khách không cần đăng nhập Google)*
- **Who has access**: **Anyone** *(hiển thị "Anyone, even anonymous")*

→ **Deploy** → copy **Web app URL** (`https://script.google.com/macros/s/XXXX/exec`) → mở thử.

> ⚠️ Mỗi lần sửa code phải **Deploy → Manage deployments → ✏ → Version: New version → Deploy**
> thì bản chạy mới cập nhật.

### Bước 5 (tùy chọn) — Bật trợ lý AI
1. **Project Settings → Script properties → Add script property**:
   - `GEMINI_API_KEY` = khóa API Gemini của bạn (lấy ở https://aistudio.google.com/apikey).
   - *(tùy chọn)* `GEMINI_MODEL` = `gemini-2.0-flash` (mặc định nếu để trống).
2. Không đặt khóa thì 2 nút AI vẫn hiện nhưng báo "AI chưa được cấu hình" — phần còn lại chạy bình thường.

### Bước 6 (tùy chọn) — Nhúng vào Google Sites
**Insert → Embed → By URL** → dán **Web app URL** (`.../exec`) → **Whole page** → Insert.
App đã bật `setXFrameOptionsMode(ALLOWALL)` nên nhúng được.

---

## 4. Triển khai bằng clasp (tùy chọn, cho dev lặp nhanh)

```bash
npm install -g @google/clasp          # cần Node
clasp login                           # đăng nhập Google (mở trình duyệt) — chỉ 1 lần
# Bật Apps Script API: https://script.google.com/home/usersettings  -> On
cd comms-task-manager/apps-script
clasp create --type sheets --title "Quản lý công việc — Phòng TT"   # tạo Sheet + script gắn kèm
clasp push                            # đẩy toàn bộ file lên
clasp open                            # mở editor -> chạy runSetupWithDemo 1 lần -> Deploy (Bước 4)
```

> `--type sheets` tạo script **gắn với 1 Google Sheet mới** nên `runSetup` ghi thẳng vào Sheet đó.
> (Nếu tạo script standalone, phải tự đặt Script property `SHEET_ID` trỏ tới Sheet database.)

---

## 5. Cấu hình (sheet `Config`)

| key | Ý nghĩa | Mặc định |
|---|---|---|
| `DepartmentName` | Tên đơn vị hiển thị | Trung Tâm Truyền Thông - Tổ Chức Sự Kiện |
| `KPI_De` / `KPI_BinhThuong` / `KPI_NangCao` / `KPI_Kho` | Điểm KPI theo độ khó | 1 / 2 / 3 / 4 |

> Đổi xong có hiệu lực sau ~5 phút (cache). Áp dụng NGAY: chạy hàm **`clearConfigCache`** trong editor.
> Điểm KPI được **chốt lúc tạo việc** nên đổi cấu hình không xáo trộn KPI việc đã tạo.

---

## 6. Bảo mật

- Mọi kiểm tra quyền nằm ở **server** (chuyên viên chỉ thấy/sửa việc của mình; Trưởng/Phó phòng giao việc & quản lý dự án; chỉ **Trưởng phòng** quản lý nhân sự & phân KPI). Client chỉ là giao diện.
- PIN **băm SHA-256** trước khi lưu (không lưu PIN gốc); `bootstrap`/`getState` không trả `pinHash` về client.
- Phiên đăng nhập sống tối đa **~6 giờ** (CacheService), hết hạn tự yêu cầu đăng nhập lại.
- Khóa AI nằm ở **Script Properties** (server-side), **không** lộ ra trình duyệt.
- Deploy *Execute as Me* ⇒ app dùng quyền & quota của chủ script — giữ Sheet riêng.

---

## 7. Cấu trúc thư mục

```
comms-task-manager/
├─ apps-script/        # Dán các file này lên script.google.com (hoặc clasp push)
│  ├─ Code.gs          #   Server: API, phân quyền, sinh mã, Projects, KPI, proxy AI
│  ├─ Setup.gs         #   runSetup / runSetupWithDemo — tạo sheet & seed + migrate_()
│  ├─ Index.html       #   Khung HTML (Chart.js + Styles + JsClient)
│  ├─ Styles.html      #   CSS (glassmorphism, design tokens)
│  ├─ JsClient.html    #   SPA client dual-mode (GAS thật ⇄ preview mock)
│  └─ appsscript.json  #   Manifest: timeZone, scopes, cấu hình web app
├─ preview/index.html  # Bản xem trước (tự sinh từ build-preview.sh)
├─ build-preview.sh    # Ghép Styles + JsClient -> preview
└─ README.md
```

## 8. Khắc phục sự cố

| Hiện tượng | Cách xử lý |
|---|---|
| `Chưa khởi tạo bảng "Members"…` | Chưa chạy `runSetup`. Vào editor chạy `runSetupWithDemo` 1 lần. |
| Nhúng Sites trang trắng / "refused to connect" | Deploy **New version**; dùng URL `.../exec` (không phải `/dev`). |
| Nút AI báo "AI chưa được cấu hình" | Đặt `GEMINI_API_KEY` trong Script properties (Bước 5). |
| Lỗi gọi AI (4xx) | Sai khóa hoặc sai tên model — kiểm tra `GEMINI_API_KEY` / `GEMINI_MODEL`. |
| "Phiên đã hết hạn" | Phiên ~6 giờ; đăng nhập lại. |
| Đổi điểm KPI chưa áp dụng | Chạy hàm `clearConfigCache` (hoặc đợi ~5 phút). |
| Đã có sheet Tasks cũ thiếu cột | Chạy lại `runSetup` — `migrate_()` tự thêm cột `pauseHours`, `lastPausedAt`, `projectId`. |

## 9. Sửa giao diện / logic
- Màu/khoảng cách/font → `apps-script/Styles.html` (biến trong `:root`).
- Logic/màn hình → `apps-script/JsClient.html`.
- Quy tắc nghiệp vụ (mã, KPI, quyền, AI) → `apps-script/Code.gs`.
- Sau khi sửa: `./build-preview.sh` để xem trước → cập nhật code trên Apps Script và **redeploy**.
```
