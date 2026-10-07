/**
 * Kode Lengkap Google Apps Script (GAS) untuk Swim Time Tracker
 * Terdiri dari:
 * 1. Code.gs
 * 2. Index.html
 * 3. CSS.html
 * 4. JavaScript.html
 */

export const CODE_GS = `/**
 * ====================================================================
 * SWIM TIME TRACKER - BACKEND GOOGLE APPS SCRIPT
 * Database: Google Spreadsheet
 * ====================================================================
 * Petunjuk:
 * 1. Buat Google Spreadsheet baru di https://sheets.new
 * 2. Buka menu Extensions (Ekstensi) > Apps Script
 * 3. Ganti SPREADSHEET_ID di bawah ini dengan ID spreadsheet Anda.
 *    (Contoh URL: https://docs.google.com/spreadsheets/d/1BxiMVs0XR.../edit)
 *    Maka ID adalah: 1BxiMVs0XR...
 * 4. Buat 4 file di Apps Script:
 *    - Code.gs (paste isi file ini)
 *    - Index.html
 *    - CSS.html
 *    - JavaScript.html
 * 5. Jalankan fungsi 'setupSpreadsheet()' sekali untuk membuat semua Sheet & Header otomatis.
 * 6. Klik Deploy > New Deployment > Web App:
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone
 *    - Salin Web App URL
 * ====================================================================
 */

// MASUKKAN ID SPREADSHEET ANDA DI SINI:
const SPREADSHEET_ID = "MASUKKAN_ID_SPREADSHEET_DI_SINI";

// Nama-nama Sheet Database
const SHEET_NAMES = {
  ATLET: "ATLET",
  LOMBA: "LOMBA",
  CATATAN_WAKTU: "CATATAN_WAKTU",
  PROGRAM_LATIHAN: "PROGRAM_LATIHAN"
};

/**
 * Mendapatkan instance Spreadsheet aktif atau berdasarkan ID
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== "MASUKKAN_ID_SPREADSHEET_DI_SINI") {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Helper: Menghitung detik dari format MM:SS.hh
 */
function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  var str = String(timeStr).trim().replace(',', '.');
  if (str.indexOf(':') !== -1) {
    var parts = str.split(':');
    var min = parseFloat(parts[0]) || 0;
    var sec = parseFloat(parts[1]) || 0;
    return Number((min * 60 + sec).toFixed(2));
  }
  return Number(parseFloat(str).toFixed(2)) || 0;
}

/**
 * Helper: Menghitung format MM:SS.hh dari total detik
 */
function formatSecondsToTime(totalSec) {
  if (isNaN(totalSec) || totalSec <= 0) return '00:00.00';
  var min = Math.floor(totalSec / 60);
  var remSec = totalSec % 60;
  var wholeSec = Math.floor(remSec);
  var hundredths = Math.round((remSec - wholeSec) * 100);
  
  var mm = String(min).padStart(2, '0');
  var ss = String(wholeSec).padStart(2, '0');
  var hh = String(hundredths >= 100 ? 99 : hundredths).padStart(2, '0');
  return mm + ':' + ss + '.' + hh;
}

/**
 * FUNGSI 1: Inisialisasi Otomatis Spreadsheet & Pembuatan Header Kolom
 * Jalankan fungsi ini pertama kali dari editor Apps Script
 */
function setupSpreadsheet() {
  var ss = getSpreadsheet();
  
  // 1. Sheet ATLET
  // Kolom: ID | Nama Atlet | Jenis Kelamin | Tanggal Lahir | Kelompok Umur | Klub | Pelatih | Status
  var sheetAtlet = ss.getSheetByName(SHEET_NAMES.ATLET) || ss.insertSheet(SHEET_NAMES.ATLET);
  if (sheetAtlet.getLastRow() === 0) {
    sheetAtlet.appendRow(["ID", "Nama Atlet", "Jenis Kelamin", "Tanggal Lahir", "Kelompok Umur", "Klub", "Pelatih", "Status"]);
    sheetAtlet.getRange("A1:H1").setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
    sheetAtlet.setFrozenRows(1);
  }

  // 2. Sheet LOMBA
  // Kolom: ID Lomba | Nama Lomba | Penyelenggara | Lokasi | Tanggal | Keterangan
  var sheetLomba = ss.getSheetByName(SHEET_NAMES.LOMBA) || ss.insertSheet(SHEET_NAMES.LOMBA);
  if (sheetLomba.getLastRow() === 0) {
    sheetLomba.appendRow(["ID Lomba", "Nama Lomba", "Penyelenggara", "Lokasi", "Tanggal", "Keterangan"]);
    sheetLomba.getRange("A1:F1").setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
    sheetLomba.setFrozenRows(1);
  }

  // 3. Sheet CATATAN_WAKTU
  // Kolom: ID | Tanggal | Atlet | Jenis | Nama Lomba | Gaya | Jarak | Waktu | Waktu Detik | Catatan
  var sheetWaktu = ss.getSheetByName(SHEET_NAMES.CATATAN_WAKTU) || ss.insertSheet(SHEET_NAMES.CATATAN_WAKTU);
  if (sheetWaktu.getLastRow() === 0) {
    sheetWaktu.appendRow(["ID", "Tanggal", "Atlet", "Jenis", "Nama Lomba", "Gaya", "Jarak", "Waktu", "Waktu Detik", "Catatan"]);
    sheetWaktu.getRange("A1:J1").setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
    sheetWaktu.setFrozenRows(1);
  }

  // 4. Sheet PROGRAM_LATIHAN
  // Kolom: ID | Tanggal | Atlet | Gaya | Jarak | Fokus Latihan | Set | Repetisi | Target Waktu | Istirahat | Intensitas | Tujuan | Catatan
  var sheetProgram = ss.getSheetByName(SHEET_NAMES.PROGRAM_LATIHAN) || ss.insertSheet(SHEET_NAMES.PROGRAM_LATIHAN);
  if (sheetProgram.getLastRow() === 0) {
    sheetProgram.appendRow(["ID", "Tanggal", "Atlet", "Gaya", "Jarak", "Fokus Latihan", "Set", "Repetisi", "Target Waktu", "Istirahat", "Intensitas", "Tujuan", "Catatan"]);
    sheetProgram.getRange("A1:M1").setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
    sheetProgram.setFrozenRows(1);
  }

  return {
    status: "success",
    message: "Spreadsheet berhasil diatur! Semua 4 Sheet (ATLET, LOMBA, CATATAN_WAKTU, PROGRAM_LATIHAN) siap digunakan."
  };
}

/**
 * FUNGSI 2: Mengambil Data Atlet
 */
function getAtlet() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ATLET);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
  return data.map(function(row) {
    return {
      id: String(row[0]),
      nama: String(row[1]),
      jenisKelamin: String(row[2]),
      tanggalLahir: row[3] ? Utilities.formatDate(new Date(row[3]), Session.getScriptTimeZone(), "yyyy-MM-dd") : "",
      kelompokUmur: String(row[4]),
      klub: String(row[5]),
      pelatih: String(row[6]),
      status: String(row[7]) || "Aktif"
    };
  });
}

/**
 * FUNGSI 3: Menyimpan / Update Data Atlet
 */
function saveAtlet(atlet) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.ATLET);
  if (!sheet) {
    setupSpreadsheet();
    sheet = ss.getSheetByName(SHEET_NAMES.ATLET);
  }

  var id = atlet.id || ("ATL-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmmss"));
  var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues() : [];
  var rowIndex = -1;

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      rowIndex = i + 2; // +2 for 1-based index and header row
      break;
    }
  }

  var rowData = [
    id,
    atlet.nama,
    atlet.jenisKelamin,
    atlet.tanggalLahir,
    atlet.kelompokUmur,
    atlet.klub,
    atlet.pelatih,
    atlet.status || "Aktif"
  ];

  if (rowIndex !== -1) {
    sheet.getRange(rowIndex, 1, 1, 8).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { status: "success", id: id, data: atlet };
}

/**
 * FUNGSI 4: Mengambil Data Lomba
 */
function getLomba() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.LOMBA);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
  return data.map(function(row) {
    return {
      id: String(row[0]),
      namaLomba: String(row[1]),
      penyelenggara: String(row[2]),
      lokasi: String(row[3]),
      tanggal: row[4] ? Utilities.formatDate(new Date(row[4]), Session.getScriptTimeZone(), "yyyy-MM-dd") : "",
      keterangan: String(row[5])
    };
  });
}

/**
 * FUNGSI 5: Menyimpan Data Lomba
 */
function saveLomba(lomba) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.LOMBA);
  if (!sheet) {
    setupSpreadsheet();
    sheet = ss.getSheetByName(SHEET_NAMES.LOMBA);
  }

  var id = lomba.id || ("LMB-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmmss"));
  var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues() : [];
  var rowIndex = -1;

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      rowIndex = i + 2;
      break;
    }
  }

  var rowData = [
    id,
    lomba.namaLomba,
    lomba.penyelenggara,
    lomba.lokasi,
    lomba.tanggal,
    lomba.keterangan || ""
  ];

  if (rowIndex !== -1) {
    sheet.getRange(rowIndex, 1, 1, 6).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { status: "success", id: id, data: lomba };
}

/**
 * FUNGSI 6: Mengambil Data Catatan Waktu
 */
function getCatatanWaktu() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.CATATAN_WAKTU);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();
  return data.map(function(row) {
    return {
      id: String(row[0]),
      tanggal: row[1] ? Utilities.formatDate(new Date(row[1]), Session.getScriptTimeZone(), "yyyy-MM-dd") : "",
      atlet: String(row[2]),
      jenis: String(row[3]),
      namaLomba: String(row[4]),
      gaya: String(row[5]),
      jarak: String(row[6]),
      waktu: String(row[7]),
      waktuDetik: Number(parseFloat(row[8]) || parseTimeToSeconds(row[7])),
      catatan: String(row[9])
    };
  }).reverse(); // urutkan data terbaru di depan
}

/**
 * FUNGSI 7: Menyimpan Data Catatan Waktu
 */
function saveCatatanWaktu(catatan) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.CATATAN_WAKTU);
  if (!sheet) {
    setupSpreadsheet();
    sheet = ss.getSheetByName(SHEET_NAMES.CATATAN_WAKTU);
  }

  var id = catatan.id || ("WKT-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmmss"));
  var waktuDetik = catatan.waktuDetik || parseTimeToSeconds(catatan.waktu);

  var rowData = [
    id,
    catatan.tanggal || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    catatan.atlet,
    catatan.jenis || "Latihan",
    catatan.jenis === "Lomba" ? (catatan.namaLomba || "") : "",
    catatan.gaya,
    catatan.jarak,
    catatan.waktu,
    waktuDetik,
    catatan.catatan || ""
  ];

  sheet.appendRow(rowData);
  return { status: "success", id: id, waktuDetik: waktuDetik };
}

/**
 * FUNGSI 8: Mendapatkan Rekap Personal Best (PB)
 */
function getPersonalBest(namaAtlet, gaya, jarak) {
  var list = getCatatanWaktu();
  if (namaAtlet) {
    list = list.filter(function(r) { return r.atlet.toLowerCase() === namaAtlet.toLowerCase(); });
  }
  if (gaya) {
    list = list.filter(function(r) { return r.gaya === gaya; });
  }
  if (jarak) {
    list = list.filter(function(r) { return r.jarak === jarak; });
  }

  var map = {};
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var key = item.atlet + "___" + item.gaya + "___" + item.jarak;
    if (!map[key]) {
      map[key] = {
        atlet: item.atlet,
        gaya: item.gaya,
        jarak: item.jarak,
        pbWaktu: item.waktu,
        pbDetik: item.waktuDetik,
        waktuTerakhir: item.waktu,
        waktuTerakhirDetik: item.waktuDetik,
        totalDetik: item.waktuDetik,
        count: 1,
        jumlahLatihan: item.jenis === "Latihan" ? 1 : 0,
        jumlahLomba: item.jenis === "Lomba" ? 1 : 0
      };
    } else {
      var entry = map[key];
      entry.totalDetik += item.waktuDetik;
      entry.count += 1;
      if (item.jenis === "Latihan") entry.jumlahLatihan += 1;
      if (item.jenis === "Lomba") entry.jumlahLomba += 1;
      if (item.waktuDetik < entry.pbDetik) {
        entry.pbDetik = item.waktuDetik;
        entry.pbWaktu = item.waktu;
      }
    }
  }

  var result = [];
  for (var k in map) {
    var e = map[k];
    e.rataRataDetik = Number((e.totalDetik / e.count).toFixed(2));
    e.selisihPbDetik = Number((e.waktuTerakhirDetik - e.pbDetik).toFixed(2));
    result.push(e);
  }

  return result;
}

/**
 * FUNGSI 9: Analisis Atlet
 */
function getAnalisisAtlet(namaAtlet) {
  var pbs = getPersonalBest(namaAtlet);
  var allRecords = getCatatanWaktu().filter(function(r) {
    return r.atlet.toLowerCase() === namaAtlet.toLowerCase();
  });

  return {
    atlet: namaAtlet,
    totalCatatan: allRecords.length,
    personalBests: pbs,
    catatanTerbaru: allRecords.slice(0, 10)
  };
}

/**
 * FUNGSI 10: Pembuat Rekomendasi Program Latihan Otomatis
 * Berdasarkan logika renang pelatih:
 * - Jika waktu terakhir lebih lambat signifikan dari PB: Teknik + Endurance + Recovery
 * - Jika mendekati PB: Speed + Race Pace Intervals + Threshold
 * - Jika tembus PB: New PB Sprint Peak & Maintenance
 * - Jika performa menurun: Active Recovery & Reset
 */
function buatProgramLatihan(atlet, gaya, jarak, targetWaktu, lamaMinggu) {
  var pbList = getPersonalBest(atlet, gaya, jarak);
  var pbData = pbList.length > 0 ? pbList[0] : null;
  
  var pbDetik = pbData ? pbData.pbDetik : parseTimeToSeconds(targetWaktu);
  var lastDetik = pbData ? pbData.waktuTerakhirDetik : pbDetik;
  var targetDetik = parseTimeToSeconds(targetWaktu) || (pbDetik * 0.98);

  var diff = lastDetik - pbDetik;
  var program = [];
  var daysCount = (lamaMinggu || 1) * 5; // 5 sesi/minggu

  var daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  for (var i = 0; i < daysCount; i++) {
    var dayName = daysOfWeek[i % 5] + " (Minggu " + (Math.floor(i / 5) + 1) + ")";
    var dayIndex = i % 5;
    var row = {
      hari: dayName,
      fokusLatihan: "",
      set: 4,
      repetisi: 4,
      targetWaktu: "",
      istirahat: "",
      intensitas: "Sedang",
      tujuan: "",
      catatan: ""
    };

    if (diff > 2.0) {
      // Lebih lambat signifikan dari PB -> Teknik & Endurance & Recovery
      if (dayIndex === 0) {
        row.fokusLatihan = "Teknik Dasar & Catch-Pull";
        row.set = 4; row.repetisi = 4;
        row.targetWaktu = formatSecondsToTime(pbDetik * 1.15);
        row.istirahat = "30 dtk";
        row.intensitas = "60-70% (Aerobic)";
        row.tujuan = "Memperbaiki efisiensi stroke dan posisi tubuh streamline";
        row.catatan = "Fokus high elbow catch dan kick steady";
      } else if (dayIndex === 1) {
        row.fokusLatihan = "Aerobic Base Endurance";
        row.set = 4; row.repetisi = 6;
        row.targetWaktu = formatSecondsToTime(pbDetik * 1.12);
        row.istirahat = "30 dtk";
        row.intensitas = "70% (Endurance)";
        row.tujuan = "Membangun stamina dasar renang";
        row.catatan = "Jaga split waktu rata dari set 1 ke 4";
      } else if (dayIndex === 2) {
        row.fokusLatihan = "Active Recovery & Drills";
        row.set = 3; row.repetisi = 4;
        row.targetWaktu = "Mudah / Ringan";
        row.istirahat = "45 dtk";
        row.intensitas = "50% (Recovery)";
        row.tujuan = "Regenerasi otot dan drill pernapasan ritmis";
        row.catatan = "Gunakan paddle ringan / fins bila perlu";
      } else if (dayIndex === 3) {
        row.fokusLatihan = "Pacing Control & Threshold";
        row.set = 5; row.repetisi = 4;
        row.targetWaktu = formatSecondsToTime(pbDetik * 1.06);
        row.istirahat = "45 dtk";
        row.intensitas = "80% (Threshold)";
        row.tujuan = "Membiasakan toleransi asam laktat";
        row.catatan = "Pertahankan kayuhan konstan";
      } else {
        row.fokusLatihan = "Sprint Interval Akhir Pekan";
        row.set = 4; row.repetisi = 2;
        row.targetWaktu = formatSecondsToTime(pbDetik * 1.02);
        row.istirahat = "60 dtk";
        row.intensitas = "85-90% (Sub-Max)";
        row.tujuan = "Simulasi kecepatan target lomba";
        row.catatan = "Start dari balok / tolakan maksimal";
      }
    } else {
      // Mendekati atau lebih cepat dari PB -> Speed, Race Pace, Peak
      if (dayIndex === 0) {
        row.fokusLatihan = "Race Pace Mechanics";
        row.set = 4; row.repetisi = 4;
        row.targetWaktu = formatSecondsToTime(pbDetik * 1.04);
        row.istirahat = "45 dtk";
        row.intensitas = "75-80%";
        row.tujuan = "Konsistensi frekuensi kayuhan pada race tempo";
        row.catatan = "Catat DPS (Distance Per Stroke)";
      } else if (dayIndex === 1) {
        row.fokusLatihan = "Anaerobic Tolerance";
        row.set = 5; row.repetisi = 4;
        row.targetWaktu = formatSecondsToTime(targetDetik * 1.02);
        row.istirahat = "45 dtk";
        row.intensitas = "85-90%";
        row.tujuan = "Meningkatkan daya tahan kecepatan tinggi";
        row.catatan = "Negative split pada repetisi terakhir";
      } else if (dayIndex === 2) {
        row.fokusLatihan = "Recovery Aktif & Fleksibilitas";
        row.set = 3; row.repetisi = 4;
        row.targetWaktu = "Ringan";
        row.istirahat = "60 dtk";
        row.intensitas = "50-60%";
        row.tujuan = "Pemulihan glikogen dan kelenturan bahu";
        row.catatan = "Renang gaya ganti ringan";
      } else if (dayIndex === 3) {
        row.fokusLatihan = "Explosive Speed & Turn";
        row.set = 6; row.repetisi = 2;
        row.targetWaktu = formatSecondsToTime(targetDetik);
        row.istirahat = "75 dtk";
        row.intensitas = "95% (Sprint)";
        row.tujuan = "Ledakan power start, underwaters, dan finis";
        row.catatan = "Breakout cepat 15 meter pertama";
      } else {
        row.fokusLatihan = "Time Trial Simulation (PB Push)";
        row.set = 3; row.repetisi = 1;
        row.targetWaktu = formatSecondsToTime(targetDetik);
        row.istirahat = "120 dtk";
        row.intensitas = "100% (Race Max)";
        row.tujuan = "Uji coba tembus Personal Best";
        row.catatan = "Kondisi fisik prima, pemanasan penuh";
      }
    }

    program.push(row);
  }

  return {
    atlet: atlet,
    gaya: gaya,
    jarak: jarak,
    pbWaktu: pbData ? pbData.pbWaktu : "-",
    targetWaktu: targetWaktu,
    lamaMinggu: lamaMinggu || 1,
    rekomendasi: program
  };
}

/**
 * FUNGSI 11: Menyimpan Program Latihan yang Disetujui Pelatih
 */
function saveProgramLatihan(programItems) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.PROGRAM_LATIHAN);
  if (!sheet) {
    setupSpreadsheet();
    sheet = ss.getSheetByName(SHEET_NAMES.PROGRAM_LATIHAN);
  }

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  var savedCount = 0;

  for (var i = 0; i < programItems.length; i++) {
    var item = programItems[i];
    var id = item.id || ("PRG-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmmss") + "-" + (i + 1));
    sheet.appendRow([
      id,
      item.tanggal || today,
      item.atlet,
      item.gaya,
      item.jarak,
      item.fokusLatihan || item.hari,
      item.set,
      item.repetisi,
      item.targetWaktu,
      item.istirahat,
      item.intensitas || "Sedang",
      item.tujuan || "",
      item.catatan || ""
    ]);
    savedCount++;
  }

  return { status: "success", count: savedCount };
}

/**
 * Endpoint Web App (doGet)
 * Menampilkan Web UI atau melayani request JSON
 */
function doGet(e) {
  // Jika dipanggil via API fetch dengan parameter ?action=...
  if (e && e.parameter && e.parameter.action) {
    var action = e.parameter.action;
    var result = {};
    try {
      if (action === "setup") result = setupSpreadsheet();
      else if (action === "getAtlet") result = getAtlet();
      else if (action === "getLomba") result = getLomba();
      else if (action === "getCatatanWaktu") result = getCatatanWaktu();
      else if (action === "getPersonalBest") result = getPersonalBest(e.parameter.atlet, e.parameter.gaya, e.parameter.jarak);
      else if (action === "ping") result = { status: "online", timestamp: new Date().toISOString() };
      else result = { error: "Unknown action" };
    } catch (err) {
      result = { error: err.toString() };
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Tampilkan antarmuka HTML Web App
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("SWIM TIME TRACKER")
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Endpoint API POST (doPost)
 * Menerima data JSON dari luar untuk sinkronisasi langsung
 */
function doPost(e) {
  var output = {};
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === "saveAtlet") output = saveAtlet(body.data);
    else if (action === "saveLomba") output = saveLomba(body.data);
    else if (action === "saveCatatanWaktu") output = saveCatatanWaktu(body.data);
    else if (action === "saveProgramLatihan") output = saveProgramLatihan(body.data);
    else if (action === "batchSync") {
      if (Array.isArray(body.atlet)) body.atlet.forEach(saveAtlet);
      if (Array.isArray(body.lomba)) body.lomba.forEach(saveLomba);
      if (Array.isArray(body.catatanWaktu)) body.catatanWaktu.forEach(saveCatatanWaktu);
      output = { status: "success", message: "Batch sync berhasil disinkronkan ke Spreadsheet" };
    }
    else if (action === "setup") output = setupSpreadsheet();
    else output = { error: "Action tidak dikenal" };
  } catch (err) {
    output = { error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Include file template HTML/CSS/JS di Apps Script
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
`;

