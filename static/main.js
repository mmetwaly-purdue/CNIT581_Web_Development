

$(document).ready(function () {
    // Check if the user is already signed in
    var storedUsername = localStorage.getItem('username');
    let agentCounter = 10;  // Counter to keep track of new agents
    const connections = []; // Array to store connections

    if (storedUsername) {
        $('.auth-buttons').html(`<p>Hello, ${storedUsername}!</p>`);
        $('#userLogo').show(); // Make sure the user icon is visible
    } else {
        $('#userLogo').hide(); // Hide the user icon if not logged in
    }

    // Show the Logout Popup when clicking the user logo
    $('#userLogo').on('click', function () {
        $('#logoutPopup').toggle(); // Toggle visibility
    });

    $(document).on('click', '#signInBtn', function () {
        console.log("Sign In button clicked"); // Debug log
        $('#signInModal').css('display', 'flex');
    });

    // Delegated event listener for Register button
    $(document).on('click', '#registerBtn', function () {
        console.log("Register button clicked"); // Debug log
        $('#registerModal').css('display', 'flex');
    });

    // Close Sign In Modal
    $(document).on('click', '#closeSignIn', function () {
        $('#signInModal').css('display', 'none');
    });

    // Close Register Modal
    $(document).on('click', '#closeRegister', function () {
        $('#registerModal').css('display', 'none');
    });
    
    // Agent data containing descriptions
    const agentDescriptions = {
        "Agent 1": "Description of agent 'Agent 1 is trained to find significant characters/names in mystery'. Provides name, age, occupation (if possible), demographics.",
        "Agent 2": "Description of agent 'Agent 2 performs keyword extraction in scientific articles'.",
        "Agent 3": "Description of agent 'Agent 3 analyzes sentiment in social media posts'.",
        // Add descriptions for the rest of the agents
    };

    // Add tooltips to agent buttons if they exist
    if ($(".agent-button").length > 0) {
        $(".agent-button").each(function () {
            const agentName = $(this).text().trim();
            if (agentDescriptions[agentName]) {
                const tooltip = $("<div class='tooltip'></div>").text(agentDescriptions[agentName]);
                $(this).append(tooltip);
            }
        });
    }
    
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
                    $('.auth-buttons').html(`<p>Hello, ${username}!</p>`);
                    localStorage.setItem('username', username);  // Store username for session persistence
                    $('#userLogo').show(); // Show user logo after registration (ADD THIS LINE)
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

        $.ajax({
            url: '/signin',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: function (response) {
                if (response.message === "Signed in successfully") {
                    alert("Sign in successful!");
                    $('#signInModal').css('display', 'none');
                    $('.auth-buttons').html(`<p>Hello, ${username}!</p>`);
                    localStorage.setItem('username', username);  // Store username for session persistence
                    $('#userLogo').show(); // Show user logo after sign-in (ADD THIS LINE)
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

    // Function to add an agent box
    $('.workflow-action-button').eq(0).on('click', function () {
        const agentName = `Agent ${agentCounter}`;
        const agentBox = $(`<div class="workflow-agent-box">${agentName}</div>`);
        $('.workflow-agent-grid').append(agentBox);
        agentCounter++;
    });

    // Function to delete the last agent box
    $('.workflow-action-button').eq(4).on('click', function () {
        $('.workflow-agent-grid .workflow-agent-box').last().remove();
    });

    // Function to add a connection
    $('.workflow-action-button').eq(1).on('click', function () {
        const connectionInput = $('#workflow-textarea').val();
        const [agent1, agent2] = connectionInput.split(" AND ").map(a => a.trim());

        const agentBox1 = $(`.workflow-agent-box:contains(${agent1})`).first();
        const agentBox2 = $(`.workflow-agent-box:contains(${agent2})`).first();

        if (agentBox1.length && agentBox2.length) {
            const line = $('<div class="connection-line"></div>');
            line.css({
                position: 'absolute',
                background: 'black',
                height: '2px'
            });
            $('body').append(line);
            drawLine(line, agentBox1, agentBox2);
            connections.push({ line, agent1, agent2, hidden: false });
        } else {
            alert("Please enter valid agent names separated by 'AND'.");
        }
    });

    // Function to highlight the last connection
    $('.workflow-action-button').eq(3).on('click', function () {
        if (connections.length) {
            const lastConnection = connections[connections.length - 1];
            lastConnection.line.css('background', 'red');
        }
    });

    // Function to delete the last connection
    $('.workflow-action-button').eq(2).on('click', function () {
        if (connections.length) {
            const lastConnection = connections.pop();
            lastConnection.line.remove();
        }
    });

    // Function to hide/show connections
    $('.workflow-action-button').eq(5).on('click', function () {
        connections.forEach(connection => {
            if (!connection.hidden) {
                connection.line.hide();
                connection.hidden = true;
            } else {
                connection.line.show();
                connection.hidden = false;
            }
        });
    });

    // Utility function to draw a line between two boxes
    function drawLine(line, box1, box2) {
        const pos1 = box1.offset();
        const pos2 = box2.offset();
        const x1 = pos1.left + box1.outerWidth() / 2;
        const y1 = pos1.top + box1.outerHeight() / 2;
        const x2 = pos2.left + box2.outerWidth() / 2;
        const y2 = pos2.top + box2.outerHeight() / 2;

        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        line.css({
            left: `${x1}px`,
            top: `${y1}px`,
            width: `${length}px`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: '0 0'  // Sets the rotation origin at the start of the line
        });
    }

    // Reposition lines on window resize
    $(window).resize(function () {
        connections.forEach(connection => {
            const agentBox1 = $(`.workflow-agent-box:contains(${connection.agent1})`).first();
            const agentBox2 = $(`.workflow-agent-box:contains(${connection.agent2})`).first();
            if (agentBox1.length && agentBox2.length) {
                drawLine(connection.line, agentBox1, agentBox2);
            }
        });
    });

    // Handle Logout Confirmation
    $('#confirmLogout').on('click', function () {
        localStorage.removeItem('username'); // Clear username from localStorage
        $('.auth-buttons').html(`
            <button id="signInBtn">Sign In</button>
            <button id="registerBtn">Register</button>
        `); // Reset to Sign In and Register buttons
        $('#logoutPopup').hide(); // Hide the popup
        $('#userLogo').hide(); // Hide the user icon after logging out
    });

    // Hide the popup if clicked outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#userLogo').length && !$(e.target).closest('#logoutPopup').length) {
            $('#logoutPopup').hide();
        }
    });
});