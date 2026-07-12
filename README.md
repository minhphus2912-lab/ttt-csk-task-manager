# Quản lý Nhân sự & Công việc — Trung Tâm Truyền Thông - Tổ Chức Sự Kiện

> ✅ **BẢN CHÍNH THỨC (mở được MỌI thiết bị / trình duyệt / Edge, không cần đăng nhập Google):**
> ## 👉 https://minhphus2912-lab.github.io/ttt-csk-task-manager/
>
> Trang web tĩnh trên GitHub Pages, **dữ liệu chung nhiều người dùng thật** (kết nối trực tiếp
> backend Google Apps Script + Google Sheet của `drivetttcskdrive2025@huflit.edu.vn` qua FetchServer).
> Vào là chạy ngay, không phụ thuộc trạng thái đăng nhập Google của máy. **Đây là link để chia sẻ cho mọi người.**
>
> _Link dự phòng (chạy trực tiếp trên Google, toàn màn hình):_
> https://script.google.com/macros/s/AKfycbybZBCki3-Bjve2IiAPo7YGuV6f0c5WNJivAfhdDT83Q_lFPX9d-d0yZH77nF-pK1kj/exec
> ⚠️ Link `/exec` này có thể báo **"Không thể mở tệp tại thời điểm này"** trên trình duyệt đang đăng nhập
> nhiều tài khoản Google (lỗi nền tảng của Google Apps Script). Nếu gặp lỗi: dùng link GitHub Pages ở trên,
> hoặc mở `/exec` ở **cửa sổ ẩn danh** / đăng xuất bớt tài khoản Google.

> Đăng nhập: mã `TP01` · `PP01` · `TT01` … — PIN theo hồ sơ (mẫu `123456`), Admin `291219`.

Web app quản lý công việc nội bộ cho Trung Tâm Truyền Thông - Tổ Chức Sự Kiện. Chạy bằng
**Google Apps Script (Web App)** + lưu dữ liệu trên **Google Sheets**, có thể nhúng vào
**Google Sites**.

