document.addEventListener('DOMContentLoaded', () => {
    const inspectionBody = document.getElementById('inspection-body');
    const addRowBtn = document.getElementById('add-row');
    const savePdfBtn = document.getElementById('save-pdf');

    let rowCount = 1;

    // Fungsi untuk menambah baris baru
    addRowBtn.addEventListener('click', () => {
        rowCount++;
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${rowCount}</td>
            <td><input type="text" placeholder="Description / Failure" oninput="this.value = this.value.toUpperCase()" onkeydown="handleNavigation(event)"></td>
            <td><input type="text" placeholder="Condition" oninput="this.value = this.value.toUpperCase()" onkeydown="handleNavigation(event)"></td>
            <td><input type="file" accept="image/*" onchange="previewImage(this)"></td>
        `;
        inspectionBody.appendChild(newRow);
    });

    // Fungsi untuk membuat PDF saja
    savePdfBtn.addEventListener('click', () => {
        document.getElementById('add-row').style.display = 'none';
        document.getElementById('save-pdf').style.display = 'none';
        document.getElementById('send-to-sheet').style.display = 'none';

        const imagePromises = [];
        const fileInputs = document.querySelectorAll('#inspection-body input[type="file"]');
        fileInputs.forEach(input => {
            if (input.files.length > 0) {
                imagePromises.push(new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const cell = input.parentElement;
                        cell.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.className = 'photo-preview-pdf';
                        cell.appendChild(img);
                        resolve();
                    };
                    reader.readAsDataURL(input.files[0]);
                }));
            }
        });

        Promise.all(imagePromises).then(() => {
            const element = document.querySelector('.container');
            const options = {
                margin: 1,
                filename: 'Laporan_Inspeksi.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 4, dpi: 192, letterRendering: true, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().from(element).set(options).save().then(() => {
                document.getElementById('add-row').style.display = 'inline-block';
                document.getElementById('save-pdf').style.display = 'inline-block';
                document.getElementById('send-to-sheet').style.display = 'inline-block';
                location.reload();
            });
        });
    });

    const headerInputs = document.querySelectorAll('.info-group input[type="text"]');
    headerInputs.forEach(input => {
        input.addEventListener('keydown', handleNavigation);
    });

    inspectionBody.addEventListener('keydown', handleNavigation);
});

// Fungsi navigasi
function handleNavigation(e) {
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="file"]'));
    const currentIndex = inputs.indexOf(e.target);

    if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex > -1 && currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
            inputs[currentIndex - 1].focus();
        }
    }
}

// Preview gambar
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            let img = input.nextElementSibling;
            if (!img || img.tagName !== 'IMG') {
                img = document.createElement('img');
                img.className = 'photo-preview';
                input.parentNode.appendChild(img);
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

/* ------------------- Fungsi Kirim ke Sheet ------------------- */
document.getElementById("send-to-sheet").addEventListener("click", () => {
    const site = document.getElementById("site").value;
    const reportDate = document.getElementById("report-date").value;
    const kodeUnit = document.getElementById("kode-unit").value;
    const hourMeter = document.getElementById("hour-meter").value;
    const reportedBy = document.getElementById("reported-by").value;
    const inspBy = document.getElementById("insp-by").value;
    const priority = document.getElementById("priority").value;

    const rows = [];
    document.querySelectorAll("#inspection-body tr").forEach(tr => {
        const desc = tr.querySelector('td:nth-child(2) input')?.value || "";
        const cond = tr.querySelector('td:nth-child(3) input')?.value || "";
        rows.push({ description: desc, condition: cond });
    });

    fetch("https://forminspek1.sayaryant.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            site,
            reportDate,
            kodeUnit,
            hourMeter,
            reportedBy,
            inspBy,
            priority,
            rows
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            alert("✅ Data berhasil dikirim ke Google Sheet!");
        } else {
            alert("⚠ Gagal mengirim data: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ Terjadi kesalahan saat mengirim data.");
    });
});
