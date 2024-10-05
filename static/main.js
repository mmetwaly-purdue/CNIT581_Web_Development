$(document).ready(function () {
    // Open Sign In Modal
    $('#signInBtn').on('click', function () {
        $('#signInModal').css('display', 'flex');
    });

    // Open Register Modal
    $('#registerBtn').on('click', function () {
        $('#registerModal').css('display', 'flex');
    });

    // Close Sign In Modal
    $('#closeSignIn').on('click', function () {
        $('#signInModal').css('display', 'none');
    });

    // Close Register Modal
    $('#closeRegister').on('click', function () {
        $('#registerModal').css('display', 'none');
    });

    // Close modals if user clicks outside the modal content
    $(window).on('click', function (event) {
        if (event.target === document.getElementById('signInModal')) {
            $('#signInModal').css('display', 'none');
        }
        if (event.target === document.getElementById('registerModal')) {
            $('#registerModal').css('display', 'none');
        }
    });

    // Handle Register Form Submission
    $('#registerForm').on('submit', function (event) {
        event.preventDefault();
        const username = $('#registerUsername').val();
        const password = $('#registerPassword').val();
        const email = $('#registerEmail').val();
    
        $.ajax({
            url: '/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password, email }),
            success: function (response) {
                if (response.message === "User registered successfully") {
                    alert("Registration successful!");
                    $('#registerModal').css('display', 'none');
                } else {
                    alert(response.message);
                }
            },
            error: function (error) {
                console.error('Error:', error);
                alert('Failed to register. Please try again.');
            }
        });
    });

    // Handle Sign In Form Submission
    $('#signInForm').on('submit', function (event) {
        event.preventDefault();
        const username = $('#signInUsername').val();
        const password = $('#signInPassword').val();

        // Send data to Flask backend for sign-in
        $.ajax({
            url: '/signin',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: function (response) {
                if (response.message === "Signed in successfully") {
                    alert("Sign in successful!");
                    $('#signInModal').css('display', 'none');
                } else {
                    alert("Invalid username or password");
                }
            },
            error: function (error) {
                console.error('Error:', error);
                alert('Failed to sign in. Please try again.');
            }
        });
    });
});