export const INDEX_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWIM TIME TRACKER</title>
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Font Awesome 6 -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
  <!-- SweetAlert2 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- SweetAlert2 JS -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <!-- Custom CSS -->
  <?!= include('CSS'); ?>
</head>
<body class="bg-dark text-light">
  <!-- Top Navbar -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary-gradient shadow-sm sticky-top">
    <div class="container-fluid px-3">
      <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="#">
        <img src="https://ais-pre-j33sm2jrlvieuav4lrvi6r-570564710393.asia-east1.run.app/logo.png" style="width:36px;height:36px;border-radius:8px;object-fit:contain;background:#0f172a;padding:2px;border:1px solid #f59e0b;" alt="Garuda Logo" onerror="this.style.display='none'">
        <span>GARUDA SWIMMING CLUB</span>
      </a>
      <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 gap-1">
          <li class="nav-item"><a class="nav-link active" onclick="switchTab('dashboard')"><i class="fa-solid fa-house me-1"></i> Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" onclick="switchTab('atlet')"><i class="fa-solid fa-user-group me-1"></i> Data Atlet</a></li>
          <li class="nav-item"><a class="nav-link" onclick="switchTab('catat')"><i class="fa-solid fa-stopwatch me-1"></i> Catat Waktu</a></li>
          <li class="nav-item"><a class="nav-link" onclick="switchTab('lomba')"><i class="fa-solid fa-trophy me-1"></i> Data Lomba</a></li>
          <li class="nav-item"><a class="nav-link" onclick="switchTab('pb')"><i class="fa-solid fa-chart-line me-1"></i> Analisis & PB</a></li>
          <li class="nav-item"><a class="nav-link" onclick="switchTab('program')"><i class="fa-solid fa-clipboard-list me-1"></i> Program Latihan</a></li>
          <li class="nav-item"><a class="nav-link" onclick="switchTab('riwayat')"><i class="fa-solid fa-clock-rotate-left me-1"></i> Riwayat Waktu</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Main Container -->
  <main class="container-fluid py-4 px-lg-5">
    <div id="app-view">
      <!-- Konten dimuat dinamis oleh JavaScript -->
      <div class="text-center py-5">
        <div class="spinner-border text-cyan" role="status"></div>
        <p class="mt-2 text-muted">Memuat data dari Google Spreadsheet...</p>
      </div>
    </div>
  </main>

  <!-- Bootstrap 5 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Custom JS -->
  <?!= include('JavaScript'); ?>
