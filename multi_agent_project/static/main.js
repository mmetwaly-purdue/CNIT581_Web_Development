$(document).ready(function () {
    const connections = []; // Store all connections
    const highlights = {};  // Store user highlights
    const agentColors = {}; // Store a consistent color per agent
    let ascending = true; // Variable to track sort order
    let summaryText = "";
 
    
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

    // Function to render agent buttons
    function renderAgentButtons() {
        const agentsContainer = $('.agents-container');
        agentsContainer.empty(); // Clear the container before appending
    
        if (typeof agent_list !== 'undefined' && agent_list.length > 0) {
            agent_list.forEach((agent) => {
                agentsContainer.append(`
                    <div class="agent">
                        <h3>${agent.name}</h3>
                        <p>Type: ${agent.type}</p>
                        <button class="view-details" data-agent-id="${agent.id}">View Details</button>
                    </div>
                `);
            });
        }
    }
    
    // Call the function to display the agents when the page loads
    document.addEventListener("DOMContentLoaded", function () {
        console.log("Calling renderAgentButtons...");
        renderAgentButtons();
    });
    
    // Handle sorting
    $('#sort-button').on('click', function () {
        const currentOrder = $(this).data('sort-order'); // Get current sort order
        const newOrder = currentOrder === 'asc' ? 'desc' : 'asc'; // Toggle sort order
        window.location.href = `/agents/?sort=${newOrder}`; // Reload page with new sort order
    });
   
    
    // Dynamically populate dropdown
    // Function to dynamically populate agent dropdowns
    function updateAgentDropdowns() {
        const agentDropdowns = ['#agent1', '#agent2', '#delete-agent-dropdown'];
        agentDropdowns.forEach(selector => {
            const dropdown = $(selector);
            dropdown.empty();
            dropdown.append('<option value="" disabled selected>Select an Agent</option>');
            $('.workflow-agent-box').each(function () {
                const agentName = $(this).find('h4').text();
                dropdown.append(`<option value="${agentName}">${agentName}</option>`);
            });
        });
    }

    // Function to update connections dropdown
    function updateConnectionsDropdown() {
        const dropdown = $('#connectionsDropdown');
        dropdown.empty();
        dropdown.append('<option value="" disabled selected>--Select Connection--</option>');
        connections.forEach((connection, index) => {
            dropdown.append(`<option value="${index}">${connection.agent1Text} AND ${connection.agent2Text}</option>`);
        });
    }

    // Function to redraw connection lines
    function redrawConnections() {
        connections.forEach(connection => {
            const { line, agent1Text, agent2Text } = connection;
            const agentBox1 = $(`.workflow-agent-box:contains("${agent1Text}")`).first();
            const agentBox2 = $(`.workflow-agent-box:contains("${agent2Text}")`).first();
            if (agentBox1.length && agentBox2.length) {
                drawLine(line, agentBox1, agentBox2);
            }
        });
    }

    // Add Connection
    $('#addConnectionButton').on('click', function () {
        const agent1 = $('#agent1').val();
        const agent2 = $('#agent2').val();

        if (!agent1 || !agent2) {
            alert('Please select both agents to create a connection.');
            return;
        }

        const connection = { agent1Text: agent1, agent2Text: agent2, line: $('<div class="connection-line"></div>') };
        connections.push(connection);
        $('body').append(connection.line);
        redrawConnections();
        updateConnectionsDropdown();
        alert('Connection added successfully.');
    });

    // Delete Connection
    $('#deleteConnectionButton').on('click', function () {
        const selectedIndex = $('#connectionsDropdown').val();
        if (!selectedIndex) {
            alert('Please select a connection to delete.');
            return;
        }

        const connection = connections[selectedIndex];
        connection.line.remove();
        connections.splice(selectedIndex, 1);
        updateConnectionsDropdown();
        redrawConnections();
        alert('Connection deleted successfully.');
    });

    // Update agent dropdowns on page load and agent changes
    document.addEventListener('DOMContentLoaded', function () {
        updateAgentDropdowns();
        updateConnectionsDropdown();
    });

    // Redraw connections on window resize to handle layout changes
    $(window).on('resize', redrawConnections);

    // Highlight Connection
    $('#highlightConnectionButton').on('click', function () {
        const selectedIndex = $('#connectionsDropdown').val();
        if (selectedIndex === "") {
            alert('Please select a connection to highlight.');
            return;
        }

        const connection = connections[selectedIndex];
        console.log(`Highlighting connection: ${connection.agent1Text} AND ${connection.agent2Text}`);
        alert('Connection highlighted successfully.');
    });

    // Hide Connection
    $('#hideConnectionButton').on('click', function () {
        const selectedIndex = $('#connectionsDropdown').val();
        if (selectedIndex === "") {
            alert('Please select a connection to hide.');
            return;
        }

        const connection = connections[selectedIndex];
        console.log(`Hiding connection: ${connection.agent1Text} AND ${connection.agent2Text}`);
        alert('Connection hidden successfully.');
    });

    function storeConnection(buttonPressed, connectionText) {
        $.ajax({
            url: '/store_connection/',
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFTokenFromCookie() },
            contentType: 'application/json',
            data: JSON.stringify({
                button: buttonPressed,
                connection_text: connectionText
            }),
            success: function (response) {
                alert(response.message);
                $('#agent1, #agent2').prop('selectedIndex', 0); // Reset dropdowns
            },
            error: function (error) {
                console.error('Error:', error);
                alert('Failed to store connection.');
            }
        });
    }

    // Handle deletion
    $('#delete-agent-mode').on('click', function () {
        const agentName = prompt("Enter the name of the agent to delete:");
        if (!agentName) {
            alert("No agent name provided.");
            return;
        }

        // Find the agent to delete
        const agentToDelete = Array.from(document.querySelectorAll('.agent h3'))
            .find(h3 => h3.textContent.toLowerCase() === agentName.toLowerCase());

        if (!agentToDelete) {
            alert("Agent not found.");
            return;
        }

        const agentId = agentToDelete.closest('.agent').querySelector('.view-details').dataset.agentId;

        // Send request to delete agent
        $.ajax({
            url: '/delete_agent/',
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFTokenFromCookie() },
            contentType: 'application/json',
            data: JSON.stringify({ agent_id: parseInt(agentId) }),
            success: function (response) {
                alert(response.message);
                window.location.reload(); // Reload page after deletion
            },
            error: function () {
                alert('Failed to delete agent.');
            }
        });
    });
    
    $('#delete-agent-button').on('click', function () {
        const selectedAgent = $('#delete-agent-dropdown').val();
    
        if (!selectedAgent) {
            alert('Please select an agent to delete.');
            return;
        }
    
        // Find and remove the agent box
        const agentBox = Array.from(document.querySelectorAll('.workflow-agent-box'))
            .find(box => box.querySelector('h4').textContent.startsWith(selectedAgent));
    
        if (agentBox) {
            agentBox.remove(); // Remove the agent box from the DOM
            alert(`Agent "${selectedAgent}" deleted successfully.`);
            $('#delete-agent-dropdown').val(""); 
            updateAgentDropdowns();// Reset the dropdown
        } else {
            alert(`Agent "${selectedAgent}" not found.`);
        }
    });

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

    //---------------------------------------------------------------------------------------//
    //Documents Page Javascript code
    $(document).on('click', '.document-button', function () {
        const documentItem = $(this).closest('.document-item');
        const contentContainer = documentItem.find('.document-content');
    
        // Toggle visibility
        if (contentContainer.hasClass('hidden')) {
            $('.document-content').addClass('hidden'); // Hide all other content containers
            contentContainer.removeClass('hidden').text($(this).data('doc')); // Show current container with text
        } else {
            contentContainer.addClass('hidden'); // Hide the container if already visible
        }
    });
    //---------------------------------------------------------------------------------------//
    // Open and close modals
    $('#registerBtn').on('click', function () {
        $('#registerModal').css('display', 'flex'); 
    });

    $('#signInBtn').on('click', function () {
        $('#signInModal').css('display', 'flex');
    });

    $('.close').on('click', function () {
        $('.modal').css('display', 'none');
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
                alert(response.message);
                $('#registerModal').css('display', 'none');
            },
            error: function (error) {
                alert('Failed to register. Please try again.');
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
                $('#signInModal').css('display', 'none'); // Hide the modal

                // Dynamically update the navigation bar
                $('.auth-buttons').html(`
                    <p>Hello, ${response.username}!</p>
                `);

                // Show user-specific content (like the workflow grid)
                $('#userLogo').show();
                $('.workflow-agent-grid').show();
                location.reload(); 
            },
            error: function (error) {
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

    // Function to dynamically update document dropdown
    function updateDocumentDropdown() {
        const dropdown = $('#document-dropdown');
        dropdown.empty();
        dropdown.append('<option value="" disabled selected>Select a Document</option>');
        
        $.get('/get_documents/', function (response) {
            response.documents.forEach(doc => {
                dropdown.append(`<option value="${doc.name}">${doc.name}</option>`);
            });
        });
    }

    // Handle upload form submission
    $('#upload-form').on('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(this);

        $.ajax({
            url: '/upload_document/',
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFTokenFromCookie() },
            processData: false,
            contentType: false,
            data: formData,
            success: function (response) {
                alert('Document uploaded successfully!');
                updateDocumentDropdown(); // Update document list dynamically
            },
            error: function (error) {
                alert('Failed to upload the document.');
            }
        });
    });

    $('#run-agent-button').on('click', function () {
        const selectedDocument = $('#document-dropdown').val();
        const agentName = '{{ agent.name }}'; // Pass agent name dynamically from the server
        const agentId = '{{ agent.id }}'; // Assuming each agent has a unique ID
    
        if (!selectedDocument) {
            alert('Please select a document to run the agent.');
            return;
        }
    
        // Simulate running the agent with the document
        $.ajax({
            url: '/run_agent/',
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFTokenFromCookie() },
            contentType: 'application/json',
            data: JSON.stringify({ agent: agentName, document: selectedDocument }),
            success: function (response) {
                alert(`Agent "${agentName}" ran successfully on document "${selectedDocument}".`);
                // Load the document content into the agent box
                window.location.href = '/workflow/';
                loadDocumentContent(agentId, selectedDocument);
                location.reload();
            },
            error: function (error) {
                alert('Failed to run the agent.');
            }
        });
    });
    // Function to load document content into an agent box
    function loadDocumentContent(agentId, documentName) {
        const filePath = `/static/uploads/${documentName}`; // Adjust the path to match where your documents are stored
        $.get(filePath, function (data) {
            $(`#${agentId} .document-content`).text(data); // Load content into the appropriate agent box
        }).fail(function () {
            alert('Failed to load document content.');
        });
    }

    //---------------------------------------------------------------------------------------//
    // Handle Logout Popup
    $('#userLogo').on('click', function () {
        $('#logoutPopup').toggle(); // Toggle visibility of the logout popup
    });

    // Confirm Logout
    $('#confirmLogout').on('click', function () {
        $.ajax({
            url: '/logout/',
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFTokenFromCookie() },
            success: function () {
                location.reload(); // Reload to reflect the logged-out state
            },
            error: function (error) {
                console.error('Logout failed:', error);
                alert('Failed to log out. Please try again.');
            }
        });
    });

    // Close the logout popup when clicking outside of it
    $(window).on('click', function (event) {
        if (!$(event.target).closest('#userLogo, #logoutPopup').length) {
            $('#logoutPopup').hide();
        }
    });
});
