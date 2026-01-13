// Konfigurasi Supabase
const SUPABASE_URL = 'https://bxhrnnwfqlsoviysqcdw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aHJubndmcWxzb3ZpeXNxY2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODkzNDIsImV4cCI6MjA4MTM2NTM0Mn0.O7fpv0TrDd-8ZE3Z9B5zWyAuWROPis5GRnKMxmqncX8';

// Password Admin
const ADMIN_PASSWORD = "Rantauprapat123";

// Inisialisasi Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const galleryContainer = document.getElementById('galleryContainer');
const uploadModal = document.getElementById('uploadModal');
const openUploadModalBtn = document.getElementById('openUploadModal');
const closeUploadModalBtn = document.getElementById('closeUploadModal');
const uploadForm = document.getElementById('uploadForm');
const photoFileInput = document.getElementById('photoFile');
const fileError = document.getElementById('fileError');
const filePreview = document.getElementById('filePreview');
const fileLabelText = document.getElementById('fileLabelText');
const submitBtn = document.getElementById('submitBtn');
const commentsModal = document.getElementById('commentsModal');
const closeCommentsModalBtn = document.getElementById('closeCommentsModal');
const commentsModalBody = document.getElementById('commentsModalBody');
const reportModal = document.getElementById('reportModal');
const closeReportModalBtn = document.getElementById('closeReportModal');
const reportOptions = document.getElementById('reportOptions');
const customReasonContainer = document.getElementById('customReasonContainer');
const customReason = document.getElementById('customReason');
const submitReportBtn = document.getElementById('submitReportBtn');
const adminLoginModal = document.getElementById('adminLoginModal');
const adminPassword = document.getElementById('adminPassword');
const adminLoginError = document.getElementById('adminLoginError');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminModal = document.getElementById('adminModal');
const closeAdminModalBtn = document.getElementById('closeAdminModal');
const adminTabs = document.querySelectorAll('.admin-tab');
const adminSections = document.querySelectorAll('.admin-section');
const reportsList = document.getElementById('reportsList');
const adminPhotosList = document.getElementById('adminPhotosList');
const adminStats = document.getElementById('adminStats');

// State
let currentPhotoId = null;
let currentCommentsPhotoId = null;
let currentReportPhotoId = null;
let userVotes = {};
let isAdmin = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadPhotos();
    
    // Modal upload handlers
    openUploadModalBtn.addEventListener('click', () => {
        uploadModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
    
    closeUploadModalBtn.addEventListener('click', closeUploadModal);
    
    // Tutup modal saat klik di luar konten
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            closeUploadModal();
        }
    });
    
    // Preview file saat dipilih
    photoFileInput.addEventListener('change', handleFileSelect);
    
    // Form submission
    uploadForm.addEventListener('submit', uploadPhoto);
    
    // Modal komentar handlers
    closeCommentsModalBtn.addEventListener('click', closeCommentsModal);
    
    commentsModal.addEventListener('click', (e) => {
        if (e.target === commentsModal) {
            closeCommentsModal();
        }
    });
    
    // Modal report handlers
    closeReportModalBtn.addEventListener('click', closeReportModal);
    
    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            closeReportModal();
        }
    });
    
    // Report reason selection
    reportOptions.addEventListener('change', (e) => {
        if (e.target.value === 'Lainnya') {
            customReasonContainer.style.display = 'block';
        } else {
            customReasonContainer.style.display = 'none';
        }
    });
    
    // Submit report
    submitReportBtn.addEventListener('click', submitReport);
    
    // Admin login handlers
    adminLoginBtn.addEventListener('click', handleAdminLogin);
    adminPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAdminLogin();
        }
    });
    
    // Admin modal handlers
    closeAdminModalBtn.addEventListener('click', closeAdminModal);
    
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            closeAdminModal();
        }
    });
    
    // Admin tab switching
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchAdminTab(tabId);
        });
    });
    
    // Muat vote pengguna dari localStorage
    loadUserVotes();
    
    // Cek jika ada session admin
    checkAdminSession();
});

// Fungsi untuk membuka admin login (klik kanan pada logo)
function openAdminLogin(e) {
    e.preventDefault();
    adminLoginModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    adminPassword.focus();
    return false;
}

// Handle admin login
function handleAdminLogin() {
    const password = adminPassword.value;
    
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        adminLoginModal.style.display = 'none';
        adminModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        adminPassword.value = '';
        adminLoginError.style.display = 'none';
        
        // Simpan session admin
        sessionStorage.setItem('bukankahinimy_admin', 'true');
        
        // Muat data admin
        loadAdminData();
    } else {
        adminLoginError.style.display = 'block';
        adminPassword.value = '';
        adminPassword.focus();
    }
}