</body>
</html>`;

export const CSS_HTML = `<style>
:root {
  --primary-color: #0284c7;
  --primary-dark: #0369a1;
  --accent-cyan: #38bdf8;
  --bg-dark: #0f172a;
  --bg-card: #1e293b;
  --bg-card-hover: #334155;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
}

body {
  background-color: var(--bg-dark) !important;
  color: var(--text-main) !important;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  min-height: 100vh;
}

.text-cyan {
  color: var(--accent-cyan) !important;
}

.bg-primary-gradient {
  background: linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0891b2 100%) !important;
}

.card {
  background-color: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-main) !important;
  border-radius: 12px;
}

.btn-cyan {
  background-color: #0284c7;
  color: #ffffff;
  font-weight: 600;
  border: none;
}
.btn-cyan:hover {
  background-color: #0369a1;
  color: #ffffff;
}

.pool-btn {
  padding: 14px 20px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 10px;
}

.table-dark {
  --bs-table-bg: var(--bg-card);
  --bs-table-border-color: var(--border-color);
}

.pb-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(2, 132, 199, 0.25);
}

.form-control, .form-select {
  background-color: #0f172a !important;
  border-color: var(--border-color) !important;
  color: #f8fafc !important;
}

.form-control:focus, .form-select:focus {
  border-color: var(--accent-cyan) !important;
  box-shadow: 0 0 0 0.25rem rgba(56, 189, 248, 0.25) !important;
}
</style>`;

export const JAVASCRIPT_HTML = `<script>
// State Aplikasi
let currentTab = 'dashboard';
let athletesList = [];
let competitionsList = [];
let timeRecordsList = [];

