/**
 * ============================================================================
 *  KHỞI TẠO HỆ THỐNG — chạy MỘT LẦN sau khi dán code.
 * ----------------------------------------------------------------------------
 *  Mở Apps Script editor → chọn hàm runSetup → Run (cấp quyền lần đầu).
 *   - Tạo các sheet: Members, Tasks, Projects, KpiTargets, Config (kèm tiêu đề cột).
 *   - Nạp cấu hình KPI mặc định (Dễ=1, Bình thường=2, Nâng cao=3, Khó=4).
 *   - Tạo tài khoản Trưởng phòng đầu tiên (TP01 / PIN 123456 — đổi ngay sau khi vào).
 *
 *  runSetupWithDemo(): như trên + nạp dữ liệu mẫu (nhân sự, dự án, công việc, KPI)
 *  để xem thử ngay. Dùng khi muốn demo nhanh.
 *
 *  migrate_(): nếu đã có sheet Tasks cũ (16 cột), bổ sung 3 cột mới ở cuối
 *  (pauseHours, lastPausedAt, projectId) mà KHÔNG mất dữ liệu.
 * ============================================================================
 */

function runSetup() { setup_(false); }
function runSetupWithDemo() { setup_(true); }

/**
 * Xoá TOÀN BỘ task + dự án + mục tiêu KPI hiện tại rồi nạp lại DỮ LIỆU GỐC (demo).
 * GIỮ NGUYÊN tài khoản nhân sự & mã PIN. Gọi qua google.script.run.resetToSeed(token).
 * Yêu cầu quyền Trưởng phòng (an toàn — không để ai cũng xoá được dữ liệu).
 */
function resetToSeed(token) {
  requireHead_(token);
  var ss = getSS_();
  ensureSheet_(ss, SH_TASKS, TASK_COLS);
  ensureSheet_(ss, SH_PROJECTS, PROJECT_COLS);
  ensureSheet_(ss, SH_KPI, KPI_COLS);
  [SH_TASKS, SH_PROJECTS, SH_KPI].forEach(function (n) {
    var sh = ss.getSheetByName(n);
    if (sh && sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1); // giữ dòng tiêu đề
  });
  migrate_();
  seedDemo_();   // nạp lại task/dự án/KPI gốc (members giữ nguyên)
  return { ok: true };
}

function setup_(withDemo) {
  var ss = getSS_();

  ensureSheet_(ss, SH_MEMBERS, MEMBER_COLS);
  ensureSheet_(ss, SH_TASKS, TASK_COLS);
  ensureSheet_(ss, SH_PROJECTS, PROJECT_COLS);
  ensureSheet_(ss, SH_KPI, KPI_COLS);
  ensureSheet_(ss, SH_CONFIG, ['key', 'value', 'mô tả']);
  ensureSheet_(ss, SH_CHATS, CHAT_COLS);
  ensureSheet_(ss, SH_MESSAGES, MSG_COLS);

  migrate_(); // đảm bảo sheet Tasks cũ có đủ cột mới

  seedConfig_();
  CacheService.getScriptCache().remove('CONFIG');

  // Tài khoản Trưởng phòng đầu tiên (đổi PIN ngay sau khi đăng nhập).
  var mSheet = ss.getSheetByName(SH_MEMBERS);
  if (mSheet.getLastRow() < 2) {
    mSheet.appendRow(['TP01', 'Trưởng phòng', hashPin_('123456'), ROLE.HEAD,
                      'Trưởng phòng Truyền thông', true, nowIso_(), '[]']);
    Logger.log('Đã tạo Trưởng phòng: TP01, PIN mặc định 123456 — HÃY ĐỔI PIN.');
  }

  if (withDemo) seedDemo_();

  // Định dạng tiêu đề cho dễ nhìn
  [SH_MEMBERS, SH_TASKS, SH_PROJECTS, SH_KPI, SH_CONFIG, SH_CHATS, SH_MESSAGES].forEach(function (n) {
    var sh = ss.getSheetByName(n);
    if (!sh || sh.getLastColumn() === 0) return;
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold').setBackground('#17179d').setFontColor('#fff');
  });

  Logger.log('runSetup hoàn tất. Deploy: New deployment → Web app → Execute as Me, Anyone (anonymous).');
}

function ensureSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (headers && headers.length && sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sh;
}

