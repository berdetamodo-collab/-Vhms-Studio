
# VALIDASI WAJIB & ATURAN INTEGRITAS UNTUK "MODE GANTI"

Dokumen ini berfungsi sebagai "kontrak teknis" yang tidak dapat diganggu gugat untuk implementasi alur kerja "Mode Ganti". Setiap kegagalan untuk mematuhi aturan ini dianggap sebagai kegagalan fungsional kritis.

---

### 1️⃣ PRASYARAT EKSEKUSI (HARD CHECK)

Pastikan pipeline **menolak eksekusi** jika kondisi berikut tidak terpenuhi:

-   Referensi subjek **wajib ada**.
-   Referensi scene **wajib ada**.
-   Mode "replace_existing_subject" aktif secara eksplisit (bukan *insertion*).
-   Kunci scene (*scene lock*) aktif secara default.

**Contoh Logika Validasi:**
```
assert subject_image != null
assert scene_image != null
assert mode == "replace_existing_subject"
```

---

### 2️⃣ KUNCI KEAMANAN PROMPT (SAFETY LOCK)

Pastikan semua prompt final yang dikirim ke model **selalu mengandung** 3 kalimat ini (atau ekuivalennya dalam instruksi yang lebih kompleks):

1.  Perintah untuk **penghapusan total** subjek lama.
2.  Perintah untuk **pelestarian scene 100%**.
3.  Perintah **larangan pembuatan objek baru**.

Jika salah satu dari tiga esensi ini hilang → **wajib fallback** ke prompt versi aman yang minimalis.

---

### 3️⃣ NORMALISASI PROMPT PENGGUNA (KRUSIAL)

Pastikan prompt pengguna yang dimasukkan:

-   **Tidak menciptakan properti baru** (misalnya, furnitur, objek).
-   **Tidak memindahkan atau mengubah sudut pandang kamera**.
-   **Tidak mengubah tata letak scene**.

**Contoh Penanganan:**
-   Input Pengguna: `“duduk di sofa baru”` ➡️ **Auto-rewrite menjadi:** `“duduk di sofa yang sudah ada di scene”`.
-   Input Pengguna: `“tampilan dari atas”` ➡️ **Abaikan atau strip** bagian ini.

Jika prompt melanggar aturan ini, sistem harus **mengabaikan atau menulis ulang secara otomatis** bagian yang melanggar.

---

### 4️⃣ RESOLUSI PRIORITAS PAKAIAN (ANTI-KONFLIK)

Urutan prioritas untuk menentukan pakaian subjek harus **mutlak dan tidak dapat ditawar**:

1.  **Gambar Pakaian (Outfit Image):** Jika ada, ini adalah satu-satunya sumber.
2.  **Deskripsi Pakaian di Prompt:** Jika tidak ada gambar pakaian, deskripsi di prompt menjadi sumber.
3.  **Pakaian Asli Subjek:** Jika tidak ada keduanya, pertahankan pakaian asli dari gambar subjek.

**Dilarang Keras:**
-   Menggabungkan instruksi dari gambar dan deskripsi.
-   Menyempurnakan atau mengasumsikan detail pakaian yang tidak ada.

---

### 5️⃣ PEMERIKSAAN KERAS PENCAHAYAAN & KEDALAMAN (HARD CHECK)

Pastikan prompt **selalu memaksa** model untuk melakukan:

-   Pencocokan **arah pencahayaan** (*Directional lighting match*).
-   Pencocokan **suhu warna** (*Color temperature match*).
-   Generasi **bayangan kontak** (*Contact shadow generation*).
-   Konsistensi **skala dan kamera**.

Ini adalah penentu utama untuk mencegah efek "tempelan" atau *sticker effect*.

---

### 6️⃣ MODE AMAN (FAIL-SAFE) - SANGAT DISARANKAN

Jika model menghasilkan gambar yang melanggar aturan inti, seperti:

-   Menghasilkan scene baru.
-   Menambah orang yang tidak seharusnya.
-   Mengubah lingkungan secara signifikan.

➡️ Sistem harus **secara otomatis menjalankan ulang (auto re-run)** dengan konfigurasi berikut:
-   Mode scene diatur ke: `locked_scene`.
-   Prompt pengguna **dinonaktifkan sepenuhnya**.
-   Prompt dikirim dalam versi **minimalis dan paling aman**.

---

### 7️⃣ KONTROL KUALITAS OUTPUT (AUTO-CHECK)

Setelah gambar dihasilkan, lakukan pemeriksaan otomatis (jika memungkinkan):

-   Apakah hanya ada **satu subjek** di hasil akhir?
-   Apakah **furnitur dan objek latar** sama persis dengan gambar input?
-   Apakah **bayangan menyatu** dengan lingkungan?
-   Apakah **perspektif konsisten**?

Jika tidak lolos pemeriksaan ini, tandai pekerjaan sebagai kandidat untuk **dicoba ulang (flag for retry)**.