// Init on Load
document.addEventListener('DOMContentLoaded', function() {
  loadAllData();
});

function loadAllData() {
  // Panggil via google.script.run
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    google.script.run.withSuccessHandler(function(data) {
      athletesList = data || [];
      checkNext();
    }).getAtlet();

    google.script.run.withSuccessHandler(function(data) {
      competitionsList = data || [];
      checkNext();
    }).getLomba();

    google.script.run.withSuccessHandler(function(data) {
      timeRecordsList = data || [];
      renderCurrentTab();
    }).getCatatanWaktu();
  } else {
    // Demo Mode jika dibuka langsung di luar Google Apps Script
    renderCurrentTab();
  }
}

function checkNext() {
  renderCurrentTab();
}

function switchTab(tab) {
  currentTab = tab;
  renderCurrentTab();
}

function renderCurrentTab() {
  const container = document.getElementById('app-view');
  if (!container) return;

  if (currentTab === 'dashboard') {
    renderDashboard(container);
  } else if (currentTab === 'atlet') {
    renderAtletView(container);
  } else if (currentTab === 'catat') {
    renderCatatWaktuView(container);
  } else if (currentTab === 'lomba') {
    renderLombaView(container);
  } else if (currentTab === 'pb') {
    renderPBView(container);
  } else if (currentTab === 'program') {
    renderProgramView(container);
  } else if (currentTab === 'riwayat') {
    renderRiwayatView(container);
  }
}