/** Bổ sung cột mới vào sheet Tasks cũ (idempotent). */
function migrate_() {
  migrateSheetCols_(SH_TASKS, TASK_COLS);
  migrateSheetCols_(SH_MEMBERS, MEMBER_COLS); // thêm cột 'grants', 'avatar' cho sheet cũ
  // Tin nhắn/chat: tạo sheet nếu chưa có (deploy cũ chưa có 2 sheet này).
  var ss = getSS_();
  ensureSheet_(ss, SH_CHATS, CHAT_COLS);
  ensureSheet_(ss, SH_MESSAGES, MSG_COLS);
  migrateRolesAndConfig_();
}

/** Di trú dữ liệu cũ (idempotent):
 *  - Vai trò 'MULTIMEDIA' đã bị xoá -> chuyển thành 'THANH_VIEN' (Thành viên Production Crew).
 *  - Tên đơn vị mặc định cũ 'Phòng Truyền thông' -> tên mới (CHỈ đổi nếu vẫn là mặc định cũ, không đè tuỳ biến). */
function migrateRolesAndConfig_() {
  var ss = getSS_();
  // 1) Vai trò Multimedia -> Thành viên
  var mSheet = ss.getSheetByName(SH_MEMBERS);
  if (mSheet && mSheet.getLastRow() > 1) {
    var mv = mSheet.getDataRange().getValues();
    var roleCol = MEMBER_COLS.indexOf('role'); // 0-based
    var changed = 0;
    for (var i = 1; i < mv.length; i++) {
      if (String(mv[i][roleCol]).trim() === 'MULTIMEDIA') {
        mSheet.getRange(i + 1, roleCol + 1).setValue('THANH_VIEN');
        changed++;
      }
    }
    if (changed) Logger.log('Di trú vai trò MULTIMEDIA -> THANH_VIEN: ' + changed + ' nhân sự.');
  }
  // 2) Đổi tên đơn vị mặc định cũ (không đè nếu đã tuỳ biến khác)
  var cSheet = ss.getSheetByName(SH_CONFIG);
  if (cSheet && cSheet.getLastRow() > 1) {
    var cv = cSheet.getDataRange().getValues();
    for (var j = 1; j < cv.length; j++) {
      if (String(cv[j][0]).trim() === 'DepartmentName' && String(cv[j][1]).trim() === 'Phòng Truyền thông') {
        cSheet.getRange(j + 1, 2).setValue('Trung Tâm Truyền Thông - Tổ Chức Sự Kiện');
        CacheService.getScriptCache().remove('CONFIG');
        Logger.log('Đã đổi tên đơn vị: Phòng Truyền thông -> Trung Tâm Truyền Thông - Tổ Chức Sự Kiện.');
      }
    }
  }
}
function migrateSheetCols_(sheetName, cols) {
  var sh = getSS_().getSheetByName(sheetName);
  if (!sh || sh.getLastRow() === 0) return;
  var header = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0]
                 .map(function (x) { return String(x).trim(); });
  var missing = cols.filter(function (c) { return header.indexOf(c) < 0; });
  if (missing.length) {
    sh.getRange(1, header.length + 1, 1, missing.length).setValues([missing]);
    Logger.log('Đã thêm cột mới vào ' + sheetName + ': ' + missing.join(', '));
  }
}

function seedConfig_() {
  var sh = getSS_().getSheetByName(SH_CONFIG);
  var existing = {};
  var values = sh.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) existing[String(values[i][0]).trim()] = true;

  var defaults = [
    ['DepartmentName', 'Trung Tâm Truyền Thông - Tổ Chức Sự Kiện', 'Tên đơn vị hiển thị trên giao diện'],
    ['KPI_De', 1, 'Điểm KPI cho công việc mức Dễ'],
    ['KPI_BinhThuong', 2, 'Điểm KPI cho công việc mức Bình thường'],
    ['KPI_NangCao', 3, 'Điểm KPI cho công việc mức Nâng cao'],
    ['KPI_Kho', 4, 'Điểm KPI cho công việc mức Khó']
  ];
  defaults.forEach(function (d) { if (!existing[d[0]]) sh.appendRow(d); });
}

