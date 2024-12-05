$(document).ready(function () {
    const connections = []; // Store all connections
    const all_connections = [];
    const highlights = {};  // Store user highlights
    const agentColors = {}; // Store a consistent color per agent
    const deleted_agents = []
    const deleted_connections = []
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
        //all_connections.push({ agent1Text: agent1, agent2Text: agent2});
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
        deleted_connections.push(connection);
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
        // Highlight the connection by changing its color
        connection.line.css('background-color', 'red'); // Highlight color
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
    // Handle click on Highlight Text button
    $(document).on('click', '.highlight-text-button', function () {
        const agentName = $(this).data('agent');
        const agentBox = $(`.workflow-agent-box[data-agent="${agentName}"]`);
        const documentContent = agentBox.find('.document-content');

        // Enable text selection and apply highlights
        documentContent.attr('contenteditable', 'true');
        documentContent.addClass('highlight-mode');

        alert(`You can now highlight text in the document for agent: ${agentName}`);
    });

    $('.document-content').on('mouseup', function () {
        const selection = window.getSelection();
        if (selection.isCollapsed) return; // No text selected
    
        const selectedText = selection.toString().trim();
        const agentName = $(this).closest('.workflow-agent-box').data('agent');
    
        if (!highlights[agentName]) {
            highlights[agentName] = [];
        }
    
        // Save and apply the highlight immediately
        if (!highlights[agentName].includes(selectedText)) {
            highlights[agentName].push(selectedText);
    
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.className = 'user-highlight'; // Apply user highlight class
            span.textContent = selectedText;
            range.deleteContents();
            range.insertNode(span);
    
            console.log(`Highlight applied and saved for ${agentName}:`, selectedText);
        }
    
        // Clear the selection
        selection.removeAllRanges();
    })

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
    
        // Send the delete request to the server
        $.ajax({
            url: '/delete_agent/', // Backend endpoint for deleting the agent
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFTokenFromCookie() }, // Include CSRF token
            contentType: 'application/json',
            data: JSON.stringify({ agent_name: selectedAgent }), // Send the agent name to delete
            success: function (response) {
                alert(response.message);
                // Add the deleted agent to a tracking variable
                deleted_agents.push(selectedAgent);
                // Remove the agent box from the DOM
                $(`.workflow-agent-box[data-agent="${selectedAgent}"]`).remove();
    
                // Remove the agent from the dropdown
                $(`#delete-agent-dropdown option[value="${selectedAgent}"]`).remove();
    
                // Update the dropdown options to reflect the change
                updateAgentDropdowns();
            },
            error: function (error) {
                alert('Failed to delete the agent. Please try again.');
                console.error('Deletion error:', error);
            }
        });
    });

    $('#summaryButton').on('click', function () {
        const summaryDiv = $('#summaryDisplay');
        summaryDiv.empty(); // Clear previous content
        summaryDiv.append('<h3>Summary</h3>');
    
        // Collect data for summary
        const summaryData = {
            documents_used: [],
            agents_used: [],
            connections_made: connections.map(conn => `${conn.agent1Text} - ${conn.agent2Text}`),
            connections_deleted: deleted_connections.map(conn => `${conn.agent1Text} - ${conn.agent2Text}`),
            deleted_agents: deleted_agents
        };
    
        // Iterate over workflow agent boxes to gather agent and document names
        $('.workflow-agent-box').each(function () {
            const agentName = $(this).data('agent');
            const documentName = $(this).data('document'); // Retrieve document name
            const agentHighlights = highlights[agentName] || []; // Get highlights for the agent
    
            // Format highlights into the summary
            const formattedHighlights = agentHighlights.join(', ');
    
            // Add document and agent to "documents_used" and "agents_used" arrays
            if (documentName && !summaryData.documents_used.includes(documentName)) {
                summaryData.documents_used.push(documentName);
            }
            if (agentName && !summaryData.agents_used.includes(agentName)) {
                summaryData.agents_used.push(agentName);
            }
    
            // Append agent and document-specific highlights to the summary
            summaryDiv.append(`<p><strong>Annotation ${agentName} - ${documentName}:</strong> ${formattedHighlights || 'None'}</p>`);
        });
    
        // Append other summary details
        summaryDiv.append('<p><strong>Documents Used:</strong> ' + (summaryData.documents_used.join(', ') || 'None') + '</p>');
        summaryDiv.append('<p><strong>Agents Used:</strong> ' + (summaryData.agents_used.join(', ') || 'None') + '</p>');
        summaryDiv.append('<p><strong>Connections Made:</strong> ' + (summaryData.connections_made.join(', ') || 'None') + '</p>');
        summaryDiv.append('<p><strong>Connections Deleted:</strong> ' + (summaryData.connections_deleted.join(', ') || 'None') + '</p>');
        summaryDiv.append('<p><strong>Deleted Agents:</strong> ' + (summaryData.deleted_agents.join(', ') || 'None') + '</p>');
    
        summaryDiv.css('display', 'block'); // Ensure the summary section is visible
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

    // Fetch agent_list from the API
    let agent_list = [];
    // Fetch agent_list from the API
    $.ajax({
        url: '/api/agent-list/', // Ensure this matches your Django route
        method: 'GET',
        success: function (response) {
            // Assign the response data to the outer scoped variable
            agent_list = response.agents;
            console.log("Agent list loaded:", agent_list);
        },
        error: function () {
            console.error('Failed to load agent list.');
        }
    });

    // Define the function to get agent name by ID
    function getAgentNameById(id) {
        const agent = agent_list.find(agent => agent.id === parseInt(id, 10));
        if (!agent) {
            console.error(`Agent with ID ${id} not found.`);
        }
        return agent ? agent.name : null;
    }

    $('#run-agent-button').on('click', function () {
        const url = window.location.href;
        const idToUse = url[url.length - 2]
        const selectedDocument = $('#document-dropdown').val();
        const agentId = idToUse
        const agentName = getAgentNameById(agentId);
        console.log({ agent: agentName, document: selectedDocument });
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
                // Redirect to workflow
                window.location.href = '/workflow/';
            },
            error: function (error) {
                alert('Failed to run the agent.');
            }
        });
    });

    // Function to get CSRF Token
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

    // Function to load all document content on the workflow page
    function loadAllWorkflowContent() {
        $('.workflow-agent-box').each(function () {
            const documentName = $(this).data('document'); // Get document name
            const contentContainer = $(this).find('.document-content'); // Target content container

            console.log(`Loading content for document: ${documentName}`);
            const filePath = `/static/uploads/${documentName}`;

            $.get(filePath)
                .done(function (data) {
                    console.log(`Content loaded for ${documentName}:`, data);
                    contentContainer.text(data); // Update the content
                })
                .fail(function () {
                    console.error(`Failed to load content for ${documentName}`);
                    contentContainer.text('Failed to load content.');
                });
        });
    }

    // Load workflow content on page load
    loadAllWorkflowContent();

    // Handle Run Gemini Button Click
    $('.run-gemini-button').on('click', function () {
        const selectedBox = $(this).closest('.workflow-agent-box'); // Find the closest agent box
        const agentName = selectedBox.data('agent'); // Get the agent name
        const contentContainer = selectedBox.find('.document-content'); // Target the content container
        const documentContent = contentContainer.text().trim(); // Get document content
    
        console.log("Processing document for Gemini:", { agentName, documentContent });
    
        if (!documentContent || documentContent === 'Loading...' || documentContent === 'Failed to load content.') {
            alert(`No valid document content found for agent "${agentName}".`);
            return;
        }
    
        // Save existing highlights to the global `highlights` object
        if (!highlights[agentName]) {
            highlights[agentName] = [];
        }

        const savedHighlights = highlights[agentName]; // User highlights

        // Process the document content with Gemini
        $.ajax({
            url: '/run_gemini/',
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFTokenFromCookie() },
            data: { document_content: documentContent, agent_name: agentName },
            success: function (response) {
                let wordsToHighlight = response.response; // Assuming the response is a string of words
                console.log(`Gemini Response for ${agentName}:`, wordsToHighlight);
    
                // Ensure wordsToHighlight is an array
                if (typeof wordsToHighlight === 'string') {
                    wordsToHighlight = wordsToHighlight.split(',').map(word => word.trim());
                }

                // Replace content with Gemini response
                contentContainer.text(response.updated_content || documentContent);

                // Merge user and Gemini highlights
                const combinedHighlights = [...new Set([...savedHighlights, ...wordsToHighlight])];

                // Apply combined highlights
                highlightWords(contentContainer, combinedHighlights);

                // Update highlights array
                highlights[agentName] = combinedHighlights;

                //highlights.push(wordsToHighlight)
                //highlightWords(contentContainer, wordsToHighlight);
                // Reapply highlights after modification

            },
            error: function (error) {
                console.error("Error processing with Gemini:", error);
            }
        });
    });
    
    // Function to highlight words in a container
    function highlightWords(container, words) {
        const content = container.text(); // Get the plain text of the container
        const regex = new RegExp(`\\b(${words.join('|')})\\b`, 'gi'); // Match all words
    
        // Replace matched words with spans
        const highlightedContent = content.replace(regex, (match) => {
            return `<span class="highlight">${match}</span>`;
        });
    
        container.html(highlightedContent); // Update the DOM with highlighted content
    }
    

    function loadDocumentContent(agentId, documentName) {
        const filePath = `/static/uploads/${documentName}`; // Path to the file
        console.log("Attempting to fetch file from:", filePath);
    
        $.get(filePath, function (data) {
            console.log("File Content Received:", data); // Debug the received data
            $(`#${agentId} .document-content`).text(data); // Display content
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