// Format waktu MM:SS.hh
function formatTime(sec) {
  if (isNaN(sec) || sec <= 0) return '00:00.00';
  let m = Math.floor(sec / 60);
  let s = sec % 60;
  let wholeS = Math.floor(s);
  let h = Math.round((s - wholeS) * 100);
  return String(m).padStart(2,'0') + ':' + String(wholeS).padStart(2,'0') + '.' + String(h >= 100 ? 99 : h).padStart(2,'0');
}

function autoFormatGasTime(el) {
  let val = el.value.replace(/,/g, '.').replace(/[^0-9:.]/g, '');
  if (!val) return;
  if (val.includes(':')) {
    let parts = val.split(':');
    let m = parts[0].slice(0, 2);
    let rest = parts.slice(1).join('');
    if (rest.includes('.')) {
      let [s, h] = rest.split('.');
      el.value = m + ':' + s.slice(0, 2) + '.' + h.slice(0, 2);
    } else if (rest.length >= 2) {
      el.value = m + ':' + rest.slice(0, 2) + '.' + rest.slice(2, 4);
    } else {
      el.value = m + ':' + rest;
    }
    return;
  }
  if (val.includes('.')) {
    let [sec, hund] = val.split('.');
    let s = sec.slice(0, 2).padStart(2, '0');
    el.value = '00:' + s + '.' + hund.slice(0, 2);
    return;
  }
  let digits = val.replace(/\D/g, '');
  if (digits.length === 2 && digits === '00') {
    el.value = '00:';
  } else if (digits.length === 3) {
    if (digits.startsWith('00')) el.value = '00:' + digits.slice(2);
    else el.value = '00:' + digits.slice(0, 2) + '.' + digits.slice(2);
  } else if (digits.length === 4) {
    el.value = '00:' + digits.slice(0, 2) + '.' + digits.slice(2, 4);
  } else if (digits.length >= 5) {
    el.value = digits.slice(0, 2) + ':' + digits.slice(2, 4) + '.' + digits.slice(4, 6);
  }
}