// Cek admin session
function checkAdminSession() {
    if (sessionStorage.getItem('bukankahinimy_admin') === 'true') {
        isAdmin = true;
    }
}

// Tutup admin modal
function closeAdminModal() {
    adminModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Switch admin tab
function switchAdminTab(tabId) {
    // Update active tab
    adminTabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update active section
    adminSections.forEach(section => {
        if (section.id === `${tabId}Section`) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    
    // Load data for the tab
    if (tabId === 'reports') {
        loadReports();
    } else if (tabId === 'photos') {
        loadAllPhotos();
    } else if (tabId === 'stats') {
        loadStats();
    }
}

// Load admin data
async function loadAdminData() {
    await loadReports();
    await loadAllPhotos();
    await loadStats();
}

// Load reports from Supabase
async function loadReports() {
    reportsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Memuat laporan...</div>';
    
    try {
        // Fetch reports from the reports table
        const { data, error } = await supabaseClient
            .from('reports_bukankahinimy')
            .select('*, gallery_bukankahinimy(*)')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            reportsList.innerHTML = '<p style="color: #888; text-align: center; padding: 30px;">Belum ada laporan.</p>';
            return;
        }
        
        // Render reports
        reportsList.innerHTML = '';
        data.forEach(report => {
            const reportDate = new Date(report.created_at);
            const formattedDate = reportDate.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const reportItem = document.createElement('div');
            reportItem.className = 'report-item';
            reportItem.innerHTML = `
                <div class="report-header">
                    <div class="report-reason">${report.reason}</div>
                    <div class="report-time">${formattedDate}</div>
                </div>
                <div style="color: #CCC; margin-bottom: 8px; font-size: 0.9rem;">
                    Foto: <strong>${report.gallery_bukankahinimy?.title || 'Foto tidak ditemukan'}</strong>
                </div>
                ${report.details ? `<div style="color: #AAA; font-size: 0.85rem; margin-bottom: 10px;">${report.details}</div>` : ''}
                <div class="report-actions">
                    <button class="admin-action-btn view-photo-btn" onclick="viewReportedPhoto(${report.photo_id})">
                        <i class="fas fa-eye"></i> Lihat Foto
                    </button>
                    <button class="admin-action-btn delete-photo-btn" onclick="deletePhoto(${report.photo_id}, ${report.id})">
                        <i class="fas fa-trash"></i> Hapus Foto
                    </button>
                    <button class="admin-action-btn dismiss-report-btn" onclick="dismissReport(${report.id})">
                        <i class="fas fa-times"></i> Abaikan
                    </button>
                </div>
            `;
            
            reportsList.appendChild(reportItem);
        });
        
    } catch (error) {
        console.error('Error loading reports:', error);
        reportsList.innerHTML = '<p style="color: #F44336; text-align: center; padding: 30px;">Gagal memuat laporan.</p>';
    }
}

// Load all photos for admin
async function loadAllPhotos() {
    adminPhotosList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Memuat foto...</div>';
    
    try {
        const { data, error } = await supabaseClient
            .from('gallery_bukankahinimy')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            adminPhotosList.innerHTML = '<p style="color: #888; text-align: center; padding: 30px;">Belum ada foto.</p>';
            return;
        }
        
        // Render photos
        adminPhotosList.innerHTML = '';
        data.forEach(photo => {
            const photoDate = new Date(photo.created_at);
            const formattedDate = photoDate.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            
            const photoItem = document.createElement('div');
            photoItem.className = 'admin-photo-item';
            photoItem.innerHTML = `
                <img src="${photo.image_url}" alt="${photo.title}" class="admin-photo-thumb" onerror="this.src='https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&h=250&fit=crop&crop=center'">
                <div class="admin-photo-info">
                    <div class="admin-photo-title">${photo.title || 'Tanpa Judul'}</div>
                    <div class="admin-photo-stats">
                        <span><i class="fas fa-user"></i> ${photo.author_name || 'Anonim'}</span> • 
                        <span><i class="fas fa-calendar"></i> ${formattedDate}</span> • 
                        <span><i class="fas fa-thumbs-up"></i> ${photo.upvotes || 0}</span> • 
                        <span><i class="fas fa-thumbs-down"></i> ${photo.downvotes || 0}</span>
                    </div>
                </div>
                <button class="admin-action-btn delete-photo-btn" onclick="deletePhoto(${photo.id})">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            `;
            
            adminPhotosList.appendChild(photoItem);
        });
        
    } catch (error) {
        console.error('Error loading photos for admin:', error);
        adminPhotosList.innerHTML = '<p style="color: #F44336; text-align: center; padding: 30px;">Gagal memuat foto.</p>';
    }
}

// Load stats
async function loadStats() {
    adminStats.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Memuat statistik...</div>';
    
    try {
        // Get total photos
        const { count: totalPhotos, error: photosError } = await supabaseClient
            .from('gallery_bukankahinimy')
            .select('*', { count: 'exact', head: true });
        
        if (photosError) throw photosError;
        
        // Get total votes
        const { data: photosData, error: votesError } = await supabaseClient
            .from('gallery_bukankahinimy')
            .select('upvotes, downvotes');
        
        if (votesError) throw votesError;
        
        let totalUpvotes = 0;
        let totalDownvotes = 0;
        
        if (photosData) {
            photosData.forEach(photo => {
                totalUpvotes += photo.upvotes || 0;
                totalDownvotes += photo.downvotes || 0;
            });
        }
        
        // Get total reports
        const { count: totalReports, error: reportsError } = await supabaseClient
            .from('reports_bukankahinimy')
            .select('*', { count: 'exact', head: true });
        
        if (reportsError) throw reportsError;
        
        // Get total comments
        const { count: totalComments, error: commentsError } = await supabaseClient
            .from('comments_bukankahinimy')
            .select('*', { count: 'exact', head: true });
        
        if (commentsError) throw commentsError;
        
        // Render stats
        adminStats.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div style="background-color: var(--accent-gray); padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 900; color: var(--primary-white); margin-bottom: 5px;">${totalPhotos || 0}</div>
                    <div style="color: #AAA;"><i class="fas fa-images"></i> Total Foto</div>
                </div>
                <div style="background-color: var(--accent-gray); padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 900; color: var(--upvote-color); margin-bottom: 5px;">${totalUpvotes}</div>
                    <div style="color: #AAA;"><i class="fas fa-thumbs-up"></i> Total Upvote</div>
                </div>
                <div style="background-color: var(--accent-gray); padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 900; color: var(--downvote-color); margin-bottom: 5px;">${totalDownvotes}</div>
                    <div style="color: #AAA;"><i class="fas fa-thumbs-down"></i> Total Downvote</div>
                </div>
                <div style="background-color: var(--accent-gray); padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 900; color: var(--report-color); margin-bottom: 5px;">${totalReports || 0}</div>
                    <div style="color: #AAA;"><i class="fas fa-flag"></i> Total Laporan</div>
                </div>
                <div style="background-color: var(--accent-gray); padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 900; color: #2196F3; margin-bottom: 5px;">${totalComments || 0}</div>
                    <div style="color: #AAA;"><i class="fas fa-comments"></i> Total Komentar</div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading stats:', error);
        adminStats.innerHTML = '<p style="color: #F44336; text-align: center; padding: 30px;">Gagal memuat statistik.</p>';
    }
}

// View reported photo
function viewReportedPhoto(photoId) {
    // Cari foto di galeri dan klik tombol komentar untuk melihatnya
    const photoCard = document.querySelector(`.photo-card[data-id="${photoId}"]`);
    if (photoCard) {
        const commentBtn = photoCard.querySelector('.comment-btn');
        if (commentBtn) {
            commentBtn.click();
        }
    }
    closeAdminModal();
}

// Delete photo (admin function)
async function deletePhoto(photoId, reportId = null) {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini? Tindakan ini tidak dapat dibatalkan.')) {
        return;
    }
    
    try {
        // Hapus dari tabel gallery
        const { error: deleteError } = await supabaseClient
            .from('gallery_bukankahinimy')
            .delete()
            .eq('id', photoId);
        
        if (deleteError) throw deleteError;
        
        // Jika ada reportId, hapus juga reportnya
        if (reportId) {
            await supabaseClient
                .from('reports_bukankahinimy')
                .delete()
                .eq('id', reportId);
        }
        
        // Hapus semua report untuk foto ini
        await supabaseClient
            .from('reports_bukankahinimy')
            .delete()
            .eq('photo_id', photoId);
        
        // Hapus semua komentar untuk foto ini
        await supabaseClient
            .from('comments_bukankahinimy')
            .delete()
            .eq('photo_id', photoId);
        
        // Refresh data
        loadPhotos();
        loadReports();
        loadAllPhotos();
        loadStats();
        
        showNotification('✅ Foto berhasil dihapus!', 'success');
        
    } catch (error) {
        console.error('Error deleting photo:', error);
        showNotification('❌ Gagal menghapus foto.', 'error');
    }
}