function seedDemo_() {
  var ss = getSS_();
  var mSheet = ss.getSheetByName(SH_MEMBERS);
  var tSheet = ss.getSheetByName(SH_TASKS);
  var pSheet = ss.getSheetByName(SH_PROJECTS);
  var kSheet = ss.getSheetByName(SH_KPI);

  // 1) Thành viên mẫu
  var have = {};
  readMembers_().forEach(function (m) { have[m.code] = true; });
  var demoMembers = [
    ['PP01', 'Lê Minh Phó', hashPin_('123456'), ROLE.DEPUTY, 'Phó phòng Nội dung', true, nowIso_()],
    ['TT01', 'Nguyễn An', hashPin_('123456'), ROLE.STAFF, 'Chuyên viên Thiết kế', true, nowIso_()],
    ['TT02', 'Trần Bình', hashPin_('123456'), ROLE.STAFF, 'Chuyên viên Nội dung', true, nowIso_()],
    ['TT03', 'Phạm Chi', hashPin_('123456'), ROLE.STAFF, 'Chuyên viên Truyền thông số', true, nowIso_()],
    // --- Production Crew ---
    ['PD01', 'Lê Quang Lead', hashPin_('123456'), ROLE.LEAD, 'Lead Production', true, nowIso_()],
    ['PD02', 'Vũ Văn Quay', hashPin_('123456'), ROLE.QUAY, 'Sub-Lead Production (Quay)', true, nowIso_()],
    ['PD03', 'Hồ Thị Chụp', hashPin_('123456'), ROLE.CHUP, 'Sub-Lead Production (Chụp)', true, nowIso_()],
    ['MM01', 'Đỗ Đa Phương', hashPin_('123456'), ROLE.MEMBER, 'Thành viên (Production)', true, nowIso_()]
  ];
  demoMembers.forEach(function (r) { if (!have[r[0]]) mSheet.appendRow(r); });

  // 2) Mục tiêu KPI mẫu (top-up theo từng mã — không trùng)
  var kHave = {};
  kSheet.getDataRange().getValues().slice(1).forEach(function (r) { if (r[0]) kHave[String(r[0]).trim()] = true; });
  [['TT01', 10], ['TT02', 10], ['TT03', 10], ['PP01', 8], ['TP01', 6],
   ['PD01', 8], ['PD02', 10], ['PD03', 10], ['MM01', 10]]
    .forEach(function (r) { if (!kHave[r[0]]) kSheet.appendRow(r); });

  // 3) Dự án mẫu (thêm nếu chưa có id đó)
  var pHave = {};
  pSheet.getDataRange().getValues().slice(1).forEach(function (r) { if (r[0]) pHave[String(r[0]).trim()] = true; });
  if (!pHave['PRJ-2026-001']) {
    pSheet.appendRow(projToRow_({
      id: 'PRJ-2026-001', name: 'Chiến dịch Khai giảng Thu 2026', leadCode: 'PP01',
      memberCodes: ['TT01', 'TT02', 'TT03'], eventDate: '2026-09-05',
      status: PROJ_STATUS.ACTIVE, createdAt: nowIso_()
    }));
  }

  // 4) Công việc mẫu (top-up theo từng taskCode — re-run an toàn, thêm task crew vào sheet cũ).
  function iso(d) { return d + 'T09:00:00+07:00'; }
  var pts = difficultyPoints_();
  function buildRow(o) {
    var base = {
      taskCode: '', title: '', description: '', assigneeCode: '', difficulty: '',
      kpiPoint: 0, status: STATUS.TODO, createdBy: 'TP01', createdAt: nowIso_(),
      deadline: '', startedAt: '', submittedAt: '', completedAt: '', reportLink: '',
      note: '', priority: 'Bình thường', pauseHours: 0, lastPausedAt: '', projectId: '', crewTask: false
    };
    for (var k in o) base[k] = o[k];
    base.kpiPoint = pts[base.difficulty] || 0;
    return base;
  }
  var tHave = {};
  tSheet.getDataRange().getValues().slice(1).forEach(function (r) { if (r[0]) tHave[String(r[0]).trim()] = true; });

  var taskObjs = [
    // --- Việc daily (KHÔNG thuộc dự án) ---
    ({ taskCode: '20260601-001-TT01', title: 'Cập nhật banner website tháng 6', description: 'Trang chủ + landing', assigneeCode: 'TT01', difficulty: 'Dễ', status: STATUS.DONE, createdBy: 'TP01', createdAt: iso('2026-06-01'), deadline: '2026-06-03', startedAt: iso('2026-06-01'), submittedAt: iso('2026-06-02'), completedAt: iso('2026-06-04'), reportLink: 'https://drive.google.com/file/d/demo-banner' }),
    ({ taskCode: '20260602-001-TT02', title: 'Viết bài PR tuyển sinh đợt 2', description: '800-1000 từ, có CTA', assigneeCode: 'TT02', difficulty: 'Nâng cao', status: STATUS.DONE, createdBy: 'TP01', createdAt: iso('2026-06-02'), deadline: '2026-06-05', startedAt: iso('2026-06-02'), submittedAt: iso('2026-06-04'), completedAt: iso('2026-06-05'), reportLink: 'https://docs.google.com/document/d/demo-pr' }),
    ({ taskCode: '20260603-001-TT03', title: 'Dựng video recap hội thảo', description: 'Dài 60-90s, có phụ đề', assigneeCode: 'TT03', difficulty: 'Khó', status: STATUS.RUNNING, createdBy: 'PP01', createdAt: iso('2026-06-03'), deadline: '2026-06-10', startedAt: iso('2026-06-03'), priority: 'Cao' }),
    ({ taskCode: '20260604-001-TT01', title: 'Thiết kế bộ icon dịch vụ', description: '8 icon, style line', assigneeCode: 'TT01', difficulty: 'Nâng cao', status: STATUS.TODO, createdBy: 'TP01', createdAt: iso('2026-06-04'), deadline: '2026-06-12' }),
    ({ taskCode: '20260605-001-TT02', title: 'Lên lịch đăng fanpage tuần 24', description: 'File Google Sheet', assigneeCode: 'TT02', difficulty: 'Bình thường', status: STATUS.SENT, createdBy: 'PP01', createdAt: iso('2026-06-05'), deadline: '2026-06-09', startedAt: iso('2026-06-05'), submittedAt: iso('2026-06-07'), reportLink: 'https://docs.google.com/spreadsheets/d/demo-cal' }),

    // --- Việc thuộc dự án PRJ-2026-001 ---
    ({ taskCode: '2026-001-001-TT01', title: 'Thiết kế Backdrop sân khấu chính', description: 'Khổ 6x4m', assigneeCode: 'TT01', difficulty: 'Nâng cao', status: STATUS.RUNNING, createdBy: 'PP01', createdAt: iso('2026-06-05'), deadline: '2026-08-20', priority: 'Cao', projectId: 'PRJ-2026-001' }),
    ({ taskCode: '2026-001-002-TT02', title: 'Lên kịch bản MC chương trình', description: 'Văn phong trẻ trung', assigneeCode: 'TT02', difficulty: 'Bình thường', status: STATUS.TODO, createdBy: 'PP01', createdAt: iso('2026-06-05'), deadline: '2026-08-15', projectId: 'PRJ-2026-001' }),
    ({ taskCode: '2026-001-003-TT03', title: 'Liên hệ Media quay phim (Shooting)', description: 'Team 3 máy quay', assigneeCode: 'TT03', difficulty: 'Khó', status: STATUS.RUNNING, createdBy: 'PP01', createdAt: iso('2026-06-05'), deadline: '2026-09-05', priority: 'Khẩn cấp', projectId: 'PRJ-2026-001' }),

    // --- Việc Production Crew (crewTask = true) ---
    ({ taskCode: 'CREW-001-MM01', title: 'Dựng teaser 30s khai giảng', description: 'Bản 9:16 + 16:9', assigneeCode: 'MM01', difficulty: 'Nâng cao', status: STATUS.DONE, createdBy: 'PD01', createdAt: iso('2026-06-08'), deadline: '2026-06-14', startedAt: iso('2026-06-08'), submittedAt: iso('2026-06-11'), completedAt: iso('2026-06-12'), reportLink: 'https://drive.google.com/file/d/demo-teaser', crewTask: true }),
    ({ taskCode: 'CREW-002-PD02', title: 'Quay phóng sự hậu trường', description: 'Setup 3 máy', assigneeCode: 'PD02', difficulty: 'Khó', status: STATUS.RUNNING, createdBy: 'PD01', createdAt: iso('2026-06-09'), deadline: '2026-06-20', startedAt: iso('2026-06-09'), priority: 'Cao', crewTask: true }),
    ({ taskCode: 'CREW-003-PD03', title: 'Chụp bộ ảnh profile giảng viên', description: '20 thầy cô', assigneeCode: 'PD03', difficulty: 'Bình thường', status: STATUS.TODO, createdBy: 'PD01', createdAt: iso('2026-06-10'), deadline: '2026-06-25', crewTask: true })
  ];
  taskObjs.forEach(function (o) { if (!tHave[o.taskCode]) tSheet.appendRow(taskToRow_(buildRow(o))); });
}
