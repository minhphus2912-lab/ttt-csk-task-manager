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
 * NHẮC VIỆC QUA EMAIL — chạy MỘT LẦN trong Apps Script editor.
 * Vừa cấp quyền gửi mail + tạo trigger, vừa cài lịch gửi digest mỗi sáng ~7:00.
 * Gỡ trigger cũ trước (idempotent). Muốn gửi thử ngay: chạy sendTaskReminders_().
 */
function setupReminders() {
  ScriptApp.getProjectTriggers().forEach(function (tr) {
    if (tr.getHandlerFunction() === 'sendTaskReminders_') ScriptApp.deleteTrigger(tr);
  });
  ScriptApp.newTrigger('sendTaskReminders_').timeBased().atHour(7).everyDays(1).create();
  Logger.log('Đã cài lịch nhắc việc qua email: mỗi ngày ~7:00 (giờ VN).');
}

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

  // Tài khoản Trưởng phòng đầu tiên (đổi PIN ngay sau khi đăng nhập). Kiểm tra theo MÃ (vì ADMIN có thể đã được seed trước).
  var mSheet = ss.getSheetByName(SH_MEMBERS);
  var _mv = mSheet.getDataRange().getValues(), _hasTP01 = false;
  for (var _r = 1; _r < _mv.length; _r++) { if (String(_mv[_r][0]).trim().toUpperCase() === 'TP01') { _hasTP01 = true; break; } }
  if (!_hasTP01) {
    mSheet.appendRow(['TP01', 'Trưởng phòng', hashPin_('123456'), ROLE.HEAD,
                      'Trưởng phòng Truyền thông', true, nowIso_(), '[]']);
    Logger.log('Đã tạo Trưởng phòng: TP01, PIN mặc định 123456 — HÃY ĐỔI PIN.');
  }

  if (withDemo) seedDemo_();

  formatSheets_(); // định dạng toàn bộ sheet cho gọn gàng, dễ nhìn

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
  ensureAdminConfig_();   // ADMIN: credentials ở Script Property (ẨN), XOÁ khỏi sheet Members
  formatSheets_(); // mỗi lần migrate -> định dạng lại sheet cho gọn gàng
}

// ADMIN (quyền CAO NHẤT) KHÔNG được lưu trong sheet (data storage). Credentials -> Script Property ADMIN_PINHASH.
// Idempotent: dời PIN hiện tại (nếu ADMIN từng nằm trong sheet) sang Property rồi XOÁ dòng; nếu chưa có -> đặt mặc định 291219.
function ensureAdminConfig_() {
  var sp = PropertiesService.getScriptProperties();
  var ss = getSS_(); var sh = ss.getSheetByName(SH_MEMBERS);
  if (sh && sh.getLastRow() > 1) {
    var vals = sh.getDataRange().getValues();
    for (var i = vals.length - 1; i >= 1; i--) {            // duyệt ngược để xoá dòng an toàn
      if (String(vals[i][0]).trim().toUpperCase() === 'ADMIN') {
        if (!sp.getProperty('ADMIN_PINHASH')) sp.setProperty('ADMIN_PINHASH', String(vals[i][2] || '')); // giữ PIN ADMIN hiện tại (nếu đã đổi)
        sh.deleteRow(i + 1);                                  // XOÁ ADMIN khỏi sheet -> pass/info ADMIN không nằm ở nơi lưu trữ
        Logger.log('Đã chuyển ADMIN ra khỏi sheet Members (credentials lưu ở Script Property).');
      }
    }
  }
  if (!sp.getProperty('ADMIN_PINHASH')) sp.setProperty('ADMIN_PINHASH', hashPin_('291219'));
}

// Bề rộng cột gợi ý theo TÊN cột (px). Cột không liệt kê -> 110. Cột "dài/xấu" (avatar base64, pinHash, mô tả, link) -> hẹp + clip.
var COL_WIDTHS_ = {
  taskCode: 150, title: 250, description: 210, assigneeCode: 92, assigneeCodes: 150, difficulty: 95, kpiPoint: 62,
  status: 116, createdBy: 96, createdAt: 142, startedAt: 142, submittedAt: 142, completedAt: 142, lastPausedAt: 142,
  deadline: 106, reportLink: 150, completeLink: 150, note: 190, priority: 102, pauseHours: 82,
  projectId: 116, crewTask: 74, category: 132, phatSinh: 74, batchName: 150, startDate: 106, needSupport: 90, supportNote: 200,
  code: 86, name: 162, pinHash: 92, role: 132, active: 64, grants: 116, avatar: 90,
  id: 142, leadCode: 96, memberCodes: 172, eventDate: 110,
  memberCode: 116, target: 82,
  key: 172, value: 240, 'mô tả': 300,
  type: 76, chatId: 142, senderCode: 106, kind: 76, body: 320
};
// Định dạng MỌI sheet cho dễ nhìn: đóng băng + tô header, kẻ sọc xen kẽ, set bề rộng cột, clip tràn, định dạng ngày.
// Bọc try/catch từng thao tác -> mock harness (thiếu API định dạng) vẫn chạy bình thường, GAS thật áp dụng đầy đủ.
function formatSheets_() {
  var ss = getSS_();
  [SH_MEMBERS, SH_TASKS, SH_PROJECTS, SH_KPI, SH_CONFIG, SH_CHATS, SH_MESSAGES].forEach(function (n) {
    var sh = ss.getSheetByName(n);
    if (!sh || sh.getLastColumn() === 0) return;
    var lastCol = sh.getLastColumn();
    var lastRow = Math.max(sh.getLastRow(), 1);
    var headers = [];
    try { headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function (x) { return String(x).trim(); }); } catch (e) {}
    try { sh.setFrozenRows(1); } catch (e) {}
    try { sh.getRange(1, 1, 1, lastCol).setFontWeight('bold').setBackground('#17179d').setFontColor('#ffffff').setVerticalAlignment('middle').setHorizontalAlignment('left'); } catch (e) {}
    try { sh.setRowHeight(1, 32); } catch (e) {}
    // Kẻ sọc xen kẽ (gỡ banding cũ trước khi áp mới -> idempotent).
    try {
      var bs = sh.getBandings ? sh.getBandings() : [];
      for (var i = 0; i < bs.length; i++) { try { bs[i].remove(); } catch (e2) {} }
      sh.getRange(1, 1, lastRow, lastCol).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
    } catch (e) {}
    // Không cho chữ tràn + canh giữa theo chiều dọc -> hàng đều, gọn.
    try { sh.getRange(1, 1, lastRow, lastCol).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP).setVerticalAlignment('middle'); } catch (e) {}
    // Bề rộng cột theo TÊN.
    for (var c = 0; c < headers.length; c++) {
      try { sh.setColumnWidth(c + 1, COL_WIDTHS_[headers[c]] || 110); } catch (e) {}
    }
    // Cột ngày-thuần (Sheets ép thành Date) -> định dạng yyyy-mm-dd.
    ['deadline', 'eventDate'].forEach(function (dc) {
      var idx = headers.indexOf(dc);
      if (idx >= 0 && lastRow > 1) { try { sh.getRange(2, idx + 1, lastRow - 1, 1).setNumberFormat('yyyy-mm-dd'); } catch (e) {} }
    });
  });
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
