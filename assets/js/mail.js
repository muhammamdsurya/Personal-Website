function sendMessage() {
  // Memeriksa apakah semua input formulir telah diisi
  if (
    document.getElementById("name").value === "" ||
    document.getElementById("email").value === "" ||
    document.getElementById("subject").value === "" ||
    document.getElementById("message").value === ""
  ) {
    // Menampilkan pesan kesalahan jika ada input yang kosong
    document.getElementById("result-message").textContent =
      "Please fill in all fields.";
    document.getElementById("result-message").style.color = "red";

    setTimeout(function () {
      document.getElementById("result-message").textContent = "";
    }, 2000);
  } else {
    // Melanjutkan dengan pengiriman pesan jika semua input telah diisi
    console.log("sendMessage");
    var name = document.getElementById("name").value;
    var subject = document.getElementById("subject").value;
    var email = document.getElementById("email").value;
    var message = document.getElementById("message").value;

    var body =
      "<strong>Someone sent an email for you! here are the details : </strong>" +
      "<br> <br> <strong>Name : </strong>" +
      name +
      "<br> <strong> Email : </strong>" +
      email +
      "<br> <br>" +
      message +
      "<br><br> <strong> From : </strong>" +
      email +
      "<br> <strong> To : Me</strong>";

    Email.send({
      SecureToken: "3e7eb179-87ac-432d-9ec4-d80f8b13f358",
      To: "muhammadsurya2812@gmail.com",
      From: "muhammadsurya2812@gmail.com",
      Subject: subject,
      Body: body,
    })
      .then(function (message) {
        // Menampilkan pesan berhasil
        document.getElementById("result-message").textContent =
          "Email sent successfully!";
        document.getElementById("result-message").style.color = "green";
      })
      .catch(function (error) {
        // Menampilkan pesan gagal
        document.getElementById("result-message").textContent =
          "Failed to send email.";
        document.getElementById("result-message").style.color = "red";
      });
  }
}
