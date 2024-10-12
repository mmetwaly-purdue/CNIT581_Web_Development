$(document).ready(function () {
    // Check if user is signed in and set up user interface
    const storedUsername = localStorage.getItem('username');
    const connections = []; // Store all connections
    const highlights = {}; // Store user highlights
    const agentColors = {}; // Store a consistent color per agent


    //---------------------------------------------------------------------------------------//
    if (storedUsername) {
        $('.auth-buttons').html(`<p>Hello, ${storedUsername}!</p>`);
        $('#userLogo').show();
        $('.workflow-agent-grid').show();
    } else {
        $('#userLogo').hide();
        $('.workflow-agent-grid').hide();
    }

    // Show Logout Popup on User Icon Click
    $('#userLogo').on('click', function () {
        $('#logoutPopup').toggle();
    });

    // Sign-In & Register Modal Logic
    $('#signInBtn').on('click', function () {
        $('#signInModal').css('display', 'flex');
    });

    $('#registerBtn').on('click', function () {
        $('#registerModal').css('display', 'flex');
    });

    $('#closeSignIn').on('click', function () {
        $('#signInModal').css('display', 'none');
    });

    $('#closeRegister').on('click', function () {
        $('#registerModal').css('display', 'none');
    });

    //---------------------------------------------------------------------------------------//
    $(window).on('click', function (event) {
        if (event.target === document.getElementById('signInModal')) {
            $('#signInModal').css('display', 'none');
        }
        if (event.target === document.getElementById('registerModal')) {
            $('#registerModal').css('display', 'none');
        }
    });

    //---------------------------------------------------------------------------------------//
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
                    localStorage.setItem('username', username);
                    $('.auth-buttons').html(`<p>Hello, ${username}!</p>`);
                    $('#userLogo').show();
                    $('.workflow-agent-grid').show();
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

    // Handle Sign-In Form Submission
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
                    localStorage.setItem('username', username);
                    $('.auth-buttons').html(`<p>Hello, ${username}!</p>`);
                    $('#userLogo').show();
                    $('.workflow-agent-grid').show();
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

    //---------------------------------------------------------------------------------------//
    // ** Add Connection with Highlighting **
    $('.workflow-action-button').eq(0).on('click', function () {
        const connectionInput = $('#workflow-textarea').val();
        const [agent1Text, agent2Text] = connectionInput.split(" AND ").map(str => str.trim());
        const agentBox1 = $(`.workflow-agent-box:contains("${agent1Text}")`).first();
        const agentBox2 = $(`.workflow-agent-box:contains("${agent2Text}")`).first();

        if (agentBox1.length && agentBox2.length) {
            const line = $('<div class="connection-line"></div>').css({ background: 'black', height: '2px' });
            $('body').append(line);
            drawLine(line, agentBox1, agentBox2);

            // Highlight the texts in each box with the same color
            const highlightColor = 'lightblue';
            highlightText(agentBox1, agent1Text, highlightColor);
            highlightText(agentBox2, agent2Text, highlightColor);

            connections.push({ line, agent1Text, agent2Text, highlightColor });
        } else {
            alert("Enter valid agent texts in format: Agent1 Text1 AND Agent2 Text2.");
        }
    });

    // ** Draw Line Between Boxes **
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
            transformOrigin: '0 0'
        });
    }

    // ** Hide All Connections **
    $('.workflow-action-button').eq(4).on('click', function () {
        connections.forEach(connection => {
            connection.line.toggle(); // Toggle visibility
        });
    });

    // ** Highlight All Connections in Red **
    $('.workflow-action-button').eq(2).on('click', function () {
        connections.forEach(connection => {
            connection.line.css('background', 'red');
        });
    });
    
    //---------------------------------------------------------------------------------------//
    // ** Open Delete Agent Modal when button is clicked **
    $('.workflow-action-button').eq(3).on('click', function () {
        $('#deleteAgentModal').show(); // Display the modal to confirm deletion
    });

    // ** Confirm Delete Agent by Name **
    $('#confirmDeleteAgent').on('click', function () {
        const agentToDelete = $('#agentToDelete').val().trim();
        const agentBox = $(`.workflow-agent-box:contains("${agentToDelete}")`).filter(function() {
            return $(this).text().includes(agentToDelete);
        }).first();

        if (agentBox.length) {
            agentBox.remove();
            $('#deleteAgentModal').hide();
            $('#agentToDelete').val(''); // Clear input after deletion
        } else {
            alert("Agent not found. Please enter the correct agent name.");
        }
    });

    // Close Delete Agent Modal
    $('#closeDeleteAgentModal').on('click', function () {
        $('#deleteAgentModal').hide();
        $('#agentToDelete').val(''); // Clear input when closed
    });

    //---------------------------------------------------------------------------------------//
    // Function to generate a random color
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function applyHighlight(agentBox, start, end, color) {
        const documentContent = $(agentBox).find('.document-content')[0];
        const selection = window.getSelection();
    
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
    
            // Apply the highlight style
            span.style.backgroundColor = color;
            span.classList.add('highlight');
    
            // Wrap the selected text in the span
            range.surroundContents(span);
    
            // Clear the selection after applying the highlight
            selection.removeAllRanges();
        }
        console.log(`Highlight applied with color ${color}`);
    }
    
    // Event listener for text selection within any agent box
    $('.workflow-agent-box .document-content').on('mouseup', function () {
        const agentBox = $(this).closest('.workflow-agent-box');
        const agentName = agentBox.find('h4').text();
        const selection = window.getSelection();
    
        if (!selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const start = range.startOffset;
            const end = range.endOffset;
    
            // Use consistent color for each agent, generating one if agent does not already have a color
            if (!agentColors[agentName]) {
                agentColors[agentName] = getRandomColor();
            }
            const color = agentColors[agentName];
    
            applyHighlight(agentBox, start, end, color);
    
            // Save the highlight (session only for now)
            saveHighlight(agentName, start, end, color);
        }
    })

    // Function to save highlights for the session
    function saveHighlight(agentName, start, end, color) {
        if (!highlights[agentName]) {
            highlights[agentName] = [];
        }

        highlights[agentName].push({ start, end, color });
        console.log(`Highlight saved for agent ${agentName}: Start ${start}, End ${end}, Color ${color}`);
    }

    //---------------------------------------------------------------------------------------//

    // Function to create a new agent
    $('#createAgentButton').on('click', function () {
        // Collect form data
        const agentName = $('#agent-name').val().trim();
        const agentType = $('#agent-type').val().trim();
        const agentDescription = $('#agent-description').val().trim();
        const searchKeyTerms = $('#search-key-terms').val().trim();
        const outputStructure = $('#output-structure').val().trim();
        const addToGroup = $('input[name="add-to-group"]:checked').val() === 'yes';
        const groupName = addToGroup ? $('#group-name').val().trim() : '';
        const printLine = $('input[name="print-line"]:checked').val() === 'yes';
        const autoConnect = $('input[name="auto-connect"]:checked').val() === 'yes';

        // Check if agent name is provided
        if (agentName === '') {
            alert('Please enter a name for the agent.');
            return;
        }

        // Create an object to store the agent data
        const newAgent = {
            name: agentName,
            type: agentType,
            description: agentDescription,
            key_terms: searchKeyTerms,
            output_structure: outputStructure,
            group: addToGroup ? groupName : null,
            print_line: printLine,
            auto_connect: autoConnect
        };

        // Send the data to the server via POST request
        $.ajax({
            url: '/create_agent',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newAgent),
            success: function (response) {
                alert('Agent created successfully!');
                
                // Refresh the page or redirect to the agents page to see the new agent
                window.location.href = "/agents";
            },
            error: function (error) {
                alert('Failed to create the agent. Please try again.');
            }
        });
    });


    // Function to dynamically load agents on the Agents page
    function loadAgents() {
        // Retrieve existing agents from localStorage
        const agents = JSON.parse(localStorage.getItem('agents')) || [];

        // Loop through agents and create buttons for each
        agents.forEach((agent, index) => {
            addAgentButton(agent, index);
        });
    }

    // Function to create and append an agent button
    function addAgentButton(agent, index) {
        const agentButton = $('<a></a>')
            .attr('href', `/agent_detail/${index}`)
            .append($('<button></button>')
                .addClass('agent-button')
                .text(agent.name)
                .attr('data-index', index)); // Add data-index for reference

        // Append to agents container
        $('.agents-container').append(agentButton);
    }

    // Load agents if we are on the agents page
    if ($('.agents-container').length) {
        loadAgents();
    }

    //---------------------------------------------------------------------------------------//

    // Function to load document content into an agent box
    function loadDocumentContent(agentId, filePath) {
        $.get(filePath, function (data) {
            $(`#${agentId} .document-content`).text(data);
        });
    }

    //---------------------------------------------------------------------------------------//

    // Logout clears localStorage and hides workflow content
    $('#confirmLogout').on('click', function () {
        localStorage.removeItem('username');
        $('.auth-buttons').html(`
            <button id="signInBtn">Sign In</button>
            <button id="registerBtn">Register</button>
        `);
        $('#logoutPopup').hide();
        $('#userLogo').hide();
        $('.workflow-agent-grid').hide();
    });
});
