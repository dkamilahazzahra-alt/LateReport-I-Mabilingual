// 1. REALTIME CLOCK
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID'); 
    document.getElementById('liveClock').innerText = timeString;
}
setInterval(updateClock, 1000);
updateClock();

// 2. (GEOLOCATION DIHAPUS)

// 3. LOGIKA ABSENSI
const form = document.getElementById('absenForm');
const tabelBody = document.getElementById('tabelData');
const emptyState = document.getElementById('emptyState');

document.addEventListener('DOMContentLoaded', loadData);

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const nama = document.getElementById('nama').value;
    const kelas = document.getElementById('kelas').value;
    const status = document.getElementById('status').value;
    const waktu = new Date().toLocaleString('id-ID');

    // Object data sekarang lebih simpel (tanpa lat/long)
    const newData = { nama, kelas, status, waktu };

    saveToLocalStorage(newData);
    renderRow(newData);
    
    form.reset();
    
    Swal.fire({
        title: 'Berhasil!',
        text: 'Data absensi telah tersimpan.',
        icon: 'success',
        confirmButtonColor: '#4e73df'
    });
});

// 4. STORAGE & RENDER
function saveToLocalStorage(data) {
    let attendanceData = JSON.parse(localStorage.getItem('absensiData')) || [];
    attendanceData.push(data);
    localStorage.setItem('absensiData', JSON.stringify(attendanceData));
    checkEmpty();
}

function loadData() {
    let attendanceData = JSON.parse(localStorage.getItem('absensiData')) || [];
    attendanceData.forEach(data => renderRow(data));
    checkEmpty();
}

function renderRow(data) {
    let badgeClass = '';
    if(data.status === 'Hadir') badgeClass = 'bg-success';
    else if(data.status === 'Izin') badgeClass = 'bg-warning text-dark';
    else badgeClass = 'bg-danger';

    const row = document.createElement('tr');
    // Kolom koordinat dihapus dari HTML string di bawah ini
    row.innerHTML = `
        <td><small>${data.waktu}</small></td>
        <td class="fw-bold">${data.nama}</td>
        <td>${data.kelas}</td>
        <td><span class="badge ${badgeClass} badge-status">${data.status}</span></td>
    `;
    tabelBody.prepend(row); 
}

function checkEmpty() {
    const data = JSON.parse(localStorage.getItem('absensiData')) || [];
    if (data.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
    }
}

// 5. RESET DATA
function clearData() {
    Swal.fire({
        title: 'Yakin hapus semua?',
        text: "Data yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('absensiData');
            tabelBody.innerHTML = '';
            checkEmpty();
            Swal.fire('Terhapus!', 'Data absensi telah direset.', 'success');
        }
    })
}

// 6. EXPORT EXCEL (Tanpa Koordinat)
function exportExcel() {
    let data = JSON.parse(localStorage.getItem('absensiData')) || [];
    if(data.length === 0) {
        Swal.fire('Ups!', 'Belum ada data untuk diexport.', 'info');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Waktu,Nama,Kelas,Status\n"; // Header disesuaikan

    data.forEach(function(rowArray) {
        // Hapus lat & long dari baris CSV
        let row = `${rowArray.waktu},${rowArray.nama},${rowArray.kelas},${rowArray.status}`;
        csvContent += row + "\r\n";
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "laporan_absensi.csv");
    document.body.appendChild(link);
    link.click();
}
