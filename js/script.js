document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Mobile Menu Hamburger Interactivity ---
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // --- 2. Dynamic Sticky Navigation Control ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 3. Intersection Observer Scroll Reveal Engine ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Reveal once only
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- 4. Auto Active Menu Highlighter Loop ---
    const sections = document.querySelectorAll('section');
    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.25,
        rootMargin: '-25% 0px -55% 0px'
    });

    sections.forEach(sec => activeObserver.observe(sec));

    // --- 5. Interactive Form Validation and Transmission Simulation ---
    const contactForm = document.getElementById('portfolio-contact-form');
    const successAlert = document.getElementById('form-success-alert');
    const errorAlert = document.getElementById('form-error-alert');

    // Pastikan menambahkan kata 'async' sebelum parameter (e)
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let valid = true;
        const requiredFields = contactForm.querySelectorAll('input[required], textarea[required]');

        // 1. SISTEM VALIDASI ANDA
        requiredFields.forEach(field => {
            const container = field.parentElement;
            if (!field.value.trim()) {
                container.classList.add('invalid');
                valid = false;
            } else {
                container.classList.remove('invalid');

                if (field.type === 'email') {
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(field.value.trim())) {
                        container.classList.add('invalid');
                        valid = false;
                    } else {
                        container.classList.remove('invalid');
                    }
                }
            }
        });

        // 2. JIKA FORM VALID, PROSES PENGIRIMAN DIJALANKAN
        if (valid) {
            errorAlert.classList.add('hidden');

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnSpinner = submitBtn.querySelector('.btn-spinner');

            // Aktifkan mode loading pada tombol Anda
            submitBtn.disabled = true;
            btnText.textContent = 'Transmitting Bundle...';
            btnSpinner.classList.remove('hidden');

            // Mengambil data form & menyisipkan Access Key sesuai dokumentasi Web3Forms
            const formData = new FormData(contactForm);

            // Hapus duplikat data access_key jika tidak sengaja ada di HTML Anda
            if (formData.has("access_key")) {
                formData.delete("access_key");
            }

            // Memaksa key dikirim sebagai string bersih tanpa spasi hantu
            const cleanKey = "152082b7-f4cf-4213-913c-2fcfcf821cee".trim();
            formData.append("access_key", cleanKey);

            try {
                // Mengirim data menggunakan Async/Await Fetch API
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    // JIKA BERHASIL: Munculkan alert sukses Anda & kosongkan form
                    successAlert.classList.remove('hidden');
                    contactForm.reset();

                    setTimeout(() => {
                        successAlert.classList.add('hidden');
                    }, 4000);
                } else {
                    // JIKA API WEB3FORMS MERESPON ERROR
                    alert("Error: " + data.message);
                }

            } catch (error) {
                // JIKA TERJADI MASALAH JARINGAN INTERNET
                alert("Something went wrong. Please try again.");
            } finally {
                // KONDISI APAPUN YANG TERJADI, KEMBALIKAN TOMBOL KE SEMULA
                submitBtn.disabled = false;
                btnText.textContent = 'Transmit Message Bundle';
                btnSpinner.classList.add('hidden');
            }

        } else {
            // JIKA VALIDASI GAGAL
            successAlert.classList.add('hidden');
            errorAlert.classList.remove('hidden');
        }
    });
    // Event listener to remove error flags interactively upon parameter adjust
    const formFields = contactForm.querySelectorAll('input, textarea');
    formFields.forEach(f => {
        f.addEventListener('input', () => {
            const group = f.parentElement;
            if (group.classList.contains('invalid')) {
                group.classList.remove('invalid');
            }
        });
    });
});

$(document).ready(function () {
    let images = [];
    let currentIndex = 0;

    // 1. Ketika Gambar Utama diklik
    $('.gallery-trigger').on('click', function () {
        // Ambil string gambar lalu pecah menjadi array
        const imageString = $(this).attr('data-images');
        images = imageString.split(',').map(img => img.trim());

        // Mulai dari gambar pertama (index 0)
        currentIndex = 0;

        // Tampilkan modal dan set gambarnya
        updateModalImage();
        $('#galleryModal').css('display', 'flex');
    });

    // 2. Fungsi untuk update gambar di dalam modal
    function updateModalImage() {
        $('#modalImg').attr('src', images[currentIndex]);
    }

    // 3. Tombol Next
    $('.next-btn').on('click', function (e) {
        e.stopPropagation(); // Mencegah modal tertutup
        currentIndex = (currentIndex + 1) % images.length; // Loop kembali ke awal jika sudah foto terakhir
        updateModalImage();
    });

    // 4. Tombol Prev
    $('.prev-btn').on('click', function (e) {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + images.length) % images.length; // Loop ke akhir jika di foto pertama
        updateModalImage();
    });

    // 5. Tombol Close
    $('.close-modal').on('click', function () {
        $('#galleryModal').css('display', 'none');
    });

    // 6. Klik area hitam di luar gambar untuk menutup modal
    $('#galleryModal').on('click', function (e) {
        if ($(e.target).hasClass('gallery-modal') || $(e.target).hasClass('modal-content-wrapper')) {
            $('#galleryModal').css('display', 'none');
        }
    });

    // 7. Navigasi menggunakan Keyboard (Opsional tapi bagus untuk UX)
    $(document).on('keydown', function (e) {
        if ($('#galleryModal').is(':visible')) {
            if (e.key === "ArrowRight") $('.next-btn').click();
            if (e.key === "ArrowLeft") $('.prev-btn').click();
            if (e.key === "Escape") $('.close-modal').click();
        }
    });
});