// Dismiss report (admin function)
async function dismissReport(reportId) {
    try {
        const { error } = await supabaseClient
            .from('reports_bukankahinimy')
            .delete()
            .eq('id', reportId);
        
        if (error) throw error;
        
        // Refresh reports list
        loadReports();
        loadStats();
        
        showNotification('✅ Laporan diabaikan.', 'success');
        
    } catch (error) {
        console.error('Error dismissing report:', error);
        showNotification('❌ Gagal mengabaikan laporan.', 'error');
    }
}

// Fungsi untuk menutup modal upload
function closeUploadModal() {
    uploadModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    uploadForm.reset();
    fileError.style.display = 'none';
    filePreview.style.display = 'none';
    filePreview.src = '';
    fileLabelText.textContent = 'Klik untuk memilih foto';
    submitBtn.disabled = false;
    customReasonContainer.style.display = 'none';
    customReason.value = '';
}

// Fungsi untuk menutup modal komentar
function closeCommentsModal() {
    commentsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentCommentsPhotoId = null;
}

// Fungsi untuk menutup modal report
function closeReportModal() {
    reportModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentReportPhotoId = null;
    // Reset form
    document.querySelectorAll('input[name="reportReason"]').forEach(input => {
        input.checked = false;
    });
    customReasonContainer.style.display = 'none';
    customReason.value = '';
}

