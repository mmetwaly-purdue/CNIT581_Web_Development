$(document).ready(function () {
    console.log("MAIN JS IS HERE");
    console.log('main.js loaded');
    function getCSRFTokenFromCookie() {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('csrftoken=')) {
                return cookie.substring('csrftoken='.length, cookie.length);
            }
        }
        console.error('CSRF token not found in cookies.');
        return null;
    }    
    const connections = []; // Store all connections
    const highlights = {};  // Store user highlights
    const agentColors = {}; // Store a consistent color per agent
    let ascending = true; // Variable to track sort order
    let summaryText = "";

    

    // Function to render agent buttons
    function renderAgentButtons() {
        const agentsContainer = $('.agents-container');
        agentsContainer.empty(); // Clear the container before appending

        if (typeof agent_list !== 'undefined' && agent_list.length > 0) {
            agent_list.forEach((agent, index) => {
                agentsContainer.append(`
                    <a href="/agent_detail/${index}">
                        <button class="agent-button">${agent.name}</button>
                    </a>
                `);
            });
        }
    }

    // Call the function to display the agents when the page loads
    renderAgentButtons();

    // Handle sorting when button is clicked
    $('#sort-button').on('click', function () {
        // Toggle between ascending and descending
        ascending = !ascending;

        // Sort the agent list based on the current sort order
        if (ascending) {
            agent_list.sort((a, b) => a.name.localeCompare(b.name)); // A-Z
            $(this).text('Sort: A-Z');
        } else {
            agent_list.sort((a, b) => b.name.localeCompare(a.name)); // Z-A
            $(this).text('Sort: Z-A');
        }

        // Re-render the agent buttons after sorting
        renderAgentButtons();

        // Clear existing agent buttons and repopulate them after sorting
        const agentsContainer = $('.agents-container');
        agentsContainer.empty();
        agent_list.forEach((agent, index) => {
            agentsContainer.append(`
                <a href="/agent_detail/${index}">
                    <button class="agent-button">${agent.name}</button>
                </a>
            `);
        });
    });
    
    // Handle adding a connection
    $('#addConnectionButton').on('click', function () {
        const connectionInput = $('#workflow-textarea').val();
        storeConnection('Add Connection', connectionInput);
    });

        // Handle deleting a connection (similar to adding)
    $('#deleteConnectionButton').on('click', function () {
        const connectionInput = $('#workflow-textarea').val(); // Assuming it's from the same textarea
        storeConnection('Delete Connection', connectionInput);
    });



    // Delete agent logic (when "Delete Agent" mode is enabled)
    $('#delete-agent-mode').on('click', function () {
        deleteAgentMode(); // Call the function to delete agents
    });

    // Store connection function
    function storeConnection(buttonPressed, connectionText) {
        $.ajax({
            url: '/store_connection/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                button: buttonPressed,
                connection_text: connectionText
            }),
            success: function (response) {
                console.log(response.message);
                // Clear the input field after storing the connection
                $('#workflow-textarea').val('');
            },
            error: function (error) {
                console.error('Error:', error);
                alert('Failed to store connection.');
            }
        });
    }

    // Function to delete agent from the list based on name
    function deleteAgentMode() {
        const agentName = prompt("Enter the name of the agent you want to delete:");

        if (agentName !== null && agentName.trim() !== '') {
            // Find the index of the agent with the specified name
            const agentIndex = agent_list.findIndex(agent => agent.name.toLowerCase() === agentName.trim().toLowerCase());

            if (agentIndex !== -1) {
                // Remove the agent from agent_list
                agent_list.splice(agentIndex, 1);
                alert(`Agent "${agentName}" deleted successfully!`);
                
                // Re-render the agent buttons after deletion
                renderAgentButtons();
            } else {
                alert(`Agent "${agentName}" not found.`);
            }
        } else {
            alert('Please enter a valid agent name.');
        }
    }

    // New logic for displaying the summary of all connections
    $('#summaryButton').on('click', function () {
        if (summaryText === "") {
            console.log("No highlights available to display.");
            $('#summary-textarea').val("No highlights available.");
        } else {
            // Paste the summaryText into the summary text area or output it as desired
            $('#summary-textarea').val(summaryText);
    
            // Log the summaryText variable
            console.log("Current summaryText: ", summaryText);
        }
        console.log('Summary button clicked');
        // Fetch the summary from the backend
        $.ajax({
            url: '/get_summary/',
            method: 'GET',
            success: function (response) {
                // Display the summary in the new summary text area
                let currentContent = $('#summary-textarea').val();
                $('#summary-textarea').val(currentContent + response.summary);
                console.log("Successfuly displayed summary")
            },
            error: function (error) {
                console.error('Error:', error);
                alert('Failed to fetch summary.');
            }
        });
    });

    // Show Logout Popup on User Icon Click
    $('#userLogo').on('click', function () {
        $('#logoutPopup').toggle();
    });

    //---------------------------------------------------------------------------------------//
    // Open modals
    $('#registerBtn').on('click', function () {
        $('#registerModal').css('display', 'flex'); // Show Register Modal
    });

    $('#signInBtn').on('click', function () {
        $('#signInModal').css('display', 'flex'); // Show Sign In Modal
    });

    // Close modals
    $('.close').on('click', function () {
        $('.modal').css('display', 'none'); // Hide all modals
    });

    // Handle Register Form Submission
    $('#registerForm').on('submit', function (event) {
        event.preventDefault();
        const first_name = $('#registerFirstName').val();
        const last_name = $('#registerLastName').val();
        const email = $('#registerEmail').val();
        const password = $('#registerPassword').val();
    
        $.ajax({
            url: '/register/',
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFTokenFromCookie() },
            contentType: 'application/json',
            data: JSON.stringify({ first_name, last_name, email, password }),
            success: function (response) {
                console.log('Registration successful:', response);
                alert(response.message);
                $('#registerModal').css('display', 'none');
            },
            error: function (error) {
                console.error('Registration failed:', error);
                alert('Failed to register: ' + (error.responseJSON?.message || error.responseText));
            }
        });
    });
    // Handle Sign-In Form Submission
    $('#signInForm').on('submit', function (event) {
        event.preventDefault();
        const username = $('#signInUsername').val(); // Using email as username
        const password = $('#signInPassword').val();

        $.ajax({
            url: '/signin/',
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFTokenFromCookie() },
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: function (response) {
                console.log('Sign-in successful:', response);
                $('#signInModal').css('display', 'none'); // Hide the modal

                // Dynamically update the navigation bar
                $('.auth-buttons').html(`<p>Hello, ${response.username}!</p>`);

                // Show user-specific content (like the workflow grid)
                $('#userLogo').show();
                $('.workflow-agent-grid').show();
                location.reload();
            },
            error: function (error) {
                console.error('Sign-in failed:', error);
                alert('Sign-in failed. Please check your credentials.');
            }
        });
    });



    //---------------------------------------------------------------------------------------//
   // Apply highlight to agent names in the header
    function highlightAgentName(agentBox, color) {
        const header = $(agentBox).find('h4');
        const agentName = header.text();
        header.html(`<span style="background-color:${color};">${agentName}</span>`);
    }

    // Add Connection with consistent color for connected agents
    $('.workflow-action-button').eq(0).on('click', function () {
        const connectionInput = $('#workflow-textarea').val();
        const [agent1Text, agent2Text] = connectionInput.split(" AND ").map(str => str.trim());
        const agentBox1 = $(`.workflow-agent-box:contains("${agent1Text}")`).first();
        const agentBox2 = $(`.workflow-agent-box:contains("${agent2Text}")`).first();

        if (agentBox1.length && agentBox2.length) {
            // Assign or reuse a color for this connection
            const connectionColor = agentColors[agent1Text] || getRandomColor();
            agentColors[agent1Text] = connectionColor;
            agentColors[agent2Text] = connectionColor;

            // Highlight both agent names in headers with the same color
            highlightAgentName(agentBox1, connectionColor);
            highlightAgentName(agentBox2, connectionColor);

            // Draw line between connected agents
            const line = $('<div class="connection-line"></div>').css({
                background: connectionColor,
                height: '2px'
            });
            $('body').append(line);
            drawLine(line, agentBox1, agentBox2);

            connections.push({ line, agent1Text, agent2Text, color: connectionColor });
        } else {
            alert("Enter valid agent texts in format: Agent1 Text AND Agent2 Text.");
        }
    })

    // Draw a line between two agent boxes
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
            // Remove associated connections
            connections.forEach((connection, index) => {
                if (connection.agent1Text === agentToDelete || connection.agent2Text === agentToDelete) {
                    connection.line.remove(); // Remove the line from the DOM
                    connections.splice(index, 1); // Remove connection from the array
                    console.log(`Connection removed for agent: ${agentToDelete}`);
                }
            });

            // Remove the agent box itself
            agentBox.remove();
            $('#deleteAgentModal').hide();
            $('#agentToDelete').val(''); // Clear input after deletion

            console.log(`Agent ${agentToDelete} and associated connections deleted.`);
        } else {
            alert("Agent not found. Please enter the correct agent name.");
        }
    })

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
    });

    // Function to save highlights for the session and update the summary
function saveHighlight(agentName, start, end, color) {
    if (!highlights[agentName]) {
        highlights[agentName] = [];
    }

    // Save the highlight into the highlights object
    highlights[agentName].push({ start, end, color });

    // Log to ensure the highlight is being saved
    console.log(`Highlight saved for agent ${agentName}: Start ${start}, End ${end}, Color ${color}`);

    // Automatically update the summaryText with the new highlight
    summaryText += `Highlight saved for agent ${agentName}: Start ${start}, End ${end}, Color ${color}\n`;

    // Log to ensure summaryText is being updated
    console.log("Updated summary text: ", summaryText);
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
            url: '/create_agent/',
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

    // Handle Logout
    $('#confirmLogout').on('click', function () {
        $.ajax({
            url: '/logout/',
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFToken() },
            success: function () {
                alert('Logged out successfully.');
                location.reload(); // Reload to reflect logged-out state
            },
            error: function (error) {
                console.error('Logout failed:', error);
                alert('Failed to log out. Please try again.');
            }
        });
    });
});