- 🎨 Giao diện **glassmorphism iOS 26**, 3 màu chính phối xen kẽ: **Cam `#EE6823`** · **Xanh nhạt `#17479D`** · **Xanh đậm `#21217D`**; hover nhấc nhẹ (không lắc lư), icon xoay ngang.
- 🔐 Đăng nhập **tự quản lý**: chọn tên + nhập **mã PIN cá nhân** — không cần tài khoản Google riêng.
- 👥 7 vai trò: **Trưởng phòng**, **Phó phòng**, **Chuyên viên** + 4 vai trò Production Crew (**Lead Production**, **Sub-Lead Quay**, **Sub-Lead Chụp**, **Thành viên**). Lead/Sub-Lead là quản lý crew; **Thành viên** là vai trò crew cơ bản (chỉ làm việc của mình).
- 🚀 Mục **Công việc** gộp 2 tab **Công việc daily** & **Dự án**, mỗi tab có bộ lọc **Ngày / Tuần / Tháng / Năm** riêng. (Đã **bỏ chấm điểm KPI** — giữ "Độ khó" làm nhãn.)
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
| **Công việc** (gộp) | 1 mục với 2 tab con **Công việc daily** \| **Dự án**, mỗi tab lọc theo **Ngày/Tuần/Tháng/Năm**. Trưởng/Phó phòng giao việc cho bất kỳ ai; **Chuyên viên tự thêm & sửa task daily của chính mình**. Tạo dự án, gán Lead + thành viên, giao task vào dự án. |
| **Luồng trạng thái** | `Chưa bắt đầu → Đang chạy → (Tạm dừng) → Đã gửi → Hoàn thành`. Bước **Gửi draft** nhập **link draft**; bước **Xác nhận hoàn thành** nhập **link hoàn thành**. Task xong hiển thị nút **🔗 mở link draft / ✅ link hoàn thành** để kiểm tra. |
| **Phần phụ công việc** | Mỗi task của Trung Tâm gắn 1 nhóm: **Admin · Design · Digital marketing · Facebook · TikTok · Multimedia · PR · Internal communications** (chọn khi tạo/sửa; hiện badge 🏷️ trên thẻ task). |
| **Mức độ ưu tiên (màu)** | Thấp 🟢 · Bình thường 🟡 · Cao 🟠 · Khẩn cấp 🔴 — tô màu trên thẻ task. |
| **Dashboard cá nhân** | (Chuyên viên/Thành viên) tỉ lệ hoàn thành, TG làm TB, TG tạm hoãn TB, số task daily · dự án **của mình** (gồm cả task dự án). |
| **Dashboard quản lý** | (Trưởng/Phó phòng) **thanh ngang theo từng chuyên viên**: số task · TG hoàn thành TB · TG tạm hoãn TB · task/tháng · thanh xếp chồng theo **mức độ ưu tiên** (4 màu); kèm **1 vòng tròn** tỉ lệ task giữa các chuyên viên. |
| **Production Crew** | Thiết kế **giống Trung Tâm**: Bảng điều khiển (quản lý = thanh ngang per-thành-viên + 1 vòng tròn; thành viên = dashboard cá nhân), mục **Công việc** 2 tab daily/Dự án, Nhân sự (thêm/**sửa đầy đủ**/đổi vai trò/xoá). Task crew có thể **liên kết vào dự án** của Trung Tâm. Quản lý crew = Trưởng/Phó phòng + Lead/Sub-Lead + người được cấp MANAGE_CREW; **Thành viên** là crew cơ bản (chỉ việc của mình). |
| **Dự án — Phát sinh** | Khi giao task vào dự án có thể đánh dấu **⚡ Phát sinh** (ngoài kế hoạch); trang chi tiết dự án tách riêng **📋 Công việc kế hoạch** và **⚡ Công việc phát sinh**. |
| **Phần phụ công việc** | Task của Trung Tâm gắn 1 nhóm: Admin · Design · Digital marketing · Multimedia · PR · Internal communications (badge 🏷️). |
| **Phân quyền (🔑)** | Mục riêng cho Trưởng/Phó phòng: cấp/thu hồi quyền **Quản lý Production Crew** (MANAGE_CREW) cho bất kỳ Chuyên viên Phòng hoặc Thành viên crew. Cấp quyền → người đó hiện thêm khu Production Crew và quản lý được toàn bộ crew; thu hồi → mất quyền ngay. |
| **Xuất Excel (⬇️)** | Trưởng/Phó phòng xuất báo cáo `.xlsx` (2 sheet: Công việc · Nhân sự) đúng phạm vi dữ liệu mình xem được. Không chứa thông tin liên hệ nhạy cảm. |
| **Lịch (📅)** | Mọi vai trò: **Lịch của tôi** theo **Tuần / Tháng / Năm** (đặt theo hạn chót, chip màu theo trạng thái, bấm mở ghi chú; Năm đếm theo tháng; việc chưa hạn gom khay riêng). Quản lý có thêm 2 mục mở-rộng (accordion) **tách bạch**: 🏢 **Lịch toàn Trung Tâm** (Trưởng/Phó phòng) và 🎬 **Lịch toàn Production Crew** (quản lý crew). |
| **Ảnh đại diện (🖼️)** | Bấm vào tên mình ở thanh bên → đổi avatar. Ảnh được **thu nhỏ về tối đa 256px + nén JPEG** ngay tại trình duyệt (base64 ≲150KB), lưu kèm hồ sơ nhân sự; hiện thành vòng tròn ở thanh bên, có thể xoá. Chỉ tự đổi ảnh của mình. |
| **Quyền thao tác task** | Bắt đầu/Tạm dừng/Tiếp tục/Gửi/Hoàn thành/Ghi chú **chỉ người được giao** làm được (server + client cùng chặn). Trưởng/Phó phòng chỉ *giao* việc, không thao tác hộ. |
| **Sửa / Xoá (menu ⋮)** | Mỗi task có menu **3 chấm** → ✏️ Sửa · 🗑️ Xoá. Dự án cũng có ⋮ → Sửa/Xoá. Quyền: task crew = quản lý crew, task thường/dự án = Trưởng/Phó phòng. **Xoá dự án sẽ xoá luôn các task thuộc dự án** (cascade). |
| **Đổi PIN** | Mỗi người tự đổi mã PIN trong trang Cài đặt. |
| **Trợ lý AI** | Nút "✨ AI Viết" (brief) & "✨ AI Gợi ý". Cần khóa Gemini đặt trong Script Properties. |

> **Đã bỏ cơ chế chấm điểm KPI** (từ v18). "Độ khó" (Dễ/Bình thường/Nâng cao/Khó) giữ lại làm **nhãn** thông tin, không còn quy ra điểm. Thống kê quản lý dựa trên **số lượng task · thời gian hoàn thành/tạm hoãn trung bình · mức độ ưu tiên**.