// Open report modal
function openReportModal(photoId) {
    currentReportPhotoId = photoId;
    reportModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Submit report
async function submitReport() {
    const selectedReason = document.querySelector('input[name="reportReason"]:checked');
    
    if (!selectedReason) {
        showNotification('⚠️ Pilih alasan pelaporan!', 'warning');
        return;
    }
    
    let reason = selectedReason.value;
    let details = '';
    
    if (reason === 'Lainnya') {
        details = customReason.value.trim();
        if (!details) {
            showNotification('⚠️ Jelaskan alasan pelaporan!', 'warning');
            return;
        }
    }
    
    try {
        // Simpan report ke tabel 'reports_bukankahinimy'
        const { error } = await supabaseClient
            .from('reports_bukankahinimy')
            .insert([
                {
                    photo_id: currentReportPhotoId,
                    reason: reason,
                    details: details
                }
            ]);
            
        if (error) throw error;
        
        // Tutup modal
        closeReportModal();
        
        // Tampilkan notifikasi
        showNotification('✅ Laporan berhasil dikirim!', 'success');
        
    } catch (error) {
        console.error('Error submitting report:', error);
        showNotification('❌ Gagal mengirim laporan.', 'error');
    }
}

// Preview file yang dipilih
function handleFileSelect() {
    const file = photoFileInput.files[0];
    fileError.style.display = 'none';
    fileError.textContent = '';
    
    if (!file) {
        filePreview.style.display = 'none';
        fileLabelText.textContent = 'Klik untuk memilih foto';
        return;
    }
    
    // Validasi file
    if (!validateFile(file)) return;
    
    // Update label
    fileLabelText.textContent = file.name;
    
    // Preview gambar
    const reader = new FileReader();
    reader.onload = function(e) {
        filePreview.src = e.target.result;
        filePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Validasi file
function validateFile(file) {
    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        fileError.textContent = 'Format file tidak didukung. Gunakan JPG, PNG, atau GIF.';
        fileError.style.display = 'block';
        photoFileInput.value = '';
        filePreview.style.display = 'none';
        fileLabelText.textContent = 'Klik untuk memilih foto';
        return false;
    }
    
    // Validasi ukuran file (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB dalam bytes
    if (file.size > maxSize) {
        fileError.textContent = 'Ukuran file terlalu besar. Maksimal 5MB.';
        fileError.style.display = 'block';
        photoFileInput.value = '';
        filePreview.style.display = 'none';
        fileLabelText.textContent = 'Klik untuk memilih foto';
        return false;
    }
    
    return true;
}

// Memuat foto dari Supabase
async function loadPhotos() {
    galleryContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Memuat galeri...</div>';
    
    try {
        // Mengambil data dari tabel 'gallery_bukankahinimy'
        const { data, error } = await supabaseClient
            .from('gallery_bukankahinimy')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data.length === 0) {
            galleryContainer.innerHTML = `
                <div class="empty-gallery">
                    <i class="far fa-images"></i>
                    <h3>Galeri Masih Kosong</h3>
                    <p>Jadilah yang pertama mengupload foto!</p>
                    <button class="upload-btn" style="margin-top: 15px;" id="openUploadModalEmpty">
                        <i class="fas fa-cloud-upload-alt"></i> Upload Foto Pertama
                    </button>
                </div>
            `;
            
            // Tambah event listener untuk tombol upload di empty state
            document.getElementById('openUploadModalEmpty').addEventListener('click', () => {
                uploadModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
            
            return;
        }
        
        // Render foto
        galleryContainer.innerHTML = '';
        data.forEach(photo => {
            const photoCard = createPhotoCard(photo);
            galleryContainer.appendChild(photoCard);
        });
        
    } catch (error) {
        console.error('Error loading photos:', error);
        galleryContainer.innerHTML = `
            <div class="empty-gallery">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Gagal Memuat Galeri</h3>
                <p>Terjadi kesalahan saat memuat foto. Silakan coba lagi.</p>
            </div>
        `;
    }
}

// Membuat kartu foto dengan tombol download dan report
function createPhotoCard(photo) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.dataset.id = photo.id;
    
    // Format tanggal
    const date = new Date(photo.created_at);
    const formattedDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    
    // Cek apakah user sudah vote foto ini
    const hasVoted = userVotes[photo.id] || false;
    
    card.innerHTML = `
        <div class="photo-image-container">
            <img src="${photo.image_url}" alt="${photo.title}" class="photo-image" onerror="this.src='https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&h=250&fit=crop&crop=center'">
            <div class="photo-actions">
                <button class="action-btn download-btn" title="Download foto" onclick="downloadImage('${photo.image_url}', '${photo.title || 'foto'}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="action-btn report-btn" title="Laporkan foto" onclick="openReportModal(${photo.id})">
                    <i class="fas fa-flag"></i>
                </button>
            </div>
        </div>
        <div class="photo-details">
            <h3 class="photo-title">${photo.title || 'Tanpa Judul'}</h3>
            <div class="photo-author">
                <i class="fas fa-user"></i> ${photo.author_name || 'Anonim'} • ${formattedDate}
            </div>
            <p class="photo-description">${photo.description || 'Tidak ada deskripsi'}</p>
            
            <div class="photo-votes">
                <button class="vote-btn upvote-btn" data-id="${photo.id}" ${hasVoted ? 'disabled' : ''}>
                    <i class="fas fa-thumbs-up"></i>
                    <span class="vote-count upvote-count">${photo.upvotes || 0}</span>
                </button>
                
                <button class="vote-btn downvote-btn" data-id="${photo.id}" ${hasVoted ? 'disabled' : ''}>
                    <i class="fas fa-thumbs-down"></i>
                    <span class="vote-count downvote-count">${photo.downvotes || 0}</span>
                </button>
            </div>
            
            <button class="comment-btn" data-id="${photo.id}">
                <i class="fas fa-comment"></i> BERIKAN KOMENTAR
            </button>
        </div>
    `;
    
    // Tambah event listeners untuk vote buttons
    const upvoteBtn = card.querySelector('.upvote-btn');
    const downvoteBtn = card.querySelector('.downvote-btn');
    const commentBtn = card.querySelector('.comment-btn');
    
    if (!hasVoted) {
        upvoteBtn.addEventListener('click', () => votePhoto(photo.id, 'upvote'));
        downvoteBtn.addEventListener('click', () => votePhoto(photo.id, 'downvote'));
    }
    
    commentBtn.addEventListener('click', () => openCommentsModal(photo));
    
    return card;
}

// Download image function
function downloadImage(imageUrl, filename) {
    // Buat elemen anchor untuk download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `bukankahinimy_${filename.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('✅ Download dimulai!', 'success');
}

// Upload foto baru
async function uploadPhoto(e) {
    e.preventDefault();
    
    const title = document.getElementById('photoTitle').value;
    const authorName = document.getElementById('authorName').value;
    const description = document.getElementById('photoDescription').value;
    const file = photoFileInput.files[0];
    
    if (!file) {
        fileError.textContent = 'Silakan pilih file foto.';
        fileError.style.display = 'block';
        return;
    }
    
    // Validasi file sebelum upload
    if (!validateFile(file)) return;
    
    // Tampilkan indikator loading
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';
    submitBtn.disabled = true;
    
    try {
        // Upload file ke Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: fileData, error: uploadError } = await supabaseClient.storage
            .from('photos')
            .upload(fileName, file);
            
        if (uploadError) {
            if (uploadError.message.includes('413')) {
                throw new Error('File terlalu besar. Maksimal 5MB.');
            }
            throw uploadError;
        }
        
        // Dapatkan URL publik untuk file
        const { data: urlData } = supabaseClient.storage
            .from('photos')
            .getPublicUrl(fileName);
        
        const imageUrl = urlData.publicUrl;
        
        // Simpan data foto ke tabel 'gallery_bukankahinimy'
        const { error: dbError } = await supabaseClient
            .from('gallery_bukankahinimy')
            .insert([
                {
                    title: title,
                    author_name: authorName,
                    description: description,
                    image_url: imageUrl,
                    upvotes: 0,
                    downvotes: 0
                }
            ]);
            
        if (dbError) throw dbError;
        
        // Tutup modal dan refresh galeri
        closeUploadModal();
        loadPhotos();
        
        // Tampilkan notifikasi sukses
        showNotification('✅ Foto berhasil diupload!', 'success');
        
        // Simpan nama author untuk komentar
        if (authorName) {
            localStorage.setItem('lastAuthorName', authorName);
        }
        
    } catch (error) {
        console.error('Error uploading photo:', error);
        showNotification(`❌ Gagal mengupload: ${error.message}`, 'error');
    } finally {
        // Reset tombol submit
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Vote foto (upvote/downvote) - Satu vote per user per foto
async function votePhoto(photoId, voteType) {
    const button = event.currentTarget;
    
    // Cek apakah user sudah vote foto ini
    if (userVotes[photoId]) {
        showNotification('⚠️ Anda sudah memberikan vote untuk foto ini!', 'warning');
        return;
    }
    
    try {
        // Ambil data foto saat ini
        const { data: photoData, error: fetchError } = await supabaseClient
            .from('gallery_bukankahinimy')
            .select('upvotes, downvotes')
            .eq('id', photoId)
            .single();
            
        if (fetchError) throw fetchError;
        
        // Hitung vote baru
        let newUpvotes = photoData.upvotes || 0;
        let newDownvotes = photoData.downvotes || 0;
        
        if (voteType === 'upvote') {
            newUpvotes += 1;
        } else if (voteType === 'downvote') {
            newDownvotes += 1;
        }
        
        // Update vote di database
        const { error: updateError } = await supabaseClient
            .from('gallery_bukankahinimy')
            .update({
                upvotes: newUpvotes,
                downvotes: newDownvotes
            })
            .eq('id', photoId);
            
        if (updateError) throw updateError;
        
        // Simpan vote user
        userVotes[photoId] = true;
        saveUserVotes();
        
        // Update tampilan vote
        const card = document.querySelector(`.photo-card[data-id="${photoId}"]`);
        if (card) {
            const upvoteCount = card.querySelector('.upvote-count');
            const downvoteCount = card.querySelector('.downvote-count');
            const upvoteBtn = card.querySelector('.upvote-btn');
            const downvoteBtn = card.querySelector('.downvote-btn');
            
            if (upvoteCount) upvoteCount.textContent = newUpvotes;
            if (downvoteCount) downvoteCount.textContent = newDownvotes;
            
            // Nonaktifkan tombol vote setelah user vote
            if (upvoteBtn) upvoteBtn.disabled = true;
            if (downvoteBtn) downvoteBtn.disabled = true;
        }
        
        // Animasi feedback
        button.style.transform = 'scale(1.1)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 300);
        
        // Tampilkan notifikasi sukses
        showNotification(`✅ Vote ${voteType === 'upvote' ? 'suka' : 'tidak suka'} berhasil!`, 'success');
        
    } catch (error) {
        console.error('Error voting:', error);
        showNotification('❌ Gagal memberikan vote. Silakan coba lagi.', 'error');
    }
}

// Buka modal komentar
async function openCommentsModal(photo) {
    currentCommentsPhotoId = photo.id;
    commentsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Muat konten modal
    commentsModalBody.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Memuat komentar...
        </div>
    `;
    
    try {
        // Muat komentar untuk foto ini
        const comments = await loadComments(photo.id);
        
        // Format tanggal
        const date = new Date(photo.created_at);
        const formattedDate = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Render konten modal
        commentsModalBody.innerHTML = `
            <div class="photo-in-comments">
                <img src="${photo.image_url}" alt="${photo.title}" class="photo-thumbnail" onerror="this.src='https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&h=250&fit=crop&crop=center'">
                <div class="photo-info">
                    <h3 style="margin-bottom: 5px;">${photo.title || 'Tanpa Judul'}</h3>
                    <p style="color: #AAA; font-size: 0.9rem; margin-bottom: 8px;">
                        <i class="fas fa-user"></i> ${photo.author_name || 'Anonim'} • ${formattedDate}
                    </p>
                    <p style="color: #CCC; font-size: 0.9rem;">${photo.description || 'Tidak ada deskripsi'}</p>
                </div>
            </div>
            
            <div class="comments-section-modal">
                <h4 style="margin-bottom: 15px; font-size: 1.1rem;">
                    <i class="fas fa-comments"></i> Komentar (${comments.length})
                </h4>
                
                <div class="comments-list-modal" id="commentsListModal">
                    ${comments.length === 0 ? 
                        '<p style="color: #888; font-style: italic; text-align: center; padding: 20px;">Belum ada komentar. Jadilah yang pertama berkomentar!</p>' : 
                        comments.map(comment => renderComment(comment)).join('')
                    }
                </div>
                
                <div class="comment-form-modal">
                    <input type="text" class="comment-input-modal" id="commentInputModal" 
                           placeholder="Tulis komentar Anda di sini..." required>
                    <button class="comment-submit-modal" id="submitCommentBtn">
                        <i class="fas fa-paper-plane"></i> Kirim Komentar
                    </button>
                </div>
            </div>
        `;
        
        // Tambah event listener untuk form komentar
        const commentInput = document.getElementById('commentInputModal');
        const submitCommentBtn = document.getElementById('submitCommentBtn');
        
        submitCommentBtn.addEventListener('click', () => {
            if (commentInput.value.trim()) {
                addComment(photo.id, commentInput.value.trim());
                commentInput.value = '';
            }
        });
        
        // Enter untuk submit komentar
        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (commentInput.value.trim()) {
                    addComment(photo.id, commentInput.value.trim());
                    commentInput.value = '';
                }
            }
        });
        
    } catch (error) {
        console.error('Error opening comments modal:', error);
        commentsModalBody.innerHTML = `
            <div class="empty-gallery">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Gagal Memuat Komentar</h3>
                <p>Terjadi kesalahan. Silakan coba lagi.</p>
            </div>
        `;
    }
}

// Render komentar
function renderComment(comment) {
    const commentDate = new Date(comment.created_at);
    const formattedTime = commentDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const formattedDate = commentDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
    });
    
    return `
        <div class="comment-item" data-id="${comment.id}">
            <div class="comment-header">
                <div class="comment-author">${comment.author || 'Anonim'}</div>
                <div class="comment-time">${formattedDate} ${formattedTime}</div>
            </div>
            <div class="comment-content">${comment.content}</div>
            <button class="reply-btn" onclick="toggleReplyForm(${comment.id})">
                <i class="fas fa-reply"></i> Balas
            </button>
            <div class="reply-form" id="reply-form-${comment.id}">
                <input type="text" class="reply-input" id="reply-input-${comment.id}" placeholder="Tulis balasan...">
                <div class="reply-buttons">
                    <button class="reply-cancel" onclick="toggleReplyForm(${comment.id})">Batal</button>
                    <button class="reply-submit" onclick="submitReply(${comment.id})">Kirim</button>
                </div>
            </div>
        </div>
    `;
}

// Toggle form balasan
window.toggleReplyForm = function(commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    const isVisible = replyForm.style.display === 'block';
    
    // Sembunyikan semua form balasan lainnya
    document.querySelectorAll('.reply-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Toggle form yang diklik
    replyForm.style.display = isVisible ? 'none' : 'block';
    
    // Focus ke input jika dibuka
    if (!isVisible) {
        setTimeout(() => {
            const input = document.getElementById(`reply-input-${commentId}`);
            if (input) input.focus();
        }, 10);
    }
};

// Submit balasan
window.submitReply = async function(commentId) {
    const replyInput = document.getElementById(`reply-input-${commentId}`);
    const replyText = replyInput.value.trim();
    
    if (!replyText) return;
    
    try {
        // Ambil komentar asli untuk mendapatkan author
        const { data: originalComment, error: fetchError } = await supabaseClient
            .from('comments_bukankahinimy')
            .select('author, content')
            .eq('id', commentId)
            .single();
            
        if (fetchError) throw fetchError;
        
        // Simpan balasan sebagai komentar baru dengan referensi
        const author = localStorage.getItem('lastAuthorName') || 'Anonim';
        const replyContent = `@${originalComment.author || 'Anonim'}: ${replyText}`;
        
        const { error } = await supabaseClient
            .from('comments_bukankahinimy')
            .insert([
                {
                    photo_id: currentCommentsPhotoId,
                    author: author,
                    content: replyContent
                }
            ]);
            
        if (error) throw error;
        
        // Tutup form dan refresh komentar
        toggleReplyForm(commentId);
        replyInput.value = '';
        
        // Muat ulang komentar
        const comments = await loadComments(currentCommentsPhotoId);
        const commentsListModal = document.getElementById('commentsListModal');
        
        if (commentsListModal) {
            commentsListModal.innerHTML = comments.length === 0 ? 
                '<p style="color: #888; font-style: italic; text-align: center; padding: 20px;">Belum ada komentar. Jadilah yang pertama berkomentar!</p>' : 
                comments.map(comment => renderComment(comment)).join('');
        }
        
        showNotification('✅ Balasan berhasil dikirim!', 'success');
        
    } catch (error) {
        console.error('Error submitting reply:', error);
        showNotification('❌ Gagal mengirim balasan.', 'error');
    }
};

// Memuat komentar untuk foto tertentu
async function loadComments(photoId) {
    try {
        const { data, error } = await supabaseClient
            .from('comments_bukankahinimy')
            .select('*')
            .eq('photo_id', photoId)
            .order('created_at', { ascending: true }); // Komentar lama di atas
        
        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Error loading comments:', error);
        return [];
    }
}

// Menambahkan komentar baru
async function addComment(photoId, content) {
    if (!content.trim()) return;
    
    try {
        const author = localStorage.getItem('lastAuthorName') || 
                      document.getElementById('authorName')?.value || 
                      'Anonim';
        
        // Simpan komentar ke tabel 'comments_bukankahinimy'
        const { error } = await supabaseClient
            .from('comments_bukankahinimy')
            .insert([
                {
                    photo_id: photoId,
                    author: author,
                    content: content.trim()
                }
            ]);
            
        if (error) throw error;
        
        // Muat ulang komentar di modal
        if (currentCommentsPhotoId === photoId) {
            const comments = await loadComments(photoId);
            const commentsListModal = document.getElementById('commentsListModal');
            
            if (commentsListModal) {
                commentsListModal.innerHTML = comments.length === 0 ? 
                    '<p style="color: #888; font-style: italic; text-align: center; padding: 20px;">Belum ada komentar. Jadilah yang pertama berkomentar!</p>' : 
                    comments.map(comment => renderComment(comment)).join('');
                
                // Scroll ke bawah
                commentsListModal.scrollTop = commentsListModal.scrollHeight;
            }
        }
        
        showNotification('✅ Komentar berhasil dikirim!', 'success');
        
    } catch (error) {
        console.error('Error adding comment:', error);
        showNotification('❌ Gagal menambahkan komentar.', 'error');
    }
}

// Simpan vote user ke localStorage
function saveUserVotes() {
    localStorage.setItem('userVotes_bukankahinimy', JSON.stringify(userVotes));
}

// Muat vote user dari localStorage
function loadUserVotes() {
    const savedVotes = localStorage.getItem('userVotes_bukankahinimy');
    if (savedVotes) {
        userVotes = JSON.parse(savedVotes);
    }
}

// Menampilkan notifikasi
function showNotification(message, type) {
    // Hapus notifikasi sebelumnya jika ada
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Buat notifikasi baru
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Tentukan warna berdasarkan type
    let bgColor, icon;
    if (type === 'success') {
        bgColor = '#4CAF50';
        icon = 'fa-check-circle';
    } else if (type === 'error') {
        bgColor = '#F44336';
        icon = 'fa-exclamation-circle';
    } else if (type === 'warning') {
        bgColor = '#FF9800';
        icon = 'fa-exclamation-triangle';
    } else {
        bgColor = '#2196F3';
        icon = 'fa-info-circle';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: ${bgColor};
        color: white;
        border-radius: 6px;
        font-weight: 700;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-width: 350px;
    `;
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Hapus notifikasi setelah 3 detik
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Tambahkan animasi CSS jika belum ada
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Muat nama author terakhir dari localStorage saat halaman dimuat
window.addEventListener('load', () => {
    const lastAuthorName = localStorage.getItem('lastAuthorName');
    if (lastAuthorName && document.getElementById('authorName')) {
        document.getElementById('authorName').value = lastAuthorName;
    }
});

// Ekspos fungsi ke global scope untuk event handlers di HTML
window.openAdminLogin = openAdminLogin;
window.downloadImage = downloadImage;
window.openReportModal = openReportModal;
window.viewReportedPhoto = viewReportedPhoto;
window.deletePhoto = deletePhoto;
window.dismissReport = dismissReport;