function renderDashboard(container) {
  const totalAtlet = athletesList.length;
  const totalLomba = competitionsList.length;
  const totalCatatan = timeRecordsList.length;
  
  // Hitung jumlah PB unik
  const pbs = {};
  timeRecordsList.forEach(r => {
    const key = r.atlet + '_' + r.gaya + '_' + r.jarak;
    if (!pbs[key] || r.waktuDetik < pbs[key].waktuDetik) {
      pbs[key] = r;
    }
  });
  const totalPB = Object.keys(pbs).length;

  container.innerHTML = \`
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <div class="card stat-card p-3 text-center border-primary">
          <i class="fa-solid fa-users fs-2 text-cyan mb-2"></i>
          <h2 class="fw-bold mb-0">\${totalAtlet}</h2>
          <small class="text-muted">Jumlah Atlet</small>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card stat-card p-3 text-center border-info">
          <i class="fa-solid fa-trophy fs-2 text-warning mb-2"></i>
          <h2 class="fw-bold mb-0">\${totalLomba}</h2>
          <small class="text-muted">Jumlah Lomba</small>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card stat-card p-3 text-center border-success">
          <i class="fa-solid fa-stopwatch fs-2 text-success mb-2"></i>
          <h2 class="fw-bold mb-0">\${totalCatatan}</h2>
          <small class="text-muted">Catatan Waktu</small>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="card stat-card p-3 text-center border-warning">
          <i class="fa-solid fa-medal fs-2 text-warning mb-2"></i>
          <h2 class="fw-bold mb-0">\${totalPB}</h2>
          <small class="text-muted">Personal Best</small>
        </div>
      </div>
    </div>

    <!-- Tombol Cepat Tepi Kolam -->
    <div class="d-flex gap-3 mb-4 flex-wrap">
      <button class="btn btn-cyan pool-btn flex-fill" onclick="switchTab('catat')">
        <i class="fa-solid fa-stopwatch me-2"></i> CATAT WAKTU SEKARANG
      </button>
      <button class="btn btn-outline-info pool-btn flex-fill" onclick="switchTab('program')">
        <i class="fa-solid fa-brain me-2"></i> BUAT PROGRAM LATIHAN
      </button>
    </div>

    <!-- Tabel Catatan Terbaru & PB -->
    <div class="row g-4">
      <div class="col-lg-6">
        <div class="card p-3 shadow-sm">
          <h5 class="fw-bold mb-3 text-cyan"><i class="fa-solid fa-clock me-2"></i>CATATAN TERBARU</h5>
          <div class="table-responsive">
            <table class="table table-dark table-hover table-sm">
              <thead>
                <tr>
                  <th>Tanggal</th><th>Atlet</th><th>Jenis</th><th>Nomor</th><th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                \${timeRecordsList.slice(0, 5).map(r => \`
                  <tr>
                    <td>\${r.tanggal}</td>
                    <td class="fw-bold">\${r.atlet}</td>
                    <td><span class="badge \${r.jenis === 'Lomba' ? 'bg-warning text-dark' : 'bg-primary'}">\${r.jenis}</span></td>
                    <td>\${r.gaya} \${r.jarak}</td>
                    <td class="text-cyan fw-bold font-monospace">\${r.waktu}</td>
                  </tr>
                \`).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada catatan waktu</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="card p-3 shadow-sm">
          <h5 class="fw-bold mb-3 text-warning"><i class="fa-solid fa-medal me-2"></i>PERSONAL BEST</h5>
          <div class="table-responsive">
            <table class="table table-dark table-hover table-sm">
              <thead>
                <tr>
                  <th>Atlet</th><th>Gaya</th><th>Jarak</th><th>PB (Detik)</th>
                </tr>
              </thead>
              <tbody>
                \${Object.values(pbs).slice(0, 5).map(p => \`
                  <tr>
                    <td class="fw-bold">\${p.atlet}</td>
                    <td>\${p.gaya}</td>
                    <td>\${p.jarak}</td>
                    <td><span class="pb-badge"><i class="fa-solid fa-crown"></i> \${p.waktu} (\${p.waktuDetik}s)</span></td>
                  </tr>
                \`).join('') || '<tr><td colspan="4" class="text-center text-muted">Belum ada Personal Best</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  \`;
}

// Form Catat Waktu
function renderCatatWaktuView(container) {
  container.innerHTML = \`
    <div class="card p-4 mx-auto" style="max-width: 650px;">
      <h4 class="fw-bold mb-3 text-cyan"><i class="fa-solid fa-stopwatch me-2"></i>Catat Waktu Renang</h4>
      <form id="formCatatWaktu" onsubmit="handleSimpanWaktu(event)">
        <div class="mb-3">
          <label class="form-label">Tanggal</label>
          <input type="date" id="wktTanggal" class="form-control form-control-lg" value="\${new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Nama Atlet</label>
          <select id="wktAtlet" class="form-select form-select-lg" required>
            <option value="">-- Pilih Atlet --</option>
            \${athletesList.map(a => \`<option value="\${a.nama}">\${a.nama} (\${a.klub})</option>\`).join('')}
          </select>
        </div>
        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label">Jenis</label>
            <select id="wktJenis" class="form-select form-select-lg" onchange="toggleLombaInput()" required>
              <option value="Latihan">Latihan</option>
              <option value="Lomba">Lomba</option>
            </select>
          </div>
          <div class="col-6" id="divNamaLomba" style="display:none;">
            <label class="form-label">Nama Lomba</label>
            <select id="wktNamaLomba" class="form-select form-select-lg">
              <option value="">-- Pilih Lomba --</option>
              \${competitionsList.map(l => \`<option value="\${l.namaLomba}">\${l.namaLomba}</option>\`).join('')}
            </select>
          </div>
        </div>
        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label">Gaya Renang</label>
            <select id="wktGaya" class="form-select form-select-lg" required>
              <option value="Bebas">Bebas</option>
              <option value="Dada">Dada</option>
              <option value="Punggung">Punggung</option>
              <option value="Kupu-kupu">Kupu-kupu</option>
              <option value="Gaya Ganti">Gaya Ganti</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">Jarak</label>
            <select id="wktJarak" class="form-select form-select-lg" required>
              <option value="25 m">25 m</option>
              <option value="50 m" selected>50 m</option>
              <option value="100 m">100 m</option>
              <option value="200 m">200 m</option>
              <option value="400 m">400 m</option>
              <option value="800 m">800 m</option>
              <option value="1500 m">1500 m</option>
            </select>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Waktu (Format MM:SS.hh)</label>
          <input type="text" id="wktWaktu" inputmode="decimal" class="form-control form-control-lg font-monospace text-warning fw-bold fs-3 text-center" placeholder="00:35.42" oninput="autoFormatGasTime(this)" required>
          <small class="text-info d-block mt-1">✨ Otomatis menyisipkan tanda titik dua (:) dan koma/titik (.) saat mengetik angka.</small>
        </div>
        <div class="mb-3">
          <label class="form-label">Catatan Tambahan</label>
          <textarea id="wktCatatan" class="form-control" rows="2" placeholder="Kondisi atlet, kayuhan, lap, dsb..."></textarea>
        </div>
        <button type="submit" class="btn btn-cyan pool-btn w-100 fs-4">
          <i class="fa-solid fa-floppy-disk me-2"></i> SIMPAN CATATAN WAKTU
        </button>
      </form>
    </div>
  \`;
}

function toggleLombaInput() {
  const jenis = document.getElementById('wktJenis').value;
  const div = document.getElementById('divNamaLomba');
  if (div) {
    div.style.display = jenis === 'Lomba' ? 'block' : 'none';
  }
}

function handleSimpanWaktu(e) {
  e.preventDefault();
  const atlet = document.getElementById('wktAtlet').value;
  const jenis = document.getElementById('wktJenis').value;
  const namaLomba = jenis === 'Lomba' ? document.getElementById('wktNamaLomba').value : '';
  const gaya = document.getElementById('wktGaya').value;
  const jarak = document.getElementById('wktJarak').value;
  const waktu = document.getElementById('wktWaktu').value;
  const catatan = document.getElementById('wktCatatan').value;
  const tanggal = document.getElementById('wktTanggal').value;

  const data = {
    tanggal, atlet, jenis, namaLomba, gaya, jarak, waktu, catatan
  };

  Swal.fire({
    title: 'Menyimpan...',
    text: 'Menyimpan catatan waktu ke Google Spreadsheet',
    didOpen: () => Swal.showLoading()
  });

  if (typeof google !== 'undefined' && google.script && google.script.run) {
    google.script.run.withSuccessHandler(function(resp) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disimpan!',
        text: 'Catatan waktu ' + waktu + ' (' + resp.waktuDetik + ' detik) tersimpan di sheet CATATAN_WAKTU.',
        timer: 2000
      });
      loadAllData();
      switchTab('dashboard');
    }).saveCatatanWaktu(data);
  } else {
    // Offline simulation
    setTimeout(() => {
      Swal.fire({ icon: 'success', title: 'Tersimpan (Lokal)', text: 'Catatan waktu ' + waktu });
      switchTab('dashboard');
    }, 500);
  }
}
</script>`;