### Mới ở v20
- **Bảo mật phiên (1 tài khoản = 1 phiên):** đăng nhập ở nơi mới sẽ **đá** phiên cũ — phiên cũ tự đăng xuất và báo *"Tài khoản đang được sử dụng"*. Màn đăng nhập có **"Ghi nhớ đăng nhập"** (bật = nhớ qua lần mở lại trình duyệt; tắt = chỉ trong phiên tab).
- **Thông báo công việc (khi đang mở web):** poll ~15s, hiện **thông báo trình duyệt** + **âm thanh "ting"**, định dạng `[Tên task] - [Deadline] - Bạn có quà tặng đến từ [Người giao]`.
- **Trang Tổng hợp / Thông báo** (trang đích sau đăng nhập, mọi vai trò): các nhóm **Task mới · Đang làm · Có feedback · Chưa đăng ký · Trễ deadline** — bấm 1 dòng để mở chi tiết.
- **Việc "Chưa đăng ký":** Leader/Trưởng/Phó phòng tạo việc **chưa giao** (nền cam, ghim đầu danh sách) → người đủ điều kiện bấm **🙋 Nhận việc**. Có thêm bộ lọc trạng thái *Chưa đăng ký*.
- **Người tạo task** hiển thị ở mọi nơi; **bấm task** mở **popup xem nhanh chỉ-đọc**; **toggle Lưới ⇄ Chi tiết** cho danh sách việc.
- **Tạo theo nhóm:** 1 "đầu việc chung" tách thành **nhiều việc con độc lập** (mỗi việc có mã/người nhận/trạng thái riêng), gắn cùng nhãn nhóm.
- **Quyền:** Chuyên viên **xoá việc của chính mình**; Leader/Sub-lead/Trưởng/Phó phòng **ép đổi trạng thái** việc của người khác.
- **Dashboard cá nhân = biểu đồ thanh ngang**; **Team Dashboard** thu gọn được + **lọc theo vai trò** + **4 bảng** (số task · TG hoàn thành TB · TG tạm hoãn TB · tỷ lệ **đúng/trễ/sớm** deadline).
- **Nhân sự (HR):** lưới nhân sự **xếp A→Z theo tên**; bấm 1 người mở **hồ sơ** + danh sách việc (cá nhân/dự án) kèm **tiến độ**.
- **Lịch:** **bấm vào 1 ngày** để mở danh sách việc đến hạn trong ngày đó.
- **Dự án:** trang chi tiết **gom tự động theo Người thực hiện** (bảng đủ cột); **ngày sự kiện = ngày cuối**, mọi việc con phải có **hạn ≤ ngày sự kiện**.
- Đổi **"Giao task vào dự án" → "Giao việc"**; thêm **"Hạn hoàn thành"** trong ô tải công việc; tách **Digital marketing → Digital marketing / Facebook / TikTok**.

### Mới ở v20.1 (tinh chỉnh)
- **Tổng hợp / Thông báo = popup hiện 1 lần** mỗi khi đăng nhập/vào lại (hiển thị đầy đủ: mã · tên · người làm · người tạo · deadline · trạng thái) — **không còn là mục menu riêng**.
- **Trang Dự án rộng hơn:** bỏ bố cục 2 cột chật → xếp dọc toàn chiều rộng; **tên việc xuống tối đa 2 dòng** (không bị cắt cụt).
- **Tăng tốc (giảm lag):** điều hướng/bấm **render từ cache → tức thì**, KHÔNG tải lại Google Sheet mỗi lần bấm. Dữ liệu vẫn tươi nhờ **đồng bộ nền mỗi 5 phút** + **tự làm mới khi quay lại tab** + nút **🔄 Làm mới** thủ công ở thanh trên; mọi thao tác ghi (tạo/sửa/xoá/đổi trạng thái) vẫn làm mới ngay sau đó. (Thông báo việc mới & phát hiện "bị đá phiên" chạy theo nhịp 5 phút / khi quay lại tab.)

### Mới ở v20.2 (tinh chỉnh)
- **Bảng điều khiển — bấm vào chuyên viên** (tên ở bảng hoặc thẻ thanh) để mở **popup chi tiết các việc ĐANG CHẠY** của họ (kèm việc đang tạm dừng): mã · tên · mô tả · ưu tiên · độ khó · deadline · dự án · đã chạy bao lâu.
- **Popup Tổng hợp / Thông báo — bộ lọc theo Người thực hiện:** chọn 1 người để lọc cả thẻ đếm lẫn 5 mục danh sách về đúng việc của người đó.

### Mới ở v20.3 (tinh chỉnh)
- **Thông báo nhận việc nhanh hơn:** đồng bộ nền **5 phút → 30 giây** nên việc mới được giao hiện thông báo trong ~30s; toast **"🎁 Quà tặng công việc"** nổi bật, ở lâu **9 giây** + tiếng ting (đây là kênh đáng tin cậy vì thông báo hệ điều hành thường bị iframe Google chặn). Mỗi việc chỉ báo **đúng 1 lần** (idempotent, không nhân đôi khi nhiều lần làm mới chồng nhau).
- **Giao diện rộng hơn & thanh điều hướng tuỳ biến:** vùng nội dung nới rộng (**1440px**); thanh điều hướng **gọn hơn** (đỡ phải cuộn) và có nút **⮜/⮞ thu gọn** thành thanh icon để mở rộng vùng làm việc — trạng thái thu gọn được **ghi nhớ**.

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
